import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, X } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLocalePath } from '@/hooks/use-locale-path'
import type { Business } from '@/types/database'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

// Centro de São Miguel do Gostoso
const CENTER: [number, number] = [-35.6378, -5.1178]
const ZOOM = 14

const VERB_COLOR: Record<string, string> = {
  come:    '#C97D2A',
  fique:   '#0D7C7C',
  passeie: '#3D8B5A',
  resolva: '#1A1A1A',
}

const VERB_EMOJI: Record<string, string> = {
  come:    '🍽',
  fique:   '🏠',
  passeie: '🏄',
  resolva: '🔧',
}

interface PopupBusiness {
  name: string
  slug: string
  cover_url: string | null
  category: Business['category']
  address: string | null
}

interface ExploreMapProps { businesses: Business[] }

export function ExploreMap({ businesses }: ExploreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [popup, setPopup] = useState<PopupBusiness | null>(null)
  const lp = useLocalePath()

  const geo = businesses.filter(b => b.lat != null && b.lng != null)
  const noGeo = businesses.filter(b => b.lat == null || b.lng == null)

  // Group by verb for sidebar
  const byVerb = businesses.reduce<Record<string, Business[]>>((acc, b) => {
    const verb = b.category?.verb ?? 'come'
    acc[verb] = acc[verb] ?? []
    acc[verb].push(b)
    return acc
  }, {})

  // Init map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: CENTER,
      zoom: ZOOM,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add markers when businesses load
  useEffect(() => {
    if (!map.current) return

    // Clear old markers
    markers.current.forEach(m => m.remove())
    markers.current = []

    geo.forEach(b => {
      const verb = b.category?.verb ?? 'come'
      const color = VERB_COLOR[verb] ?? '#0D7C7C'

      const el = document.createElement('div')
      el.style.cssText = `
        width: 14px; height: 14px;
        border-radius: 50%;
        background: ${color};
        border: 2.5px solid white;
        box-shadow: 0 1px 6px rgba(0,0,0,0.30);
        cursor: pointer;
        transition: width 0.12s, height 0.12s;
        box-sizing: border-box;
      `
      el.addEventListener('mouseenter', () => {
        el.style.width = '18px'
        el.style.height = '18px'
      })
      el.addEventListener('mouseleave', () => {
        el.style.width = '14px'
        el.style.height = '14px'
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([b.lng!, b.lat!])
        .addTo(map.current!)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setPopup({ name: b.name, slug: b.slug, cover_url: b.cover_url, category: b.category, address: b.address })
        map.current?.flyTo({ center: [b.lng!, b.lat!], zoom: Math.max(map.current.getZoom(), 15), duration: 600 })
      })

      markers.current.push(marker)
    })
  }, [geo.length])

  // Close popup on map click
  useEffect(() => {
    if (!map.current) return
    const close = () => setPopup(null)
    map.current.on('click', close)
    return () => { map.current?.off('click', close) }
  }, [])

  const VERB_LABEL: Record<string, string> = { come: 'Restaurantes', fique: 'Hospedagem', passeie: 'Passeios', resolva: 'Serviços' }
  const VERB_TO: Record<string, string>    = { come: '/come', fique: '/fique', passeie: '/passeie', resolva: '/resolva' }
  const SIDEBAR_VERBS = ['come', 'fique', 'passeie']

  const activeVerbs = SIDEBAR_VERBS.filter(v => byVerb[v]?.length)

  function jumpToSection(verb: string) {
    const el = sectionRefs.current[verb]
    const sidebar = sidebarRef.current
    if (!el || !sidebar) return
    const elRect = el.getBoundingClientRect()
    const sidebarRect = sidebar.getBoundingClientRect()
    const target = sidebar.scrollTop + elRect.top - sidebarRect.top - 110
    sidebar.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">

      {/* Mapa */}
      <div className="h-[42vh] flex-shrink-0 md:flex-1 md:h-full relative min-h-[240px]">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Stats chip */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-[#E8E4DF] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] shadow-sm pointer-events-none">
          <span className="font-semibold text-teal">{geo.length}</span> no mapa
          {noGeo.length > 0 && <span className="text-[#B0A89E] ml-1.5">· {noGeo.length} sem localização</span>}
        </div>

        {/* Popup card */}
        {popup && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E4DF] overflow-hidden z-10">
            {popup.cover_url && (
              <div className="h-32 bg-gradient-to-br from-teal/30 to-teal-dark/30 overflow-hidden">
                <img src={popup.cover_url} alt={popup.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {popup.category && (
                    <div
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
                      style={{ background: (VERB_COLOR[popup.category.verb] ?? '#0D7C7C') + '18', color: VERB_COLOR[popup.category.verb] ?? '#0D7C7C' }}
                    >
                      {popup.category.name}
                    </div>
                  )}
                  <div className="font-semibold text-[#1A1A1A] leading-tight">{popup.name}</div>
                  {popup.address && (
                    <div className="text-xs text-[#737373] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{popup.address}
                    </div>
                  )}
                </div>
                <button onClick={() => setPopup(null)} className="text-[#B0A89E] hover:text-[#1A1A1A] flex-shrink-0 mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Link
                to={lp(`/negocio/${popup.slug}`)}
                className="mt-3 block text-center text-sm font-semibold bg-teal text-white rounded-xl px-4 py-2 hover:bg-teal-dark transition-colors"
              >
                Ver perfil
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div ref={sidebarRef} className="flex-1 min-h-0 w-full md:flex-none md:w-80 bg-white border-t md:border-t-0 md:border-l border-[#E8E4DF] overflow-y-auto">
        {/* Sticky header: count + category jump pills */}
        <div className="sticky top-0 bg-white z-10 border-b border-[#E8E4DF]">
          <div className="px-5 pt-4 pb-2">
            <div className="font-semibold text-sm text-[#1A1A1A]">{businesses.length} negócios cadastrados</div>
            <div className="text-xs text-[#737373] mt-0.5">São Miguel do Gostoso, RN</div>
          </div>
          {/* Jump pills — only shown when 2+ categories have businesses */}
          {activeVerbs.length > 1 && (
            <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-none">
              {activeVerbs.map(verb => (
                <button
                  key={verb}
                  onClick={() => jumpToSection(verb)}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
                  style={{
                    borderColor: VERB_COLOR[verb] + '55',
                    color: VERB_COLOR[verb],
                    background: VERB_COLOR[verb] + '10',
                  }}
                >
                  <span>{VERB_EMOJI[verb]}</span>
                  {VERB_LABEL[verb]}
                </button>
              ))}
            </div>
          )}
        </div>

        {SIDEBAR_VERBS.map(verb => {
          const list = byVerb[verb]
          if (!list?.length) return null
          return (
            <div key={verb} ref={el => { sectionRefs.current[verb] = el }}>
              <div className="flex items-center justify-between px-5 py-3 bg-[#F5F2EE]">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ background: (VERB_COLOR[verb]) + '18', color: VERB_COLOR[verb], borderColor: VERB_COLOR[verb] + '33' }}
                >
                  {VERB_LABEL[verb]}
                </span>
                <Link to={lp(VERB_TO[verb])} className="text-xs text-teal font-medium hover:underline">
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-[#F5F2EE]">
                {list.slice(0, 5).map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (b.lat && b.lng) {
                        map.current?.flyTo({ center: [b.lng, b.lat], zoom: 16, duration: 800 })
                        setPopup({ name: b.name, slug: b.slug, cover_url: b.cover_url, category: b.category, address: b.address })
                      }
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F2EE] transition-colors group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal/30 to-teal-dark/30 flex-shrink-0 overflow-hidden">
                      {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-teal transition-colors">{b.name}</div>
                      {b.address && (
                        <div className="text-xs text-[#737373] truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />{b.address}
                        </div>
                      )}
                    </div>
                    {b.lat != null
                      ? <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" title="No mapa" />
                      : <div className="w-2 h-2 rounded-full bg-[#D4CFCA] flex-shrink-0" title="Sem localização" />
                    }
                  </button>
                ))}
                {list.length > 5 && (
                  <Link to={lp(VERB_TO[verb])} className="block px-5 py-3 text-xs text-teal font-medium hover:bg-[#F5F2EE] transition-colors">
                    +{list.length - 5} mais em {VERB_LABEL[verb].toLowerCase()} →
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
