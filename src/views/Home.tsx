'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { BusinessCard } from '@/components/business/business-card'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { Hoje } from '@/components/home/hoje'
import { PostCard } from '@/components/blog/PostCard'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Marquee } from '@/components/magicui/marquee'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useStats, type SiteStats } from '@/hooks/useStats'
import { useRecentBusinesses } from '@/hooks/useRecentBusinesses'
import { useLocalePath } from '@/hooks/useLocalePath'
import { supabase } from '@/lib/supabase'
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
}

export default function Home({ initialData, vitrine }: HomeProps) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()

  const { data: allBusinesses = [] } = useBusinesses()
  const featured = allBusinesses.filter(b => b.is_featured)
  const { data: stats } = useStats(initialData ? { initialData: initialData.stats } : undefined)
  const { data: recentBusinesses = [] } = useRecentBusinesses()
  const { data: todosPosts = [] } = useLatestBlogPosts()
  const idioma = normalizarIdioma(i18n.language)
  const latestPosts = todosPosts.filter(p => visivelNoIdioma(p.slug, idioma)).slice(0, 3)

  const verbsRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToVerbs() {
    verbsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-[#1A1A1A] text-white overflow-hidden">
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
          <div className="flex flex-col gap-6 max-w-2xl">
            {/* Display headline */}
            <h1 className="font-display font-bold leading-none tracking-tight">
              <span className="flex items-center gap-3 text-xs font-semibold tracking-widest uppercase text-white/60 mb-6">
                <span className="inline-block w-2 h-2 rounded-full bg-teal" />
                {t('home.hero_h1_cidade')}
              </span>
              <span className="block text-4xl sm:text-6xl md:text-7xl text-white/90">{t('home.hero_h1_1')}</span>
              <span className="block text-4xl sm:text-6xl md:text-7xl text-white/90">{t('home.hero_h1_2')}</span>
              <span className="block text-4xl sm:text-6xl md:text-7xl text-white/90">{t('home.hero_h1_3')}</span>
              <span className="block text-3xl sm:text-5xl md:text-7xl text-coral mt-1">{t('home.hero_brand')}</span>
            </h1>

            {/* Sub */}
            <p className="text-base md:text-lg text-white/70 max-w-md leading-relaxed">
              {t('home.hero_sub')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={lp('/explore')}
                className="bg-teal text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
                {t('home.cta_explorar')}
              </Link>
              <Link href={lp('/come')}
                className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors">
                {t('home.cta_restaurantes')}
              </Link>
            </div>
          </div>

          {/* Stats — one sentence, not a tile grid */}
          {stats && (
          <p className="mt-14 pt-10 border-t border-white/10 text-white/70 text-sm md:text-base max-w-xl">
            {/* Dois numeros, os dois calculados. Nunca um so numero com a
                palavra "verificados" ao lado: e o que a home fazia ate hoje,
                dizendo "+182 negocios verificados" com 67 verificados de fato.
                Sem numero, o bloco inteiro nao aparece: um valor inventado
                seria mentir justo quando a pagina perdeu como saber a verdade. */}
            {t('home.stats_sentence', { cadastrados: stats.businesses, verificados: stats.verified })}
          </p>
          )}
        </div>

        {/* Scroll incentive */}
        <button
          onClick={scrollToVerbs}
          aria-label={t('home.scroll_label')}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 hover:text-white/80 transition-all duration-500 ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold">{t('home.scroll_label')}</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* ── Vitrine de recursos (server component, vem pronta da pagina) ── */}
      <div ref={verbsRef} className="scroll-mt-20">
        {vitrine}
      </div>

      {/* ── Recém chegados ── */}
      {recentBusinesses.length > 0 && (
        <BlurFade>
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10 md:pb-14">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display text-h3 font-semibold">{t('home.novos_titulo')}</h2>
            <Link href={lp('/come')} className="text-teal text-sm font-semibold">{t('home.ver_todos')}</Link>
          </div>
          {(() => {
            const [destaque, ...outros] = recentBusinesses
            return (
              <div className="grid gap-3 md:gap-4 sm:grid-cols-5">
                <Link
                  href={lp(`/negocio/${destaque.slug}`)}
                  className="group sm:col-span-3 bg-white dark:bg-card rounded-2xl border border-border-1 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="aspect-[4/3] sm:aspect-auto sm:flex-1 sm:min-h-64 bg-gradient-to-br from-teal to-teal-dark overflow-hidden">
                    {destaque.cover_url
                      ? <SafeCoverImage src={destaque.cover_url} alt="" sizes="(max-width: 639px) 100vw, 55vw" className="w-full h-full object-cover" />
                      : <div className="w-full h-full min-h-40 flex items-center justify-center text-white/30 text-6xl font-display font-bold">{destaque.name[0]}</div>
                    }
                  </div>
                  <div className="p-4 md:p-5">
                    <p className="font-display font-bold text-xl md:text-2xl text-fg-1 leading-tight">{destaque.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {destaque.category && <span className="text-sm text-fg-3-texto">{destaque.category.name}</span>}
                      {destaque.is_verified && <span className="inline-block text-[10px] font-bold tracking-wide uppercase text-teal-dark bg-teal-light px-2 py-0.5 rounded-full">{t('filters.verificado')}</span>}
                    </div>
                  </div>
                </Link>
                <div className="sm:col-span-2 flex flex-col gap-3 md:gap-4">
                  {outros.map((b, i) => (
                    <BlurFade key={b.id} delay={(i % 4) * 70} className="flex-1">
                      <Link
                        href={lp(`/negocio/${b.slug}`)}
                        className="group h-full min-h-16 flex items-center gap-3 bg-white dark:bg-card rounded-2xl border border-border-1 p-2.5 hover:shadow-md transition-shadow"
                      >
                        <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-teal to-teal-dark overflow-hidden">
                          {b.cover_url
                            ? <SafeCoverImage src={b.cover_url} alt="" sizes="64px" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-white/30 text-2xl font-bold">{b.name[0]}</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-fg-1 truncate leading-snug">{b.name}</p>
                          {b.category && <p className="text-xs text-fg-3-texto mt-0.5 truncate">{b.category.name}</p>}
                          {b.is_verified && <span className="inline-block mt-1 text-[10px] font-bold tracking-wide uppercase text-teal-dark bg-teal-light px-1.5 py-0.5 rounded-full">{t('filters.verificado')}</span>}
                        </div>
                      </Link>
                    </BlurFade>
                  ))}
                </div>
              </div>
            )
          })()}
        </section>
        </BlurFade>
      )}

      {/* ── Agora em Gostoso ── */}
      <Hoje />

      {/* ── Instagram ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10">
        <BlurFade>
        <a
          href="https://instagram.com/vivegostoso"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col sm:flex-row items-center justify-between gap-5 overflow-hidden rounded-2xl bg-teal-dark px-7 py-6 transition-colors hover:bg-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >

          <div className="flex items-center gap-4 relative">
            {/* Instagram icon */}
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 text-white fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg md:text-xl leading-tight">
                @vivegostoso
              </p>
              <p className="text-white/80 text-sm mt-0.5">
                {t('home.instagram_sub')}
              </p>
            </div>
          </div>

          <span className="relative flex items-center gap-2 bg-white text-teal-dark font-semibold text-sm px-5 min-h-11 rounded-full group-hover:gap-3 transition-[gap] motion-reduce:transition-none flex-shrink-0">
            {t('home.instagram_titulo')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </a>
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

      {/* ── Banner: Quer saber como funciona? ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10">
        <BlurFade>
        <Link
          href={lp('/sobre')}
          className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1A1A1A] dark:bg-white/5 text-white rounded-2xl px-6 py-5 hover:bg-[#2A2A2A] dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
              <span className="text-teal text-lg">?</span>
            </div>
            <div>
              <p className="font-semibold text-white text-base">{t('home.como_funciona_titulo')}</p>
              <p className="text-white/50 text-sm mt-0.5">{t('home.como_funciona_desc')}</p>
            </div>
          </div>
          <span className="flex-shrink-0 flex items-center gap-1.5 text-teal text-sm font-semibold group-hover:gap-2.5 transition-all">
            {t('home.como_funciona_cta')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
        </BlurFade>
      </section>

      {/* ── Verificados pela cidade ── */}
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
            <Marquee duracao={45} className="mt-6 md:mt-8">
              {featured.slice(3).map(b => (
                <span key={b.id} className="mx-2 inline-flex items-center gap-1.5 rounded-full border border-border-1 bg-white dark:bg-card px-4 min-h-11 text-sm font-medium text-fg-1 whitespace-nowrap">
                  <BadgeCheck aria-hidden="true" className="w-4 h-4 text-teal" />
                  {b.name}
                </span>
              ))}
            </Marquee>
          )}
        </section>
        </BlurFade>
      )}
    </div>
  )
}
