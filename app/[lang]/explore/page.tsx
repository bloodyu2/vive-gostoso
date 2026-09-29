import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { buildPageMetadata, isLocale } from '@/lib/page-metadata'
import { praiasPorMunicipio } from '@/data/praias-mares'
import { itensDoExplore, jsonLdExplore } from '@/lib/explore/seo-explore'
import { caminhoNoIdioma, textosVitrine } from '@/lib/explore/vitrine'
import { safeJsonLd } from '@/lib/json-ld'
import { Trilha } from '@/components/explore/trilha'
import { MaresDoDia, lerMareDeHojeNoCardeiro } from '@/components/explore/mare-de-hoje'
import { IconeVitrineSvg } from '@/components/explore/icone-vitrine'
import type { IconeVitrine } from '@/lib/explore/vitrine'
import { guiaMaresPublicado, textosGuiaMares } from '@/components/mares/link-guia'
import { caminhoDoGuiaMares } from '@/lib/blog/post-publicado'

/* Indice de tudo o que da para explorar. Antes, /explore era so o mapa (que
   passou para /explore/mapa) e dali nao se chegava a tabua de mares.
   A mare de hoje vem do mesmo cache de 1 h da pagina de mares. */
export const revalidate = 3600

const DICIONARIOS = { pt, en, es } as const

const ICONE: Record<string, IconeVitrine> = {
  mapa: 'map',
  passeie: 'compass',
  conheca: 'landmark',
  participe: 'calendar',
  transfer: 'car',
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('explore', lang)
}

export default async function ExplorePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const d = DICIONARIOS[lang]
  const e = d.explore_indice
  const v = textosVitrine(lang)
  // KAN-463: as duas leituras sao independentes e vao juntas.
  const [mareHoje, guiaPublicado] = await Promise.all([lerMareDeHojeNoCardeiro(), guiaMaresPublicado(lang)])
  const [mares, ...outros] = itensDoExplore(lang)
  const guia = guiaPublicado ? textosGuiaMares(lang) : null

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdExplore(lang)) }} />
      <Trilha itens={[{ nome: e.trilha_inicio, href: caminhoNoIdioma(lang, '/') }, { nome: e.trilha_explore }]} />
      <h1 className="mt-3 font-display font-bold text-4xl md:text-6xl leading-[1.05] text-fg-1 [text-wrap:balance] max-w-4xl">{e.h1}</h1>
      <p className="mt-4 text-lg text-fg-2 leading-relaxed max-w-[60ch]">{e.intro}</p>

      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        {/* Tabua de mares, com a mare de hoje */}
        <Link
          href={caminhoNoIdioma(lang, mares.caminho)}
          className="group relative overflow-hidden rounded-2xl bg-teal-dark p-6 md:p-8 text-white lg:col-span-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <IconeVitrineSvg nome="waves" className="w-7 h-7 text-teal-light" />
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold">{mares.titulo}</h2>
          <p className="mt-2 text-white/80">{mares.linha}</p>
          {mareHoje && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{v.mares_hoje}</p>
              <div className="mt-2">
                <MaresDoDia dia={mareHoje} lang={lang} claro />
              </div>
            </div>
          )}
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all motion-reduce:transition-none">
            {v.mares_ver}
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </span>
        </Link>

        {/* Praias: cada uma leva para a mare dela */}
        <section aria-labelledby="praias-titulo" className="rounded-2xl border border-border-1 bg-elev p-6 lg:col-span-2">
          <h2 id="praias-titulo" className="font-display text-xl font-semibold text-fg-1">{e.praias_titulo}</h2>
          <p className="mt-1 text-sm text-fg-2">{e.praias_linha}</p>
          {praiasPorMunicipio().map((g) => (
            <div key={g.municipio} className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-3">{g.municipio}</h3>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {g.praias.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={caminhoNoIdioma(lang, `/explore/mares/${p.slug}`)}
                      className="inline-flex min-h-9 items-center rounded-full border border-border-1 px-3 text-sm text-fg-1 hover:border-teal hover:text-teal transition-colors motion-reduce:transition-none"
                    >
                      {p.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>

      <section aria-labelledby="outros-titulo" className="mt-12">
        <h2 id="outros-titulo" className="font-display text-2xl font-semibold text-fg-1">{e.outros_titulo}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outros.map((i) => (
            <li key={i.id}>
              <Link
                href={caminhoNoIdioma(lang, i.caminho)}
                className="group flex h-full gap-4 rounded-2xl border border-border-1 bg-elev p-5 hover:border-teal/40 transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <IconeVitrineSvg nome={ICONE[i.id]} className="w-5 h-5 shrink-0 mt-1 text-teal" />
                <span>
                  <span className="block font-display text-lg font-semibold text-fg-1 group-hover:text-teal transition-colors motion-reduce:transition-none">
                    {i.titulo}
                  </span>
                  <span className="mt-1 block text-sm text-fg-2 leading-snug">{i.linha}</span>
                </span>
              </Link>
            </li>
          ))}
          {guia && (
            <li>
              <Link
                href={caminhoDoGuiaMares(lang)}
                className="group flex h-full gap-4 rounded-2xl border border-border-1 bg-elev p-5 hover:border-teal/40 transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <IconeVitrineSvg nome="newspaper" className="w-5 h-5 shrink-0 mt-1 text-teal" />
                <span>
                  <span className="block font-display text-lg font-semibold text-fg-1 group-hover:text-teal transition-colors motion-reduce:transition-none">
                    {guia.titulo}
                  </span>
                  <span className="mt-1 block text-sm text-fg-2 leading-snug">{guia.linha}</span>
                </span>
              </Link>
            </li>
          )}
        </ul>
      </section>
    </main>
  )
}
