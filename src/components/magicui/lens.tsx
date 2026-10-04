'use client'
// src/components/magicui/lens.tsx
// Adaptado do `lens` do Magic UI sem `motion`: o zoom usa transform-origin
// seguindo o cursor, via CSS. Em telas de toque nao intervem (o toque segue
// abrindo o lightbox) e com prefers-reduced-motion nao ha zoom.
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface LensProps {
  children: React.ReactNode
  /** Fator de ampliacao. Default 2. */
  escala?: number
  className?: string
}

export function Lens({ children, escala = 2, className }: LensProps) {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--lens-x', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--lens-y', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      style={{ '--lens-scale': String(escala) } as React.CSSProperties}
      className={cn('lens-zoom relative overflow-hidden', className)}
    >
      {children}
    </div>
  )
}
