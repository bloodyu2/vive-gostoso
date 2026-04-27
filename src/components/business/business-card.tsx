import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { isBusinessOpen } from '@/lib/utils'
import type { Business } from '@/types/database'

interface BusinessCardProps { business: Business }

export function BusinessCard({ business: b }: BusinessCardProps) {
  const open = isBusinessOpen(b.opening_hours)
  return (
    <Link to={`/negocio/${b.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-[#E8E4DF] hover:border-ocre hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="aspect-[4/3] bg-gradient-to-br from-teal to-teal-dark relative overflow-hidden">
        {b.cover_url
          ? <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />
          : <div className="absolute inset-0 bg-gradient-to-br from-teal to-teal-dark" />}
        {b.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge kind="verif">✓ Verificado</Badge>
          </div>
        )}
      </div>
      <div className="p-4 pb-5">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {b.category && <Badge kind="cat">{b.category.name}</Badge>}
          {open ? <Badge kind="open" dot>Aberto</Badge> : <Badge kind="closed" dot>Fechado</Badge>}
        </div>
        <h3 className="font-display font-semibold text-xl tracking-tight mt-1 mb-0.5">{b.name}</h3>
        {b.address && <p className="text-xs text-[#737373]">{b.address}</p>}
        {b.description && <p className="text-sm text-[#3D3D3D] mt-2 italic line-clamp-2">{b.description}</p>}
        <div className="mt-3 text-teal text-sm font-semibold">Ver onde fica →</div>
      </div>
    </Link>
  )
}
