import { Badge } from '@/components/ui/badge'
import type { GostosoEvent } from '@/types/database'

const typeMap: Record<string, { kind: 'cat' | 'pous' | 'pass' | 'fest'; label: string }> = {
  festival:    { kind: 'fest', label: 'Festival' },
  esporte:     { kind: 'pass', label: 'Esporte' },
  cultural:    { kind: 'cat',  label: 'Cultural' },
  gastronomia: { kind: 'cat',  label: 'Gastronomia' },
}

function CardContent({ event: e }: { event: GostosoEvent }) {
  const type = e.event_type ? typeMap[e.event_type] : null
  const start = new Date(e.starts_at)
  const dateStr = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return (
    <>
      <div className="aspect-[16/7] bg-gradient-to-br from-teal to-teal-dark relative overflow-hidden">
        {e.cover_url && <img src={e.cover_url} alt={e.name} className="w-full h-full object-cover" />}
        {e.is_featured && <div className="absolute top-3 left-3"><Badge kind="verif">Destaque</Badge></div>}
      </div>
      <div className="p-5">
        <div className="flex gap-1.5 mb-2 flex-wrap items-center">
          {type && <Badge kind={type.kind}>{type.label}</Badge>}
          <span className="text-xs text-[#737373] font-medium">{dateStr}</span>
        </div>
        <h3 className="font-display font-semibold text-xl">{e.name}</h3>
        {e.location && <p className="text-xs text-[#737373] mt-1">{e.location}</p>}
        {e.description && <p className="text-sm text-[#3D3D3D] mt-2 line-clamp-2">{e.description}</p>}
        {e.source_url && (
          <span className="mt-3 inline-block text-teal text-sm font-semibold">
            Saiba mais &rarr;
          </span>
        )}
      </div>
    </>
  )
}

export function EventCard({ event: e }: { event: GostosoEvent }) {
  const baseClass = "bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden transition-all duration-200"

  if (e.source_url) {
    return (
      <a
        href={e.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} hover:shadow-md hover:-translate-y-0.5 block`}
      >
        <CardContent event={e} />
      </a>
    )
  }

  return (
    <article className={baseClass}>
      <CardContent event={e} />
    </article>
  )
}
