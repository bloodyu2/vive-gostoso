import { useId } from 'react'

interface MarkProps { size?: number; shape?: 'circle' | 'square'; className?: string }

/** Monograma V - sol ocre, mar teal. Use sozinho em espacos quadrados/circulares. */
export function Mark({ size = 40, shape = 'circle', className }: MarkProps) {
  const r = shape === 'circle' ? 32 : 14
  const uid = useId().replace(/:/g, '')
  const clip = `vg-clip-${uid}`
  const sun = `vg-sun-${uid}`
  const sea = `vg-sea-${uid}`
  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64" className={className}
      role="img" aria-label="Vive Gostoso" style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={clip}><rect width="64" height="64" rx={r} ry={r} /></clipPath>
        <radialGradient id={sun} cx="30%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#EFAF63" />
          <stop offset="70%" stopColor="#D08A33" />
          <stop offset="100%" stopColor="#C07C26" />
        </radialGradient>
        <linearGradient id={sea} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12A0A0" />
          <stop offset="55%" stopColor="#0D7C7C" />
          <stop offset="100%" stopColor="#0A6A6A" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill="#F5F2EE" />
        <circle cx="49.6" cy="6.1" r="14.4" fill={`url(#${sun})`} />
        <rect y="50.6" width="64" height="13.4" fill={`url(#${sea})`} />
        <path d="M0 56 Q8 52.6 16 56 T32 56 T48 56 T64 56 L64 64 L0 64 Z" fill="#085E5E" opacity="0.42" />
        <rect y="50.6" width="64" height="0.4" fill="#1A1A1A" opacity="0.2" />
        <g fill="#E05A3A">
          <rect x="13.5" y="13.4" width="13.5" height="2.8" />
          <rect x="39.4" y="13.4" width="10.6" height="2.2" />
          <path d="M17 15 L24.5 15 L34.8 49.6 L29.6 49.6 Z" />
          <path d="M44 15 L46.6 15 L33.4 49.6 L31.6 49.6 Z" />
        </g>
      </g>
    </svg>
  )
}

interface LogoProps { height?: number; dark?: boolean; markOnly?: boolean }

/** Lockup horizontal oficial: monograma + "Vive Gostoso." */
export function Logo({ height = 28, dark = false, markOnly = false }: LogoProps) {
  if (markOnly) return <Mark size={height} />
  return (
    <span
      aria-label="Vive Gostoso"
      style={{ display: 'inline-flex', alignItems: 'center', gap: height * 0.28 }}
    >
      <Mark size={height} />
      <span
        className={dark ? 'text-white' : 'text-[#1A1A1A] dark:text-white'}
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 700,
          fontSize: height * 0.62,
          lineHeight: 1,
          letterSpacing: '-0.025em',
          whiteSpace: 'nowrap',
        }}
      >
        Vive Gostoso
        <span className={dark ? 'text-[#E8A04E]' : 'text-[#C97D2A] dark:text-[#E8A04E]'}>.</span>
      </span>
    </span>
  )
}
