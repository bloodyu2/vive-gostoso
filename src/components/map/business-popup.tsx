import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { isBusinessOpen } from '@/lib/utils'
import type { Business } from '@/types/database'

interface BusinessPopupProps { business: Business }

export function BusinessPopup({ business: b }: BusinessPopupProps) {
  const open = isBusinessOpen(b.opening_hours)
  return (
    <div className="w-52 font-sans">
      {b.cover_url
        ? <img src={b.cover_url} alt={b.name} className="w-full h-28 object-cover rounded-t-lg" />
        : <div className="w-full h-16 bg-gradient-to-br from-teal to-teal-dark rounded-t-lg" />}
      <div className="p-3">
        <div className="flex gap-1 mb-1.5 flex-wrap">
          {b.category && <Badge kind="cat">{b.category.name}</Badge>}
          {open ? <Badge kind="open" dot>Aberto</Badge> : <Badge kind="closed" dot>Fechado</Badge>}
        </div>
        <h3 className="font-display font-semibold text-base">{b.name}</h3>
        <Link to={`/negocio/${b.slug}`} className="mt-2 block text-teal text-xs font-semibold">
          Ver detalhes →
        </Link>
      </div>
    </div>
  )
}
