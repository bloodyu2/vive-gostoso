'use client'

import Link from 'next/link'
import { ArrowRight, BedDouble, CalendarDays, Compass, Newspaper, Ticket, Utensils, Waves } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { pushDataLayer } from '@/lib/analytics'
import type { SiteStats } from '@/hooks/useStats'

type Props = {
  /** Parceiros do Passaporte com vantagem no ar hoje (0 esconde o numero). */
  clubeNoAr: number
  stats?: SiteStats
}

/** Trilho de iniciativas: tudo que o Vive Gostoso oferece, a um toque, sem
 *  rolagem automatica. Ordem pensada para turista: maré, comer, ficar, passear,
 *  agenda, blog. O Passaporte tem cartao proprio logo acima. */
const TRILHO = [
  { chave: 'mares', caminho: '/explore/mares', Icone: Waves },
  { chave: 'come', caminho: '/come', Icone: Utensils },
  { chave: 'fique', caminho: '/fique', Icone: BedDouble },
  { chave: 'passeie', caminho: '/passeie', Icone: Compass },
  { chave: 'participe', caminho: '/participe', Icone: CalendarDays },
  { chave: 'blog', caminho: '/blog', Icone: Newspaper },
] as const

export function TopoDaHome({ clubeNoAr, stats }: Props) {
  const { t } = useTranslation()
  const lp = useLocalePath()

  return (
    <section className="relative overflow-hidden bg-page">
      {/* Sol e ondas: so decoracao, sem peso de imagem. */}
      <svg aria-hidden="true" viewBox="0 0 1200 220" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-teal/10 md:h-44">
        <path d="M0 110 C 150 60, 300 60, 450 105 S 750 160, 900 105 S 1120 60, 1200 100 L1200 220 L0 220 Z" fill="currentColor" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-ocre-400/20 blur-2xl md:size-96" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:px-8 md:pb-14 md:pt-16">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fg-2">
            <span aria-hidden="true" className="inline-block size-2 rounded-full bg-teal" />
            {t('home.hero_h1_cidade')}
          </p>
          <h1 className="mt-4 font-display font-bold leading-[1.02] tracking-tight text-fg-1">
            <span className="block text-5xl sm:text-6xl md:text-7xl">{t('home.hero_h1_1')}</span>
            <span className="block text-5xl sm:text-6xl md:text-7xl">{t('home.hero_h1_2')}</span>
            <span className="block text-5xl sm:text-6xl md:text-7xl">{t('home.hero_h1_3')}</span>
            <span className="mt-1 block text-4xl text-coral sm:text-5xl md:text-6xl">{t('home.hero_brand')}</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-fg-2 md:text-lg">{t('home.hero_sub')}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={lp('/explore')}
              onClick={() => pushDataLayer('home_topo_click', { alvo: 'explorar' })}
              className="inline-flex min-h-11 items-center rounded-full bg-teal px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none"
            >
              {t('home.cta_explorar')}
            </Link>
            <Link
              href={lp('/come')}
              onClick={() => pushDataLayer('home_topo_click', { alvo: 'restaurantes' })}
              className="inline-flex min-h-11 items-center rounded-full border border-border-1 bg-card px-6 text-sm font-semibold text-fg-1 transition-colors hover:border-teal hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none"
            >
              {t('home.cta_restaurantes')}
            </Link>
          </div>

          {stats && stats.businesses > 0 && (
            <p className="mt-7 max-w-md border-t border-border-1 pt-5 text-sm text-fg-2">
              {t('home.stats_sentence', { cadastrados: stats.businesses, verificados: stats.verified })}
            </p>
          )}
        </div>

        {/* Cartao-bilhete do Passaporte */}
        <Link
          href={lp('/clube')}
          onClick={() => pushDataLayer('home_passaporte_click', { local: 'topo' })}
          className="group relative block rounded-3xl border border-ocre-400/40 bg-card shadow-md transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal motion-reduce:transition-none"
        >
          <span aria-hidden="true" className="absolute -left-3 top-[62%] size-6 rounded-full bg-page" />
          <span aria-hidden="true" className="absolute -right-3 top-[62%] size-6 rounded-full bg-page" />
          <div className="p-6 pb-7 md:p-7 md:pb-8">
            <div className="flex items-center gap-2 text-ocre-dark">
              <Ticket className="size-5" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-widest">{t('home.passaporte_eyebrow')}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold leading-tight text-fg-1 text-balance md:text-3xl">
              {t('home.passaporte_titulo')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg-2 text-pretty">{t('home.passaporte_desc')}</p>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-dashed border-ocre-400/60 px-6 py-4 md:px-7">
            <span className="text-sm font-semibold text-fg-1">
              {clubeNoAr > 1
                ? t('home.passaporte_parceiros', { n: clubeNoAr })
                : clubeNoAr === 1
                  ? t('home.passaporte_parceiro_um')
                  : t('home.passaporte_gratis')}
            </span>
            <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal transition-[gap] group-hover:gap-2.5 motion-reduce:transition-none">
              {t('home.passaporte_cta')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>

      {/* Trilho de iniciativas */}
      <nav aria-label={t('home.trilho_label')} className="relative mx-auto max-w-6xl pb-6 md:pb-8">
        <ul className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none md:flex-wrap md:overflow-visible md:px-8">
          {TRILHO.map(({ chave, caminho, Icone }) => (
            <li key={chave} className="shrink-0">
              <Link
                href={lp(caminho)}
                onClick={() => pushDataLayer('home_trilho_click', { alvo: chave })}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-1 bg-card px-4 text-sm font-medium text-fg-1 transition-colors hover:border-teal hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none"
              >
                <Icone className="size-4 text-teal" aria-hidden="true" />
                {t(`home.trilho_${chave}`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
