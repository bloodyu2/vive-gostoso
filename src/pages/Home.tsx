import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EventCard } from '@/components/events/event-card'
import { BusinessCard } from '@/components/business/business-card'
import { Hoje } from '@/components/home/hoje'
import { useEvents } from '@/hooks/useEvents'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useStats } from '@/hooks/useStats'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useRecentBusinesses } from '@/hooks/useRecentBusinesses'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function Home() {
  const { t } = useTranslation()
  const lp = useLocalePath()

  const VERBS = [
    { to: lp('/come'),      label: t('nav.come') + '.',      color: 'text-ocre',       sub: t('home.verbs_come_sub') },
    { to: lp('/fique'),     label: t('nav.fique') + '.',     color: 'text-teal',        sub: t('home.verbs_fique_sub') },
    { to: lp('/passeie'),   label: t('nav.passeie') + '.',   color: 'text-[#3D8B5A]',  sub: t('home.verbs_passeie_sub') },
    { to: lp('/explore'),   label: t('nav.explore') + '.',   color: 'text-coral',       sub: t('home.verbs_explore_sub') },
    { to: lp('/participe'), label: t('nav.participe') + '.', color: 'text-teal',        sub: t('home.verbs_participe_sub') },
    { to: lp('/apoie'),     label: t('nav.apoie') + '.',     color: 'text-ocre',        sub: t('home.verbs_apoie_sub') },
    { to: lp('/contrate'),  label: t('nav.contrate') + '.',  color: 'text-[#1A1A1A]',  sub: t('home.verbs_contrate_sub') },
  ]

  usePageMeta({
    title: 'São Miguel do Gostoso, RN',
    description: 'Come. Fique. Passeie. O guia completo de São Miguel do Gostoso: restaurantes, pousadas, passeios e muito mais.',
  })
  const { data: events = [] } = useEvents(true)
  const { data: allBusinesses = [] } = useBusinesses()
  const featured = allBusinesses.filter(b => b.is_featured)
  const { data: stats } = useStats()
  const { data: recentBusinesses = [] } = useRecentBusinesses()

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
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
          <div className="flex flex-col gap-6 max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white/60">
                {t('home.eyebrow')}
              </span>
            </div>

            {/* Display headline */}
            <h1 className="font-display font-bold leading-none tracking-tight">
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
              <Link to={lp('/explore')}
                className="bg-teal text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
                {t('home.cta_explorar')}
              </Link>
              <Link to={lp('/come')}
                className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors">
                {t('home.cta_restaurantes')}
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14 pt-10 border-t border-white/10">
            {[
              {
                n: stats?.businesses ? `${stats.businesses}` : '—',
                label: t('home.stat_negocios'),
              },
              {
                n: stats?.accommodations ? `${stats.accommodations}` : '—',
                label: t('home.stat_hospedagens'),
              },
              {
                n: stats?.events ? `${stats.events}` : '—',
                label: t('home.stat_eventos'),
              },
              { n: '100%', label: t('home.stat_dinheiro') },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-white">{s.n}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll incentive */}
        <button
          onClick={scrollToVerbs}
          aria-label={t('home.scroll_label')}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/80 transition-all duration-500 ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold">{t('home.scroll_label')}</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* ── Verb grid ── */}
      <section ref={verbsRef} className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* Mobile: lista vertical com ícone de seta. Tablet+: grid 2 ou 3 colunas */}
        <div className="flex flex-col sm:hidden gap-2">
          {VERBS.map(v => (
            <Link key={v.to} to={v.to}
              className="bg-white rounded-2xl border border-[#E8E4DF] px-5 py-4 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98]">
              <div>
                <div className={`font-display font-bold text-2xl ${v.color}`}>{v.label}</div>
                <div className="text-xs text-[#737373] mt-0.5">{v.sub}</div>
              </div>
              <svg className="w-5 h-5 text-[#C4BFBA] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {VERBS.map(v => (
            <Link key={v.to} to={v.to}
              className="bg-white rounded-2xl border border-[#E8E4DF] p-5 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`font-display font-bold text-3xl md:text-4xl ${v.color}`}>{v.label}</div>
              <div className="text-sm text-[#737373] mt-1 leading-snug">{v.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recém chegados ── */}
      {recentBusinesses.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10 md:pb-14">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#737373]">{t('home.novos_eyebrow')}</span>
              <h2 className="font-display text-xl md:text-2xl font-semibold mt-0.5">{t('home.novos_titulo')}</h2>
            </div>
            <Link to={lp('/come')} className="text-teal text-sm font-semibold">{t('home.ver_todos')}</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentBusinesses.map(b => (
              <Link
                key={b.id}
                to={lp(`/negocio/${b.slug}`)}
                className="group bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-teal to-teal-dark overflow-hidden">
                  {b.cover_url
                    ? <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-white/30 text-3xl font-bold">{b.name[0]}</div>
                  }
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#1A1A1A] truncate leading-snug">{b.name}</p>
                  {b.category && <p className="text-[10px] text-[#737373] mt-0.5 truncate">{b.category.name}</p>}
                  {b.is_verified && <span className="inline-block mt-1.5 text-[9px] font-bold tracking-wide uppercase text-teal bg-teal-light px-1.5 py-0.5 rounded-full">Verificado</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Agora em Gostoso ── */}
      <Hoje />

      {/* ── Próximos eventos ── */}
      {events.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold">{t('home.eventos_titulo')}</h2>
            <Link to={lp('/participe')} className="text-teal text-sm font-semibold">{t('home.ver_todos')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {events.slice(0, 3).map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* ── Instagram ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10">
        <a
          href="https://instagram.com/vivegostoso"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col sm:flex-row items-center justify-between gap-5 overflow-hidden rounded-2xl px-7 py-6 transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}
        >
          {/* subtle shine */}
          <div className="pointer-events-none absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-2xl" />

          <div className="flex items-center gap-4 relative">
            {/* Instagram icon */}
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
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

          <span className="relative flex items-center gap-2 bg-white text-[#833ab4] font-semibold text-sm px-5 py-2.5 rounded-full group-hover:gap-3 transition-all flex-shrink-0">
            {t('home.instagram_titulo')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </section>

      {/* ── Banner: Quer saber como funciona? ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-10">
        <Link
          to={lp('/sobre')}
          className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1A1A1A] dark:bg-white/5 text-white rounded-2xl px-6 py-5 hover:bg-[#2A2A2A] dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center flex-shrink-0">
              <span className="text-teal text-lg">?</span>
            </div>
            <div>
              <p className="font-semibold text-white text-base">Quer saber como o Vive Gostoso funciona?</p>
              <p className="text-white/50 text-sm mt-0.5">Entenda o modelo, a transparência financeira e como participar.</p>
            </div>
          </div>
          <span className="flex-shrink-0 flex items-center gap-1.5 text-teal text-sm font-semibold group-hover:gap-2.5 transition-all">
            Saiba mais
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      {/* ── Verificados pela cidade ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold">Verificados pela cidade</h2>
            <Link to={lp('/come')} className="text-teal text-sm font-semibold">Ver diretório →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featured.slice(0, 3).map(b => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>
      )}
    </div>
  )
}
