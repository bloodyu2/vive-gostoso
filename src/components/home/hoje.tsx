import { Link } from 'react-router-dom'
import { Clock, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useEvents } from '@/hooks/useEvents'
import { isBusinessOpen } from '@/lib/utils'

function TodayDot() {
  return <span className="inline-block w-2 h-2 rounded-full bg-[#3D8B5A] mr-2 animate-pulse" />
}

export function Hoje() {
  const { data: allBusinesses = [] } = useBusinesses()
  const { data: events = [] } = useEvents()

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const openNow = allBusinesses.filter(b => isBusinessOpen(b.opening_hours))

  const todayEvents = events.filter(e => {
    const start = new Date(e.starts_at)
    const end = e.ends_at ? new Date(e.ends_at) : start
    return start.toISOString().slice(0, 10) <= todayStr && end.toISOString().slice(0, 10) >= todayStr
  })

  if (openNow.length === 0 && todayEvents.length === 0) return null

  const dayLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <section className="max-w-6xl mx-auto px-8 pb-16">
      <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TodayDot />
              <span className="text-xs font-semibold tracking-widest uppercase text-white/60">Agora em Gostoso</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-white capitalize">{dayLabel}</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Abertos agora */}
          {openNow.length > 0 && (
            <div className="p-7">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#3D8B5A]" />
                <span className="text-sm font-semibold text-white/80">Abertos agora</span>
                <span className="ml-auto text-xs text-white/40">{openNow.length} negócio{openNow.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {openNow.slice(0, 5).map(b => (
                  <Link
                    key={b.id}
                    to={`/negocio/${b.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex-shrink-0 overflow-hidden">
                      {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium group-hover:text-teal-light transition-colors truncate">{b.name}</div>
                      {b.category && <div className="text-white/40 text-xs truncate">{b.category.name}</div>}
                    </div>
                    <Badge kind="open" dot className="ml-auto flex-shrink-0">Aberto</Badge>
                  </Link>
                ))}
                {openNow.length > 5 && (
                  <Link to="/come" className="block text-xs text-white/40 hover:text-teal-light pt-1 transition-colors">
                    +{openNow.length - 5} mais abertos →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Eventos de hoje */}
          {todayEvents.length > 0 && (
            <div className="p-7">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-coral" />
                <span className="text-sm font-semibold text-white/80">Acontecendo hoje</span>
                <span className="ml-auto text-xs text-white/40">{todayEvents.length} evento{todayEvents.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {todayEvents.slice(0, 4).map(e => (
                  <div key={e.id} className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-coral/20 flex-shrink-0 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-coral" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium leading-snug">{e.name}</div>
                      {e.location && <div className="text-white/40 text-xs mt-0.5">{e.location}</div>}
                    </div>
                  </div>
                ))}
                {todayEvents.length > 4 && (
                  <Link to="/participe" className="block text-xs text-white/40 hover:text-coral pt-1 transition-colors">
                    Ver todos os eventos →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
