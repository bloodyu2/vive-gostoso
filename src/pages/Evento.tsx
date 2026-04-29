import { useParams, Link } from 'react-router-dom'
import { CalendarDays, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Badge } from '@/components/ui/badge'

const typeMap: Record<string, string> = {
  festival: 'Festival', esporte: 'Esporte', cultural: 'Cultural', gastronomia: 'Gastronomia',
}

export default function Evento() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading } = useEvent(id ?? '')

  usePageMeta({
    title: event ? event.name : 'Evento',
    description: event?.description ?? 'Evento em São Miguel do Gostoso.',
  })

  if (isLoading) return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12 animate-pulse">
      <div className="h-64 bg-[#E8E4DF] rounded-2xl mb-6" />
      <div className="h-8 bg-[#E8E4DF] rounded w-2/3 mb-3" />
      <div className="h-4 bg-[#E8E4DF] rounded w-1/3" />
    </main>
  )

  if (!event) return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12 text-center">
      <div className="text-5xl mb-4">🗓️</div>
      <h1 className="font-display text-2xl font-semibold mb-2">Evento não encontrado</h1>
      <Link to="/participe" className="text-teal text-sm font-semibold">← Ver todos os eventos</Link>
    </main>
  )

  const start = new Date(event.starts_at)
  const end = event.ends_at ? new Date(event.ends_at) : null
  const dateStr = start.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const endStr = end ? end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : null

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-10">
      <Link to="/participe" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Todos os eventos
      </Link>

      {/* Cover */}
      <div className="aspect-[16/7] rounded-2xl overflow-hidden bg-gradient-to-br from-teal to-teal-dark mb-6">
        {event.cover_url && <img src={event.cover_url} alt={event.name} className="w-full h-full object-cover" />}
      </div>

      {/* Badges + type */}
      <div className="flex flex-wrap gap-2 mb-4">
        {event.event_type && typeMap[event.event_type] && (
          <Badge kind="cat">{typeMap[event.event_type]}</Badge>
        )}
        {event.is_featured && <Badge kind="verif">Destaque</Badge>}
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-4">{event.name}</h1>

      {/* Meta */}
      <div className="flex flex-col gap-2 mb-6 text-sm text-[#3D3D3D]">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-teal flex-shrink-0" />
          <span className="capitalize">{dateStr}{timeStr !== '00:00' ? ` às ${timeStr}` : ''}</span>
          {endStr && <span className="text-[#737373]">até {endStr}</span>}
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-coral flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-base text-[#3D3D3D] leading-relaxed whitespace-pre-line mb-8">{event.description}</p>
      )}

      {/* CTA */}
      {event.source_url && (
        <a href={event.source_url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-6 py-3 rounded-full hover:bg-teal-dark transition-colors">
          Saiba mais <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </main>
  )
}
