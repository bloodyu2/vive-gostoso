import type { Business } from '@/types/database'
import { MapPin } from 'lucide-react'

interface ExploreMapProps { businesses: Business[] }

export function ExploreMap({ businesses }: ExploreMapProps) {
  const geo = businesses.filter(b => b.lat != null && b.lng != null)

  return (
    <div className="w-full h-full bg-teal-light flex flex-col items-center justify-center gap-6 text-center px-8">
      <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center">
        <MapPin className="w-8 h-8 text-teal" />
      </div>
      <div>
        <h2 className="font-display font-bold text-3xl text-teal mb-2">Mapa interativo</h2>
        <p className="text-[#3D3D3D] text-sm max-w-xs leading-relaxed">
          Em breve — {geo.length} negócio{geo.length !== 1 ? 's' : ''} localizado{geo.length !== 1 ? 's' : ''} em Gostoso prontos para aparecer no mapa.
        </p>
      </div>
      {geo.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full mt-2">
          {geo.slice(0, 4).map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-[#E8E4DF] px-4 py-3 text-left">
              <div className="text-sm font-semibold text-[#1A1A1A]">{b.name}</div>
              {b.address && <div className="text-xs text-[#737373] mt-0.5">{b.address}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
