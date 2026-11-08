'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Compass, Ticket, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { BusinessCard } from '@/components/business/business-card'
import { Hoje } from '@/components/home/hoje'
import { CarrosselNovos } from '@/components/home/carrossel-novos'
import { NovosEmGostoso } from '@/components/home/novos-em-gostoso'
import { TopoDaHome } from '@/components/home/topo'
import { PostCard } from '@/components/blog/PostCard'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useStats, type SiteStats } from '@/hooks/useStats'
import { useCarrosselNovos } from '@/hooks/useCarrosselNovos'
import { useLocalePath } from '@/hooks/useLocalePath'
import { supabase } from '@/lib/supabase'
import { pushDataLayer } from '@/lib/analytics'
import { normalizarIdioma, visivelNoIdioma } from '@/lib/blog/traducoes'
import type { BlogPost } from '@/types/database'

/** Busca uma folga (12) porque os posts de outros idiomas saem do resultado
 *  depois: so assim sobram 3 posts do idioma atual. */
function useLatestBlogPosts() {
  const limit = 12
  return useQuery({
    queryKey: ['blog-posts-latest', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_blog_posts')
        .select('id, slug, title, excerpt, cover_url, published_at, author, tags')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data ?? []) as BlogPost[]
    },
  })
}

type HomeInitialData = {
  featuredBusinesses: Record<string, unknown>[]
  upcomingEvents: Record<string, unknown>[]
  stats: SiteStats
}

type HomeProps = {
  initialData?: HomeInitialData
  /** Vitrine de recursos, renderizada no servidor (src/components/home/vitrine.tsx). */
  vitrine?: React.ReactNode
  /** Parceiros do Passaporte com vantagem no ar (lido no servidor). */
  clubeNoAr?: number
}

/** Os 3 passos: descobrir, entrar no Passaporte, aproveitar. */
const PASSOS = [
  { chave: 'descubra', Icone: Compass, caminho: '/explore' },
  { chave: 'entre', Icone: Ticket, caminho: '/clube' },
  { chave: 'aproveite', Icone: Sparkles, caminho: '/clube' },
] as const

export default function Home({ initialData, vitrine, clubeNoAr = 0 }: HomeProps) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()

  const { data: allBusinesses = [] } = useBusinesses()
  const featured = allBusinesses.filter(b => b.is_featured)
  const { data: stats } = useStats(initialData ? { initialData: initialData.stats } : undefined)
  const { data: carrossel = [] } = useCarrosselNovos()
  const { data: todosPosts = [] } = useLatestBlogPosts()
  const idioma = normalizarIdioma(i18n.language)
  const latestPosts = todosPosts.filter(p => visivelNoIdioma(p.slug, idioma)).slice(0, 3)

  return (
    <div>
      <TopoDaHome clubeNoAr={clubeNoAr} stats={stats} />

      {/* ── Vitrine de recursos (server component, vem pronta da pagina) ── */}
      {vitrine}

      {/* ── Novos em Gostoso: os ultimos cadastros, so eles ── */}
      <NovosEmGostoso />

      {/* ── Agora em Gostoso ── */}
      <Hoje />

      {/* ── Instagram: puxado para cima, com a logo da marca ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10 md:pb-14">
        <BlurFade>
          <a
            href="https://instagram.com/vivegostoso"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => pushDataLayer('instagram_click', { local: 'home' })}
            className="group flex flex-col items-center gap-5 rounded-3xl border border-border-1 bg-card p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none sm:flex-row sm:justify-between md:px-8"
          >
            <div className="flex items-center gap-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-teal/30">
                <Image src="/brand/avatar-circular.png" alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div>
                <p className="font-display text-xl font-bold leading-tight text-fg-1">@vivegostoso</p>
                <p className="mt-0.5 max-w-sm text-sm text-fg-2 text-pretty">{t('home.instagram_sub')}</p>
              </div>
            </div>
            <span className="inline-flex min-h-11 flex-shrink-0 items-center gap-2 rounded-full bg-teal px-6 text-sm font-semibold text-white transition-[gap,background-color] group-hover:gap-3 group-hover:bg-teal-dark motion-reduce:transition-none">
              {t('home.instagram_titulo')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        </BlurFade>
      </section>

      {/* ── Em destaque (destaques e verificados; os novos tem faixa propria) ── */}
      <CarrosselNovos itens={carrossel} />

      {/* ── Como funciona, em 3 passos ── */}
      <section aria-labelledby="como-titulo" className="max-w-6xl mx-auto px-5 md:px-8 pb-10 md:pb-14">
        <BlurFade>
          <h2 id="como-titulo" className="font-display text-h3 font-semibold text-fg-1 text-balance">
            {t('home.como_titulo')}
          </h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
            {PASSOS.map(({ chave, Icone, caminho }, i) => (
              <li key={chave}>
                <Link
                  href={lp(caminho)}
                  onClick={() => pushDataLayer('home_passo_click', { passo: chave })}
                  className="group flex h-full gap-4 rounded-2xl border border-border-1 bg-elev p-5 transition-colors hover:border-teal/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-light text-teal-dark" aria-hidden="true">
                    <Icone className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-widest text-ocre-texto">
                      {t('home.como_passo', { n: i + 1 })}
                    </span>
                    <span className="mt-0.5 block font-display text-lg font-semibold leading-snug text-fg-1">
                      {t(`home.como_${chave}_titulo`)}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-fg-2 text-pretty">{t(`home.como_${chave}_desc`)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-4">
            <Link href={lp('/sobre')} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
              {t('home.como_funciona_cta')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </BlurFade>
      </section>

      {/* ── Últimos do blog ── */}
      {latestPosts.length > 0 && (
        <BlurFade delay={80}>
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10 md:pb-14">
          <div className="flex justify-between items-end mb-5">
            <h2 className="font-display text-h3 font-semibold">{t('home.blog_titulo')}</h2>
            <Link href={lp('/blog')} className="text-teal text-sm font-semibold hover:underline">
              {t('home.blog_ver_todos')} →
            </Link>
          </div>
          <div className={`grid gap-4 md:gap-6 ${latestPosts.length === 1 ? 'grid-cols-1 max-w-md' : latestPosts.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {latestPosts.map((post, i) => (
              <BlurFade key={post.id} delay={(i % 4) * 70} className="h-full">
              <PostCard post={post} />
              </BlurFade>
            ))}
          </div>
        </section>
        </BlurFade>
      )}

      {/* ── Verificados pela cidade: tres cartoes e uma lista de links ── */}
      {featured.length > 0 && (
        <BlurFade>
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-h3 font-semibold">{t('home.verificados_titulo')}</h2>
            <Link href={lp('/come')} className="text-teal text-sm font-semibold">{t('home.verificados_cta')} →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featured.slice(0, 3).map((b, i) => (
              <BlurFade key={b.id} delay={(i % 4) * 70} className="h-full">
                <BusinessCard business={b} />
              </BlurFade>
            ))}
          </div>
          {featured.length > 3 && (
            <ul className="mt-6 flex flex-wrap gap-2 md:mt-8">
              {featured.slice(3).map(b => (
                <li key={b.id}>
                  <Link
                    href={lp(`/negocio/${b.slug}`)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-1 bg-elev px-4 text-sm font-medium text-fg-1 transition-colors hover:border-teal hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none"
                  >
                    <BadgeCheck aria-hidden="true" className="size-4 text-teal" />
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        </BlurFade>
      )}
    </div>
  )
}
