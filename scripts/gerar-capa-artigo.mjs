/**
 * gerar-capa-artigo.mjs
 *
 * Gera uma capa de blog (1200x630) tipográfica, usando os tokens visuais do
 * próprio site Vive Gostoso (cores, fontes, textura de pontos do hero) — sem
 * nenhuma foto de banco de imagem nem imagem gerada que finja ser foto real.
 *
 * Uso:
 *   node scripts/gerar-capa-artigo.mjs "<titulo>" <arquivo-de-saida.png>
 *
 * Mecanismo:
 *   - Usa `ImageResponse` de `next/og.js` (com a extensão — `next/og` sem
 *     extensão falha com "Cannot find module" quando rodado fora do Next.js).
 *   - `ImageResponse` (satori) não enxerga a folha do Google Fonts do site:
 *     cada fonte usada precisa do arquivo binário (ttf) passado em `fonts`.
 *   - As fontes são baixadas da API do Google Fonts (CSS2) usando o parâmetro
 *     `text`, recortadas para a união exata dos caracteres que este script
 *     efetivamente desenha (títulos conhecidos + marca + textos fixos da
 *     capa). O recorte é cacheado em scripts/fontes/ — caractere fora do
 *     recorte cacheado sai em branco na imagem, então ao adicionar um título
 *     novo com caracteres não previstos, apague o cache em scripts/fontes/
 *     para forçar um novo recorte.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONTS_DIR = resolve(__dirname, 'fontes')

// ---------------------------------------------------------------------------
// Tokens do site (src/styles/globals.css, bloco @theme)
// ---------------------------------------------------------------------------
const COLOR_BG = '#1A1A1A' // --color-fg-1 (usado como fundo escuro do hero)
const COLOR_TEAL = '#0D7C7C' // --color-teal
const COLOR_SAND = '#F5F2EE' // --color-sand
const COLOR_SAND_BRIGHT = '#FAF8F5' // --color-sand-bright
const COLOR_CORAL = '#E05A3A' // --color-coral

const WIDTH = 1200
const HEIGHT = 630

// ---------------------------------------------------------------------------
// Textura de pontos do hero (src/views/Home.tsx):
//   radial-gradient(circle at 1px 1px, white 1px, transparent 0), 32px 32px
// satori (motor do ImageResponse) NÃO tileia um radial-gradient repetido via
// backgroundSize — ele resolve o gradiente uma única vez para o elemento
// inteiro, então o CSS acima simplesmente não aparece. A alternativa que o
// satori sabe tileiar de verdade é uma imagem (raster/SVG) como
// background-image + background-size + background-repeat. Por isso o padrão
// é construído aqui como um SVG de um único ponto (data URI) e repetido via
// CSS, reproduzindo visualmente o mesmo grid 32x32 do site.
const DOT_PATTERN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="1" cy="1" r="1" fill="#FFFFFF" fill-opacity="0.55"/></svg>'
const DOT_PATTERN_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(DOT_PATTERN_SVG).toString('base64')}`

// ---------------------------------------------------------------------------
// Textos fixos que aparecem em TODA capa gerada por este script (além do
// título recebido por argv). Precisam entrar no recorte de fonte também.
// ---------------------------------------------------------------------------
const KICKER_TEXT = 'SÃO MIGUEL DO GOSTOSO'
const BRAND_TEXT = 'Vive Gostoso'
const BRAND_MONOGRAM = 'V'

// Todos os títulos de artigo já conhecidos neste projeto (tasks 26/29) —
// mantidos aqui para que o recorte de fonte cacheado cubra qualquer um deles
// sem precisar refazer o download a cada execução.
const TITULOS_CONHECIDOS = [
  'Mostra de Cinema de Gostoso 2026: Datas, Programação e Onde Ficar no Festival',
  'Turismo Sustentável em São Miguel do Gostoso: Como Visitar Sem Prejudicar a Cidade',
  'Festa de São Miguel Arcanjo 2026 em Gostoso: data, atrações e tudo que você precisa saber',
]

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------
const [, , tituloArg, outputArg] = process.argv
if (!tituloArg || !outputArg) {
  console.error('Uso: node scripts/gerar-capa-artigo.mjs "<titulo>" <arquivo-de-saida.png>')
  process.exit(1)
}

const outputPath = resolve(process.cwd(), outputArg)

// ---------------------------------------------------------------------------
// Recorte de fonte: união exata dos caracteres usados nesta capa
// ---------------------------------------------------------------------------
function charSet(strings) {
  const set = new Set()
  for (const s of strings) {
    for (const ch of Array.from(s)) set.add(ch)
  }
  return set
}

const allText = [tituloArg, ...TITULOS_CONHECIDOS, KICKER_TEXT, BRAND_TEXT, BRAND_MONOGRAM, 'vivegostoso.com.br']
const uniqueChars = Array.from(charSet(allText)).sort().join('')

async function loadGoogleFont(fontFamily, weight, text) {
  const cacheFile = resolve(FONTS_DIR, `${fontFamily.replace(/\s+/g, '')}-${weight}.ttf`)
  if (existsSync(cacheFile)) {
    return new Uint8Array((await import('fs')).readFileSync(cacheFile)).buffer
  }

  // Nomes de família com espaço usam "+" literal na querystring do Google
  // Fonts (não %20/%2B) — por isso não passa por encodeURIComponent aqui.
  const familyParam = fontFamily.replace(/\s+/g, '+')
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weight}&text=${encodeURIComponent(text)}`

  // Truque conhecido: sem um User-Agent de navegador moderno, a API do
  // Google Fonts responde com @font-face apontando para arquivos .ttf
  // (truetype) em vez de .woff2 — e o satori (motor do ImageResponse) só lê
  // ttf/otf, não woff2.
  const cssResponse = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
    },
  })
  if (!cssResponse.ok) {
    throw new Error(`Falha ao buscar CSS da fonte ${fontFamily} ${weight}: HTTP ${cssResponse.status}`)
  }
  const css = await cssResponse.text()
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/)
  if (!match) {
    throw new Error(
      `Não encontrei URL de fonte truetype/opentype/woff para ${fontFamily} ${weight}. CSS recebido:\n${css}`
    )
  }
  const fontFileUrl = match[1]
  const fontResponse = await fetch(fontFileUrl)
  if (!fontResponse.ok) {
    throw new Error(`Falha ao baixar arquivo de fonte ${fontFileUrl}: HTTP ${fontResponse.status}`)
  }
  const arrayBuffer = await fontResponse.arrayBuffer()

  if (!existsSync(FONTS_DIR)) mkdirSync(FONTS_DIR, { recursive: true })
  writeFileSync(cacheFile, Buffer.from(arrayBuffer))

  return arrayBuffer
}

// ---------------------------------------------------------------------------
// Ajuste de tamanho de fonte do título conforme o comprimento do texto, para
// caber em até 4 linhas dentro da área disponível (título é longo).
// ---------------------------------------------------------------------------
function tamanhoTitulo(titulo) {
  const len = titulo.length
  if (len <= 55) return 62
  if (len <= 70) return 54
  if (len <= 85) return 48
  return 42
}

// ---------------------------------------------------------------------------
// Elemento (objeto puro { type, props } — este arquivo .mjs NÃO passa por
// transpilação, então não pode usar JSX).
// ---------------------------------------------------------------------------
function el(type, props, children) {
  return { type, props: { ...props, children } }
}

function buildElement(titulo) {
  const fontSize = tamanhoTitulo(titulo)

  return el('div', {
    style: {
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      display: 'flex',
      position: 'relative',
      backgroundColor: COLOR_BG,
      fontFamily: 'Jakarta',
    },
  }, [
    // Textura de pontos, reproduzindo o padrão do hero (src/views/Home.tsx)
    el('div', {
      style: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: 'flex',
        backgroundImage: `url(${DOT_PATTERN_DATA_URI})`,
        backgroundSize: '32px 32px',
        backgroundRepeat: 'repeat',
      },
    }),

    // Glow sutil no canto superior direito (teal) e inferior esquerdo (coral),
    // para dar profundidade sem usar nenhuma foto.
    el('div', {
      style: {
        position: 'absolute',
        top: '-180px',
        right: '-180px',
        width: '520px',
        height: '520px',
        borderRadius: '9999px',
        display: 'flex',
        backgroundImage: `radial-gradient(circle, ${COLOR_TEAL}55 0%, rgba(0,0,0,0) 70%)`,
      },
    }),
    el('div', {
      style: {
        position: 'absolute',
        bottom: '-160px',
        left: '-140px',
        width: '460px',
        height: '460px',
        borderRadius: '9999px',
        display: 'flex',
        backgroundImage: `radial-gradient(circle, ${COLOR_CORAL}33 0%, rgba(0,0,0,0) 70%)`,
      },
    }),

    // Conteúdo
    //
    // Padding horizontal de 190px (não 76px): o card do /blog usa
    // `aspect-[4/3] object-cover` sobre esta imagem 1200x630 — isso mostra
    // só uma janela central de 840px de largura (de x=180 a x=1020) no card
    // da listagem, cortando as bordas. Mantendo o texto dentro dessa janela
    // segura ele não fica cortado nem no card 4:3 nem na imagem 1200x630
    // inteira usada no compartilhamento social.
    el('div', {
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '56px 190px',
      },
    }, [
      // Kicker
      el('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px' },
      }, [
        el('div', {
          style: {
            width: '10px',
            height: '10px',
            borderRadius: '9999px',
            display: 'flex',
            backgroundColor: COLOR_TEAL,
          },
        }),
        el('div', {
          style: {
            display: 'flex',
            fontFamily: 'Jakarta',
            fontWeight: 600,
            fontSize: '20px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.62)',
          },
        }, KICKER_TEXT),
      ]),

      // Título
      el('div', {
        style: {
          display: 'flex',
          fontFamily: 'Fraunces',
          fontWeight: 700,
          fontSize: `${fontSize}px`,
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
          color: COLOR_SAND_BRIGHT,
          maxWidth: '1000px',
        },
      }, titulo),

      // Marca (rodapé)
      el('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px' },
      }, [
        el('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            backgroundColor: COLOR_TEAL,
            fontFamily: 'Fraunces',
            fontWeight: 700,
            fontSize: '18px',
            color: '#FFFFFF',
          },
        }, BRAND_MONOGRAM),
        el('div', {
          style: {
            display: 'flex',
            fontFamily: 'Jakarta',
            fontWeight: 600,
            fontSize: '24px',
            color: COLOR_TEAL,
          },
        }, BRAND_TEXT),
      ]),
    ]),
  ])
}

async function main() {
  const { ImageResponse } = await import('next/og.js')

  const [fraunces700, jakarta500, jakarta600] = await Promise.all([
    loadGoogleFont('Fraunces', 700, uniqueChars),
    loadGoogleFont('Plus Jakarta Sans', 500, uniqueChars),
    loadGoogleFont('Plus Jakarta Sans', 600, uniqueChars),
  ])

  const element = buildElement(tituloArg)

  const imageResponse = new ImageResponse(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Fraunces', data: fraunces700, weight: 700, style: 'normal' },
      { name: 'Jakarta', data: jakarta500, weight: 500, style: 'normal' },
      { name: 'Jakarta', data: jakarta600, weight: 600, style: 'normal' },
    ],
  })

  const arrayBuffer = await imageResponse.arrayBuffer()
  writeFileSync(outputPath, Buffer.from(arrayBuffer))
  console.log(`OK: ${outputPath} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`)
}

main().catch((err) => {
  console.error('Erro ao gerar capa:', err)
  process.exit(1)
})
