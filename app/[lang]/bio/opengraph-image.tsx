import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { VIVE } from '@/lib/bio/contato'
import { dicionario } from '@/lib/bio/dicionario'

/** O card que aparece quando o link da etiqueta é colado numa conversa.
 *
 *  Um por idioma: quem manda o link em inglês manda um card em inglês. O texto sai
 *  do mesmo dicionário que a página usa, então card e tela não podem discordar.
 *
 *  AS FONTES SÃO ARQUIVOS LOCAIS, E RECORTADOS. O gerador de imagem não enxerga a
 *  folha do Google Fonts que o layout carrega, então cada peça de texto precisa da
 *  fonte em mãos. Os dois .ttf ao lado têm só os caracteres que os TRÊS idiomas
 *  escrevem neste card, o que os deixa em 15KB e 10KB. Se o texto mudar, os recortes
 *  precisam ser gerados de novo pela API do Google Fonts com o parâmetro `text`. */
export const alt = `${VIVE.nome}, ${VIVE.cidade}/${VIVE.uf}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }, { lang: 'es' }]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = dicionario(lang).bio

  /* readFile e não fetch(new URL(..., import.meta.url)): o runtime Node do Next não
     implementa fetch em file://, e o sintoma é um 500 sem imagem nenhuma. Quem
     garante que os .ttf cheguem ao pacote de produção é o outputFileTracingIncludes
     do next.config.ts. */
  const pasta = join(process.cwd(), 'app', '[lang]', 'bio')
  const [fraunces, jakarta] = await Promise.all([
    readFile(join(pasta, 'Fraunces700-og.ttf')),
    readFile(join(pasta, 'Jakarta500-og.ttf')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#1A1A1A',
          padding: '0 80px 76px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Fraunces',
            fontSize: 116,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#F5F2EE',
          }}
        >
          {VIVE.nome}
          <span style={{ color: '#E05A3A' }}>.</span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontFamily: 'Jakarta',
            fontSize: 31,
            color: '#C0BCB8',
            maxWidth: 900,
          }}
        >
          {t.role}
        </div>

        {/* O fio coral da página, repetido aqui para o card e a tela serem a mesma
            peça quando a pessoa toca no link. */}
        <div
          style={{
            display: 'flex',
            marginTop: 38,
            width: 84,
            height: 5,
            borderRadius: 999,
            backgroundColor: '#E05A3A',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Fraunces', data: fraunces, style: 'normal', weight: 700 },
        { name: 'Jakarta', data: jakarta, style: 'normal', weight: 500 },
      ],
    },
  )
}
