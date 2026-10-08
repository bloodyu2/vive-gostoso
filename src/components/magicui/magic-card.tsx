'use client'
// src/components/magicui/magic-card.tsx
// Adaptado do `magic-card` do Magic UI sem `motion`: um brilho suave segue o
// cursor dentro do cartao. Escreve duas variaveis CSS direto no elemento (sem
// re-renderizar o React a cada movimento) e so reage a mouse; no toque nao
// existe cursor, entao nada muda. Com prefers-reduced-motion nao ha brilho.
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface MagicCardProps {
  children: React.ReactNode
  className?: string
}

export function MagicCard({ children, className }: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <div ref={ref} onPointerMove={aoMover} className={cn('vg-magic-card relative', className)}>
      {children}
    </div>
  )
}
