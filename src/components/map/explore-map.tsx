import { useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN, MAP_STYLE, GOSTOSO_CENTER, GOSTOSO_ZOOM } from '@/lib/mapbox'
import { BusinessPin } from './business-pin'
import { BusinessPopup } from './business-popup'
import type { Business } from '@/types/database'

interface ExploreMapProps { businesses: Business[] }

export function ExploreMap({ businesses }: ExploreMapProps) {
  const [selected, setSelected] = useState<Business | null>(null)
  const geo = businesses.filter(b => b.lat != null && b.lng != null)

  return (
    <div className="w-full h-full">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: GOSTOSO_CENTER[0],
          latitude: GOSTOSO_CENTER[1],
          zoom: GOSTOSO_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        onClick={() => setSelected(null)}
      >
        {geo.map(b => (
          <Marker key={b.id} longitude={b.lng!} latitude={b.lat!} anchor="center">
            <BusinessPin
              verb={(b.category?.verb ?? 'come') as 'come' | 'fique' | 'passeie'}
              onClick={e => { e.stopPropagation(); setSelected(b) }}
            />
          </Marker>
        ))}
        {selected?.lat != null && selected?.lng != null && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            onClose={() => setSelected(null)}
            closeButton={false}
            className="!p-0 !rounded-xl !overflow-hidden"
          >
            <BusinessPopup business={selected} />
          </Popup>
        )}
      </Map>
    </div>
  )
}
