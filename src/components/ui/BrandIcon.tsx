type BrandIconName =
  | 'apoie' | 'barco' | 'cajueiro' | 'come' | 'conheca'
  | 'duna'  | 'explore' | 'fique' | 'jangada' | 'kite'
  | 'onda'  | 'participe' | 'passeie' | 'peixe' | 'sol' | 'vento'

interface BrandIconProps {
  name: BrandIconName
  size?: number | string
  className?: string
  alt?: string
}

export function BrandIcon({ name, size = 24, className = '', alt = '' }: BrandIconProps) {
  return (
    <img
      src={`/icons/brand/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      className={className}
      aria-hidden={!alt}
    />
  )
}
