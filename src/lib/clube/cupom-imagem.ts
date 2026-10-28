// Imagem do cupom do Passaporte Gostoso: um bilhete em PNG para baixar e mostrar no
// estabelecimento. Mesma identidade da /clube (verde, areia, mostarda, Bricolage e
// Figtree). Feita com o `next/og` (satori), que so entende flex e um punhado de CSS, por
// isso a arvore e montada com um helper `h` em vez de JSX: serve igual ao Next e aos
// testes, e nao depende de configuracao de JSX.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import qrcode from 'qrcode-generator'
import { formatarCodigo } from './resgate'

export const LARGURA = 1080
export const ALTURA = 1560

export interface DadosCupom {
  negocio: string
  beneficio: string
  /** nome inteiro do titular */
  nome: string
  /** os 8 caracteres do codigo curto */
  codigo: string
  /** AAAA-MM-DD */
  expiraEm: string
  /** endereco que o QR abre (a pagina de verificacao) */
  urlVerificacao: string
}

export interface RotulosCupom {
  marca: string
  titulo: string
  para: string
  codigo: string
  validoAte: string
  umaCompra: string
  mostre: string
  /** idioma da data (pt-BR, en, es) */
  locale: string
}

const COR = {
  fundo: '#0A4545',
  papel: '#F6EBD4',
  verde: '#0F5E5E',
  tinta: '#1B2A2A',
  suave: '#3E4F4F',
  mostarda: '#E8A317',
  borda: '#D8C79B',
}

type No = { type: string; props: { style?: Record<string, unknown>; children?: unknown; [k: string]: unknown } }

function h(tipo: string, estilo: Record<string, unknown>, ...filhos: unknown[]): No {
  const children = filhos.length <= 1 ? filhos[0] : filhos
  return { type: tipo, props: { style: { display: 'flex', ...estilo }, children } }
}

function texto(conteudo: string, estilo: Record<string, unknown>): No {
  return h('div', estilo, conteudo)
}

/** O QR como caminho SVG (uma unica forma), com a margem de silencio ao redor. */
export function caminhoDoQr(url: string): { d: string; modulos: number } {
  const qr = qrcode(0, 'M')
  qr.addData(url)
  qr.make()
  const n = qr.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) {
    let c = 0
    while (c < n) {
      if (qr.isDark(r, c)) {
        const ini = c
        while (c < n && qr.isDark(r, c)) c++
        d += `M${ini} ${r}h${c - ini}v1h-${c - ini}z`
      } else {
        c++
      }
    }
  }
  return { d, modulos: n }
}

function dataCurta(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${iso}T12:00:00Z`),
  )
}

/** Corta texto longo para caber no bilhete, sem quebrar palavra no meio quando da. */
export function encurtar(t: string, max: number): string {
  const limpo = t.replace(/\s+/g, ' ').trim()
  if (limpo.length <= max) return limpo
  const corte = limpo.slice(0, max - 1)
  const ultimoEspaco = corte.lastIndexOf(' ')
  return `${(ultimoEspaco > max * 0.6 ? corte.slice(0, ultimoEspaco) : corte).trimEnd()}…`
}

function tamanhoDoNome(nome: string): number {
  if (nome.length <= 18) return 92
  if (nome.length <= 28) return 76
  if (nome.length <= 40) return 62
  return 52
}

const ALTURA_CANHOTO = 590
const MARGEM = 56

export function montarCupom(dados: DadosCupom, r: RotulosCupom): No {
  const qr = caminhoDoQr(dados.urlVerificacao)
  const lado = 240
  const nome = encurtar(dados.nome, 36)
  const negocio = encurtar(dados.negocio, 56)
  const beneficio = encurtar(dados.beneficio, 120)
  const alturaCartao = ALTURA - 2 * MARGEM
  // meia-lua do picote: pintada por ultimo para ficar por cima do canhoto
  const yPicote = alturaCartao - ALTURA_CANHOTO

  const bolinha = (lado: 'left' | 'right') =>
    h('div', {
      position: 'absolute',
      [lado]: -38,
      top: yPicote - 38,
      width: 76,
      height: 76,
      borderRadius: 38,
      background: COR.fundo,
    })

  return h(
    'div',
    {
      width: LARGURA,
      height: ALTURA,
      background: COR.fundo,
      padding: MARGEM,
      fontFamily: 'Figtree',
    },
    h(
      'div',
      {
        position: 'relative',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: COR.papel,
        borderRadius: 44,
        overflow: 'hidden',
      },
      // parte de cima: o bilhete
      h(
        'div',
        { flexDirection: 'column', flex: 1, padding: '64px 72px 40px 72px' },
        h(
          'div',
          { justifyContent: 'space-between', alignItems: 'center' },
          texto(r.marca.toUpperCase(), { fontSize: 30, fontWeight: 700, color: COR.verde, letterSpacing: 6 }),
          h(
            'div',
            { border: `4px solid ${COR.verde}`, borderRadius: 14, padding: '8px 18px' },
            texto(r.umaCompra.toUpperCase(), { fontSize: 24, fontWeight: 700, color: COR.verde, letterSpacing: 3 }),
          ),
        ),
        texto(r.titulo, { marginTop: 40, fontFamily: 'Bricolage', fontSize: 64, color: COR.verde, letterSpacing: -2 }),
        texto(negocio, {
          marginTop: 56,
          fontFamily: 'Bricolage',
          fontSize: tamanhoDoNome(negocio),
          lineHeight: 1.02,
          color: COR.tinta,
          letterSpacing: -2,
        }),
        texto(beneficio, { marginTop: 28, fontSize: 52, fontWeight: 700, lineHeight: 1.2, color: COR.suave }),
        h(
          'div',
          { flexDirection: 'column', marginTop: 'auto', paddingTop: 28 },
          texto(r.para.toUpperCase(), { fontSize: 24, fontWeight: 700, color: COR.verde, letterSpacing: 4 }),
          texto(nome, { marginTop: 8, fontFamily: 'Bricolage', fontSize: 68, color: COR.tinta, letterSpacing: -1 }),
        ),
      ),
      // picote
      h('div', { height: 0, borderTop: `5px dashed ${COR.borda}` }),
      // canhoto: codigo em cima, validade e QR embaixo
      h(
        'div',
        {
          flexDirection: 'column',
          height: ALTURA_CANHOTO,
          background: COR.verde,
          padding: '44px 72px 48px 72px',
        },
        texto(r.codigo.toUpperCase(), { fontSize: 26, fontWeight: 700, color: COR.papel, letterSpacing: 4 }),
        texto(formatarCodigo(dados.codigo), {
          marginTop: 6,
          fontFamily: 'Bricolage',
          fontSize: 92,
          color: COR.mostarda,
          letterSpacing: 1,
        }),
        h(
          'div',
          { marginTop: 'auto', alignItems: 'flex-end', justifyContent: 'space-between' },
          h(
            'div',
            { flexDirection: 'column', flex: 1, paddingRight: 36 },
            texto(`${r.validoAte} ${dataCurta(dados.expiraEm, r.locale)}`, {
              fontSize: 36,
              fontWeight: 700,
              color: COR.papel,
            }),
            texto(r.mostre, { marginTop: 12, fontSize: 30, fontWeight: 500, color: COR.papel, opacity: 0.85 }),
          ),
          h(
            'div',
            { background: COR.papel, borderRadius: 22, padding: 18 },
            {
              type: 'svg',
              props: {
                width: lado,
                height: lado,
                viewBox: `0 0 ${qr.modulos} ${qr.modulos}`,
                children: [{ type: 'path', props: { d: qr.d, fill: COR.tinta } }],
              },
            },
          ),
        ),
      ),
      bolinha('left'),
      bolinha('right'),
    ),
  )
}

async function lerFonte(nome: string): Promise<ArrayBuffer> {
  const b = await readFile(path.join(process.cwd(), 'src/assets/fonts/clube', nome))
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
}

/** A resposta PNG do cupom. */
export async function imagemDoCupom(dados: DadosCupom, rotulos: RotulosCupom): Promise<ImageResponse> {
  const [bricolage, figtree500, figtree700] = await Promise.all([
    lerFonte('Bricolage-800.ttf'),
    lerFonte('Figtree-500.ttf'),
    lerFonte('Figtree-700.ttf'),
  ])
  return new ImageResponse(montarCupom(dados, rotulos) as never, {
    width: LARGURA,
    height: ALTURA,
    fonts: [
      { name: 'Bricolage', data: bricolage, weight: 800, style: 'normal' },
      { name: 'Figtree', data: figtree500, weight: 500, style: 'normal' },
      { name: 'Figtree', data: figtree700, weight: 700, style: 'normal' },
    ],
  })
}
