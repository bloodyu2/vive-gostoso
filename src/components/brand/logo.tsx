interface LogoProps { height?: number; dark?: boolean }

export function Logo({ height = 28, dark = false }: LogoProps) {
  return (
    <svg viewBox="0 0 920 220" height={height} style={{ display: 'block' }} aria-label="Vive Gostoso">
      <text
        x="40" y="150"
        style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 132, fill: dark ? '#fff' : '#E05A3A', letterSpacing: '-0.04em' }}
      >Vive</text>
      <text
        x="290" y="150"
        style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 132, fill: dark ? '#E6F5F5' : '#0D7C7C', letterSpacing: '-0.04em' }}
      >Gostoso</text>
      <circle cx="880" cy="142" r="14" fill={dark ? '#E05A3A' : '#C97D2A'} />
    </svg>
  )
}
