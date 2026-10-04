// src/components/magicui/progressive-blur.tsx
// Adaptado do `progressive-blur` do Magic UI sem dependencia: um esmaecimento
// estatico nas bordas de um carrossel horizontal, feito com backdrop-filter e
// mask-image. E estatico (nao anima), entao vale tambem para quem pediu
// prefers-reduced-motion.
import { cn } from '@/lib/utils'

interface ProgressiveBlurProps {
  side?: 'left' | 'right'
  /** Largura do esmaecimento. */
  size?: string
  className?: string
}

export function ProgressiveBlur({ side = 'right', size = '3.5rem', className }: ProgressiveBlurProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10',
        side === 'left' ? 'left-0' : 'right-0',
        className,
      )}
      style={{
        width: size,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        maskImage: `linear-gradient(to ${side}, transparent 0%, black 100%)`,
        WebkitMaskImage: `linear-gradient(to ${side}, transparent 0%, black 100%)`,
      }}
    />
  )
}
