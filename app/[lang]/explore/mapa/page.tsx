import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navigation } from 'lucide-react'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { buildPageMetadata, isLocale } from '@/lib/page-metadata'
import { getBusinessesForMap } from '@/lib/supabase/queries'
import Explore from '@/views/Explore'
import type { Business } from '@/types/database'
import { CATEGORIAS_PONTO, PONTOS_MAPA, linkComoChegar } from '@/data/pontos-mapa'
import { jsonLdMapa } from '@/lib/explore/seo-explore'
import { caminhoNoIdioma } from '@/lib/explore/vitrine'
import { safeJsonLd } from '@/lib/json-ld'
import { Trilha } from '@/components/explore/trilha'

export const revalidate = 1800

const DICIONARIOS = { pt, en, es } as const

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('mapa', lang)
}

export default async function MapaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const d = DICIONARIOS[lang]
  const t = d.mapa
  const businesses = await getBusinessesForMap()

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdMapa(lang)) }} />
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-6">
        <Trilha
          itens={[
            { nome: d.explore_indice.trilha_inicio, href: caminhoNoIdioma(lang, '/') },
            { nome: d.explore_indice.trilha_explore, href: caminhoNoIdioma(lang, '/explore') },
            { nome: d.explore_indice.trilha_mapa },
          ]}
        />
        <h1 className="mt-3 font-display font-bold text-3xl md:text-5xl leading-[1.05] text-fg-1 [text-wrap:balance]">{t.h1}</h1>
        <p className="mt-3 text-fg-2 leading-relaxed max-w-[65ch]">{t.intro}</p>
      </div>

      <Explore initialBusinesses={businesses as unknown as Business[]} pontos={PONTOS_MAPA} textos={t} lang={lang} />

      <section aria-labelledby="pontos-titulo" className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <h2 id="pontos-titulo" className="font-display text-2xl font-semibold text-fg-1">{t.lista_titulo}</h2>
        <div className="mt-6 grid gap-10 md:grid-cols-3">
          {CATEGORIAS_PONTO.map((c) => (
            <div key={c}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-3">{t.categorias[c]}</h3>
              <ul className="mt-2 divide-y divide-border-1 border-y border-border-1">
                {PONTOS_MAPA.filter((p) => p.categoria === c).map((p) => (
                  <li key={p.id} className="py-4">
                    <p className="font-semibold text-fg-1">
                      {p.nome} <span className="font-normal text-fg-3 text-sm">· {p.municipio}</span>
                    </p>
                    <p className="mt-1 text-sm text-fg-2 leading-relaxed">{p.descricao[lang]}</p>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                      <a href={linkComoChegar(p)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal hover:underline">
                        <Navigation aria-hidden="true" className="w-3.5 h-3.5" />
                        {t.como_chegar}
                      </a>
                      {p.mareSlug && (
                        <Link href={caminhoNoIdioma(lang, `/explore/mares/${p.mareSlug}`)} className="text-teal hover:underline">
                          {t.ver_mare}
                        </Link>
                      )}
                      {p.site && (
                        <a href={p.site} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                          {t.site}
                        </a>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-fg-3">
                      {t.fonte}:{' '}
                      <a href={p.fonte.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal">
                        {p.fonte.nome}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
