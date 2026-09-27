import { ImageResponse } from 'next/og'
import { PRAIAS_MARES, praiaPorSlug, type Idioma } from '@/data/praias-mares'
import { carregarSemana } from '@/lib/mares/carregar'
import { formatarAltura, rotuloDoDia } from '@/lib/mares/formato'
import { textosMares } from '@/lib/mares/seo-mares'

/* Card de compartilhamento de cada praia, com a mare do dia. Gerado com a
   fonte padrao do next/og: os recortes de Fraunces e Jakarta que o projeto
   tem (app/[lang]/bio e scripts/fontes) nao cobrem os digitos e letras deste
   card, e fonte com glifo faltando sai misturada. Cores do design system. */
export const alt = 'Tábua de marés'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

export function generateStaticParams() {
  return PRAIAS_MARES.map((p) => ({ praia: p.slug }))
}

const TEAL = '#0D7C7C'
const OCRE = '#A05E1A'
const FUNDO = '#F5F2EE'
const TINTA = '#1A1A1A'
const CINZA = '#3D3D3D'

export default async function Imagem({ params }: { params: Promise<{ lang: string; praia: string }> }) {
  const { lang: bruto, praia: slug } = await params
  const lang: Idioma = bruto === 'en' || bruto === 'es' ? bruto : 'pt'
  const praia = praiaPorSlug(slug)
  const t = textosMares(lang)
  const { hoje, semana } = await carregarSemana(slug)
  const dia = semana[0]
  const rotulo = rotuloDoDia(hoje, hoje, lang)

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: FUNDO, padding: '64px 72px' }}>
        <div style={{ display: 'flex', fontSize: 30, color: TEAL, fontWeight: 700 }}>{t.titulo}</div>
        <div style={{ display: 'flex', fontSize: 84, color: TINTA, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em' }}>
          {praia?.nome ?? 'Vive Gostoso'}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: CINZA, marginTop: 8 }}>
          {`${t.og_hoje} · ${rotulo.data}`}
        </div>
        {dia?.temDados ? (
          <div style={{ display: 'flex', marginTop: 56, gap: 56 }}>
            {dia.eventos.map((e) => (
              <div key={e.iso} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: e.tipo === 'alta' ? TEAL : OCRE }}>
                  {e.tipo === 'alta' ? t.alta_curta : t.baixa_curta}
                </div>
                <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, color: TINTA }}>{e.hora}</div>
                <div style={{ display: 'flex', fontSize: 30, color: CINZA }}>{formatarAltura(e.altura, lang)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', marginTop: 56, fontSize: 36, color: CINZA }}>{t.vazio_titulo}</div>
        )}
        <div style={{ display: 'flex', marginTop: 'auto', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 24, color: CINZA }}>Marinha do Brasil (CHM/DHN), Porto de Natal</div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: TINTA }}>
            Vive Gostoso<span style={{ color: '#E05A3A' }}>.</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
