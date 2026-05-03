export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'

export const GOSTOSO_CENTER: [number, number] = [-35.6378, -5.1178]
export const GOSTOSO_ZOOM = 13.5

export const PIN_COLORS = {
  come:    '#E05A3A',
  fique:   '#0D7C7C',
  passeie: '#C97D2A',
} as const
