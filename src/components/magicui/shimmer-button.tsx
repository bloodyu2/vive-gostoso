// src/components/magicui/shimmer-button.tsx
// Adaptado do `shimmer-button` do Magic UI: um brilho passa pelo botao a cada
// poucos segundos, so para chamar o olho para a acao principal. E um link
// (`<a>`), nao um `<button>`, porque a acao e sempre navegar (WhatsApp, mapa).
// A animacao esta em globals.css (`.vg-shimmer`) e desliga com
// prefers-reduced-motion.
import { cn } from '@/lib/utils'

type ShimmerButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode
}

export function ShimmerButton({ className, children, ...props }: ShimmerButtonProps) {
  return (
    <a
      className={cn(
        'vg-shimmer relative isolate overflow-hidden inline-flex items-center justify-center gap-2 text-white font-semibold transition-colors',
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </a>
  )
}
