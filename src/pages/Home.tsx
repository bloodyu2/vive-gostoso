import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'
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
      <section className="bg-[#1A1A1A] text-white px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <Logo height={56} dark />
          <p className="mt-6 text-xl opacity-85 max-w-lg leading-relaxed">
            São Miguel do Gostoso, RN.<br />A infraestrutura digital da cidade.
          </p>
          <p className="mt-4 font-display font-bold text-3xl leading-tight">
            Come. Fique. Passeie.<br />
            <span className="text-coral">Vive Gostoso.</span>
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {VERBS.map(v => (
            <Link key={v.to} to={v.to} className="bg-white rounded-2xl border border-[#E8E4DF] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`font-display font-bold text-4xl ${v.color}`}>{v.label}</div>
              <div className="text-sm text-[#737373] mt-1">{v.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      <Hoje />

      {events.length > 0 && (
        <section className="max-w-6xl mx-auto px-8 pb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-semibold">Próximos eventos</h2>
            <Link to="/participe" className="text-teal text-sm font-semibold">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-8 pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-semibold">Verificados pela cidade</h2>
            <Link to="/come" className="text-teal text-sm font-semibold">Ver diretório →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 3).map(b => <BusinessCard key={b.id} business={b} />)}
          </div>
        </section>
      )}
    </div>
  )
}
