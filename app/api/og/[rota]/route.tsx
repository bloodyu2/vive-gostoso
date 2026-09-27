import { ImageResponse } from 'next/og'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { PRAIAS_MARES } from '@/data/praias-mares'
import { PONTOS_MAPA } from '@/data/pontos-mapa'
import { ITENS_VITRINE, textosVitrine } from '@/lib/explore/vitrine'

/* Imagem de compartilhamento da home e do Explore (1200x630). Fica numa rota de
   API, e nao num opengraph-image.tsx, porque o arquivo de metadados vale para
   todas as rotas filhas e passaria por cima da imagem de cada praia da tabua.
   Fonte padrao do next/og, como no card das praias (ver decisoes.md). */
export const revalidate = 86400

const DICIONARIOS = { pt, en, es } as const
const TEAL = '#0D7C7C'
const FUNDO = '#F5F2EE'
const TINTA = '#1A1A1A'
const CINZA = '#3D3D3D'
const CORAL = '#E05A3A'

export async function GET(request: Request, { params }: { params: Promise<{ rota: string }> }) {
  const { rota } = await params
  if (rota !== 'home' && rota !== 'explore') return new Response('Not found', { status: 404 })
  const bruto = new URL(request.url).searchParams.get('lang')
  const lang = bruto === 'en' || bruto === 'es' ? bruto : 'pt'
  const d = DICIONARIOS[lang]
  const v = textosVitrine(lang)
  const titulo = rota === 'home' ? d.meta.home.title : d.explore_indice.h1
  const itens =
    rota === 'home'
      ? ITENS_VITRINE.slice(0, 6).map((i) => v.itens[i.id].titulo)
      : [v.itens.mares.titulo, `${PRAIAS_MARES.length} ${lang === 'en' ? 'beaches' : lang === 'es' ? 'playas' : 'praias'}`, d.explore_indice.mapa_titulo, `${PONTOS_MAPA.length} ${lang === 'en' ? 'points' : lang === 'es' ? 'puntos' : 'pontos'}`]

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: FUNDO, padding: '64px 72px' }}>
        <div style={{ display: 'flex', fontSize: 30, color: TEAL, fontWeight: 700 }}>vivegostoso.com.br</div>
        <div style={{ display: 'flex', fontSize: 68, color: TINTA, fontWeight: 700, marginTop: 16, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          {titulo}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 44, gap: 14 }}>
          {itens.map((i) => (
            <div key={i} style={{ display: 'flex', fontSize: 28, color: CINZA, border: `2px solid ${TEAL}`, borderRadius: 999, padding: '8px 22px' }}>
              {i}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, color: TINTA }}>
            Vive Gostoso<span style={{ color: CORAL }}>.</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
