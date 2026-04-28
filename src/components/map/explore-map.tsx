import { Link } from 'react-router-dom'
import { MapPin, Utensils, Bed, Wind, Waves } from 'lucide-react'
import type { Business } from '@/types/database'

interface ExploreMapProps { businesses: Business[] }

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  come:    <Utensils className="w-3.5 h-3.5" />,
  fique:   <Bed className="w-3.5 h-3.5" />,
  passeie: <Wind className="w-3.5 h-3.5" />,
}

const VERB_COLOR: Record<string, string> = {
  come:    'bg-ocre/15 text-ocre border-ocre/20',
  fique:   'bg-teal/10 text-teal border-teal/20',
  passeie: 'bg-[#3D8B5A]/10 text-[#3D8B5A] border-[#3D8B5A]/20',
}

export function ExploreMap({ businesses }: ExploreMapProps) {
  const geo = businesses.filter(b => b.lat != null && b.lng != null)
  const noGeo = businesses.filter(b => b.lat == null || b.lng == null)

  // Group by verb
  const byVerb = businesses.reduce<Record<string, Business[]>>((acc, b) => {
    const verb = b.category?.verb ?? 'come'
    acc[verb] = acc[verb] ?? []
    acc[verb].push(b)
    return acc
  }, {})

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Map area */}
      <div className="flex-1 relative bg-teal-light flex flex-col items-center justify-center min-h-[280px] md:min-h-0">
        {/* Faux map grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(#0D7C7C 1px, transparent 1px), linear-gradient(90deg, #0D7C7C 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative text-center px-8 py-10">
          {/* Fake pin cluster */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-teal/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-4 rounded-full bg-teal/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
            {/* Satellite pins */}
            {[
              { top: '8%',  left: '65%', color: 'bg-ocre' },
              { top: '55%', left: '80%', color: 'bg-coral' },
              { top: '72%', left: '20%', color: 'bg-teal' },
              { top: '15%', left: '15%', color: 'bg-ocre' },
            ].map((p, i) => (
              <div key={i} className={`absolute w-4 h-4 ${p.color} rounded-full shadow`}
                style={{ top: p.top, left: p.left }} />
            ))}
          </div>

          <h2 className="font-display font-bold text-2xl text-teal mb-2">Mapa interativo</h2>
          <p className="text-[#3D3D3D] text-sm max-w-xs leading-relaxed mb-1">
            Em construção — {geo.length} negócio{geo.length !== 1 ? 's' : ''} com localização cadastrada.
          </p>
          {noGeo.length > 0 && (
            <p className="text-[#737373] text-xs">
              +{noGeo.length} ainda sem coordenadas
            </p>
          )}

          <div className="mt-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-teal/20 text-teal text-xs font-semibold px-4 py-2 rounded-full">
            <Waves className="w-3.5 h-3.5" />
            Mapbox GL JS · em breve
          </div>
        </div>
      </div>

      {/* Business list sidebar */}
      <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-[#E8E4DF] overflow-y-auto">
        <div className="px-5 py-4 border-b border-[#E8E4DF] sticky top-0 bg-white z-10">
          <div className="font-semibold text-sm text-[#1A1A1A]">{businesses.length} negócios cadastrados</div>
          <div className="text-xs text-[#737373] mt-0.5">São Miguel do Gostoso, RN</div>
        </div>

        {['come', 'fique', 'passeie'].map(verb => {
          const list = byVerb[verb]
          if (!list?.length) return null
          const labels: Record<string, string> = { come: 'Restaurantes', fique: 'Hospedagem', passeie: 'Passeios' }
          const to: Record<string, string> = { come: '/come', fique: '/fique', passeie: '/passeie' }
          return (
            <div key={verb}>
              <div className="flex items-center justify-between px-5 py-3 bg-[#F5F2EE]">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs font-semibold ${VERB_COLOR[verb]}`}>
                    {CATEGORY_ICON[verb]} {labels[verb]}
                  </span>
                </div>
                <Link to={to[verb]} className="text-xs text-teal font-medium hover:underline">
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-[#F5F2EE]">
                {list.slice(0, 5).map(b => (
                  <Link
                    key={b.id}
                    to={`/negocio/${b.slug}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F2EE] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal/30 to-teal-dark/30 flex-shrink-0 overflow-hidden">
                      {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-teal transition-colors">{b.name}</div>
                      {b.address && <div className="text-xs text-[#737373] truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />{b.address}
                      </div>}
                    </div>
                    {b.lat != null && (
                      <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" title="Localização cadastrada" />
                    )}
                  </Link>
                ))}
                {list.length > 5 && (
                  <Link to={to[verb]} className="block px-5 py-3 text-xs text-teal font-medium hover:bg-[#F5F2EE] transition-colors">
                    +{list.length - 5} mais em {labels[verb].toLowerCase()} →
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {businesses.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-[#737373]">
            Nenhum negócio cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  )
}
