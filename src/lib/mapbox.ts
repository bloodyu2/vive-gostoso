export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string

export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'

// Centro de São Miguel do Gostoso [lng, lat] — formato Mapbox
export const GOSTOSO_CENTER: [number, number] = [-35.6419, -5.1167]
export const GOSTOSO_ZOOM = 14

export const PIN_COLORS = {
  come:    '#C97D2A',
  fique:   '#0D7C7C',
  passeie: '#3D8B5A',
  resolva: '#1A1A1A',
} as const
