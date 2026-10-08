import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
import type { IconeVitrine, IdVitrine } from '@/lib/explore/vitrine'
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
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

const TOM: Record<string, 'papel' | 'teal' | 'ocre' | 'coral'> = {
  mapa: 'ocre',
  participe: 'ocre',
}

/* Texto do convite no rodape do cartao: reaproveita o botao da vitrine. */
const ACAO: Record<string, IdVitrine> = {
  mapa: 'explore',
  passeie: 'passeie',
  conheca: 'conheca',
  participe: 'participe',
  transfer: 'transfer',
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

      <h2 className="sr-only">{e.outros_titulo}</h2>
      <BentoGrid className="mt-10 lg:auto-rows-[minmax(10rem,auto)]">
        {/* Tabua de mares, com a mare de hoje */}
        <BentoCard
          titulo={mares.titulo}
          descricao={mares.linha}
          href={caminhoNoIdioma(lang, mares.caminho)}
          acao={v.mares_ver}
          tom="teal"
          icone={<IconeVitrineSvg nome="waves" className="w-5 h-5 text-teal-light" />}
          className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
        >
          {mareHoje && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-white/70">{v.mares_hoje}</p>
              <div className="mt-2">
                <MaresDoDia dia={mareHoje} lang={lang} claro />
              </div>
            </div>
          )}
        </BentoCard>

        {/* Praias: cada uma leva para a mare dela */}
        <BentoCard
          titulo={e.praias_titulo}
          descricao={e.praias_linha}
          atraso={70}
          className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
        >
          {praiasPorMunicipio().map((g) => (
            <div key={g.municipio} className="mt-2 first:mt-0">
              <h4 className="text-sm font-semibold text-fg-2">{g.municipio}</h4>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {g.praias.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={caminhoNoIdioma(lang, `/explore/mares/${p.slug}`)}
                      className="inline-flex min-h-11 items-center rounded-full border border-border-1 bg-white dark:bg-card px-4 text-sm font-medium text-fg-1 hover:border-teal hover:text-teal transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                    >
                      {p.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </BentoCard>

        {outros.map((i, n) => (
          <BentoCard
            key={i.id}
            titulo={i.titulo}
            descricao={i.linha}
            href={caminhoNoIdioma(lang, i.caminho)}
            acao={ACAO[i.id] ? v.itens[ACAO[i.id]].botao : undefined}
            tom={TOM[i.id] ?? 'papel'}
            icone={<IconeVitrineSvg nome={ICONE[i.id]} className="w-5 h-5" />}
            atraso={(n % 4) * 70}
            className={i.id === 'mapa' ? 'sm:col-span-2 lg:col-span-2' : undefined}
          />
        ))}
        {guia && (
          <BentoCard
            titulo={guia.titulo}
            descricao={guia.linha}
            href={caminhoDoGuiaMares(lang)}
            icone={<IconeVitrineSvg nome="newspaper" className="w-5 h-5" />}
            className="sm:col-span-2 lg:col-span-3"
          />
        )}
      </BentoGrid>
    </main>
  )
}
