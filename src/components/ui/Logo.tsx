interface LogoProps {
  variant?: 'wordmark' | 'vmark'
  className?: string
  alt?: string
}

export function Logo({ variant = 'wordmark', className = '', alt = 'Vive Gostoso' }: LogoProps) {
  const src = variant === 'vmark' ? '/brand/v-mark.svg' : '/brand/wordmark.svg'
  return <img src={src} alt={alt} className={className} />
}
