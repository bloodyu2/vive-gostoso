import { Link } from 'react-router-dom'
import { EventCard } from '@/components/events/event-card'
import { BusinessCard } from '@/components/business/business-card'
import { Hoje } from '@/components/home/hoje'
import { useEvents } from '@/hooks/useEvents'
import { useBusinesses } from '@/hooks/useBusinesses'

const VERBS = [
  { to: '/come',      label: 'COME.',      color: 'text-ocre',       sub: 'Restaurantes e gastronomia' },
  { to: '/fique',     label: 'FIQUE.',     color: 'text-teal',        sub: 'Pousadas e hospedagem' },
  { to: '/passeie',   label: 'PASSEIE.',   color: 'text-[#3D8B5A]',  sub: 'Passeios e esportes' },
  { to: '/explore',   label: 'EXPLORE.',   color: 'text-coral',       sub: 'Mapa interativo' },
  { to: '/participe', label: 'PARTICIPE.', color: 'text-teal',        sub: 'Eventos e festivais' },
  { to: '/apoie',     label: 'APOIE.',     color: 'text-ocre',        sub: 'Fundo transparente' },
]

export default function Home() {
  const { data: events = [] } = useEvents(true)
  const { data: allBusinesses = [] } = useBusinesses()
  const featured = allBusinesses.filter(b => b.is_featured)

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
                São Miguel do Gostoso · RN
              </span>
            </div>

            {/* Display headline */}
            <h1 className="font-display font-bold leading-none tracking-tight">
              <span className="block text-5xl sm:text-6xl md:text-7xl text-white/90">Come.</span>
              <span className="block text-5xl sm:text-6xl md:text-7xl text-white/90">Fique.</span>
              <span className="block text-5xl sm:text-6xl md:text-7xl text-white/90">Passeie.</span>
              <span className="block text-5xl sm:text-6xl md:text-7xl text-coral mt-1">Vive Gostoso.</span>
            </h1>

            {/* Sub */}
            <p className="text-base md:text-lg text-white/70 max-w-md leading-relaxed">
              A infraestrutura digital de São Miguel do Gostoso. Negócios, eventos, mapa — tudo numa cidade só.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/explore"
                className="bg-teal text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
                Explorar a cidade
              </Link>
              <Link to="/come"
                className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors">
                Ver restaurantes
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14 pt-10 border-t border-white/10">
            {[
              { n: '250+',   label: 'hospedagens' },
              { n: '4.500',  label: 'leitos' },
              { n: '10+',    label: 'festivais por ano' },
              { n: '100%',   label: 'dinheiro fica na cidade' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-white">{s.n}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verb grid ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {VERBS.map(v => (
            <Link key={v.to} to={v.to}
              className="bg-white rounded-2xl border border-[#E8E4DF] p-5 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`font-display font-bold text-3xl md:text-4xl ${v.color}`}>{v.label}</div>
              <div className="text-xs md:text-sm text-[#737373] mt-1 leading-snug">{v.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Agora em Gostoso ── */}
      <Hoje />

      {/* ── Próximos eventos ── */}
      {events.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold">Próximos eventos</h2>
            <Link to="/participe" className="text-teal text-sm font-semibold">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {events.slice(0, 3).map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* ── Verificados pela cidade ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold">Verificados pela cidade</h2>
            <Link to="/come" className="text-teal text-sm font-semibold">Ver diretório →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featured.slice(0, 3).map(b => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>
      )}
    </div>
  )
}
