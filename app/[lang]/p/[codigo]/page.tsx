// app/[lang]/p/[codigo]/page.tsx
// Pagina da plaquinha do balcao (QR e NFC apontam para /p/NN). Cada codigo e de um
// estabelecimento, definido em src/lib/plaquinhas.ts: agradece a visita, leva para a
// avaliacao do Google e para o perfil dele no Vive Gostoso. A chamada para o
// Passaporte Gostoso so aparece com CLUBE_PUBLICO ligado (src/lib/clube/config.ts).
// Codigo sem negocio cai na home, nunca em 404 (a plaquinha ja esta no balcao).
import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ExternalLink, Ticket } from 'lucide-react'
import { RegistrarVisita } from '@/components/clube/registrar-visita'
import { TemaClube } from '@/components/clube/tema'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { usaCapaTipografica } from '@/lib/capa-negocio'
import { CLUBE_PUBLICO, CLUBE_ROTA } from '@/lib/clube/config'
import { carregarVantagens } from '@/lib/clube/carregar'
import { DESTINO_PADRAO, linkDeAvaliacao, plaquinhaDoCodigo } from '@/lib/plaquinhas'
import { clientePublico } from '@/lib/supabase/publico'

type Props = { params: Promise<{ lang: string; codigo: string }> }

interface NegocioDaPlaquinha {
  id: string
  name: string
  slug: string
  cover_url: string | null
  logo_url: string | null
}

const POR_DO_SOL = '/negocios/biscoitos-damy/por-do-sol.jpg'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: { absolute: dicionario(lang).plaquinha.page_title },
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function PlaquinhaPage({ params }: Props) {
  const { lang, codigo } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const plaquinha = plaquinhaDoCodigo(codigo)
  if (!plaquinha) redirect(DESTINO_PADRAO)

  const { data } = await clientePublico()
    .from('gostoso_businesses')
    .select('id, name, slug, cover_url, logo_url')
    .eq('slug', plaquinha.slug)
    .eq('active', true)
    .eq('is_published', true)
    .maybeSingle()
  const negocio = data as NegocioDaPlaquinha | null
  if (!negocio) redirect(DESTINO_PADRAO)

  const t = dicionario(idioma).plaquinha
  const tc = dicionario(idioma).clube
  const pre = prefixo(idioma)
  const avaliar = linkDeAvaliacao(plaquinha)
  const foto = !usaCapaTipografica(negocio.cover_url) ? negocio.cover_url : negocio.logo_url

  const vantagem = CLUBE_PUBLICO ? ((await carregarVantagens([negocio.id])).vantagens[0] ?? null) : null

  const porDoSol = <Image className="clube-hero-img" src={POR_DO_SOL} alt="" fill priority sizes="100vw" />

  return (
    <TemaClube>
      <RegistrarVisita codigo={codigo} />
      <header className="clube-capa-p">
        {foto ? (
          <SafeCoverImage
            src={foto}
            alt={negocio.name}
            className="clube-hero-img"
            loading="eager"
            sizes="100vw"
            fallback={porDoSol}
          />
        ) : (
          porDoSol
        )}
        <div className="clube-wrap clube-marca-linha">
          <a className="clube-marca" href={`${pre}/`}>
            {tc.marca}
          </a>
        </div>
        <div className="clube-col" style={{ marginInline: 'auto' }}>
          <h1 className="clube-p-titulo clube-entra">{t.agradecimento.replace('{nome}', negocio.name)}</h1>
        </div>
      </header>

      <main className="clube-col" style={{ paddingBottom: '2rem' }}>
        <div className="clube-p-quadro">
          <p style={{ color: 'var(--c-suave)' }}>{t.sub}</p>
          <div className="clube-pilha">
            {avaliar ? (
              <a
                className="clube-btn clube-btn--mostarda clube-btn--cheio"
                href={avaliar}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.avaliar}
                <ExternalLink size={18} aria-hidden />
              </a>
            ) : null}
            <a className="clube-btn clube-btn--contorno clube-btn--cheio" href={`${pre}/negocio/${negocio.slug}`}>
              {t.ver_perfil.replace('{nome}', negocio.name)}
            </a>
          </div>
        </div>

        {CLUBE_PUBLICO ? (
          <section className="clube-card" style={{ marginTop: '1.5rem' }} aria-labelledby="passaporte">
            <div className="clube-card-corpo">
              <div className="clube-card-topo">
                <span className="clube-icone">
                  <Ticket size={22} aria-hidden />
                </span>
                <h2 id="passaporte" className="clube-nome" style={{ paddingRight: 0, alignSelf: 'center' }}>
                  {t.passaporte_titulo}
                </h2>
              </div>
              {vantagem ? (
                <>
                  <p className="clube-tipo" style={{ marginTop: '1rem' }}>
                    {t.passaporte_vantagem}
                  </p>
                  <p className="clube-beneficio" style={{ marginTop: '0.25rem' }}>
                    {vantagem.beneficio}
                  </p>
                </>
              ) : (
                <p className="clube-beneficio">{t.passaporte_chamada}</p>
              )}
            </div>
            <div className="clube-picote" aria-hidden="true" />
            <div className="clube-canhoto">
              <a className="clube-btn clube-btn--verde clube-btn--cheio" href={`${pre}${CLUBE_ROTA}?n=${codigo}`}>
                {t.passaporte_botao}
              </a>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="clube-rodape">
        <div className="clube-col">{t.rodape}</div>
      </footer>
    </TemaClube>
  )
}
