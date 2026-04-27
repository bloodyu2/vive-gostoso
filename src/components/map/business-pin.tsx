import { PIN_COLORS } from '@/lib/mapbox'

interface BusinessPinProps {
  verb: 'come' | 'fique' | 'passeie'
  onClick?: (e: React.MouseEvent) => void
  size?: number
}

export function BusinessPin({ verb, onClick, size = 28 }: BusinessPinProps) {
  const color = PIN_COLORS[verb] ?? '#0D7C7C'
  return (
    <button
      onClick={onClick}
      className="cursor-pointer border-none bg-transparent p-0 hover:scale-110 transition-transform"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill={color} />
        <circle cx="14" cy="14" r="5" fill="white" />
      </svg>
    </button>
  )
}
