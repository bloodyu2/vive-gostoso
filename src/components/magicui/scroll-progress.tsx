'use client'
// src/components/magicui/scroll-progress.tsx
// Adaptado do `scroll-progress` do Magic UI sem `motion`: uma linha no topo que
// acompanha a leitura, calculada com requestAnimationFrame + transform scaleX.
import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barraRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const atualizar = () => {
      raf = 0
      const el = barraRef.current
      if (!el) return
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      const progresso = total > 0 ? Math.min(1, Math.max(0, doc.scrollTop / total)) : 0
      el.style.transform = `scaleX(${progresso})`
    }
    const agendar = () => { if (!raf) raf = requestAnimationFrame(atualizar) }
    atualizar()
    window.addEventListener('scroll', agendar, { passive: true })
    window.addEventListener('resize', agendar)
    return () => {
      window.removeEventListener('scroll', agendar)
      window.removeEventListener('resize', agendar)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5" aria-hidden="true">
      <div
        ref={barraRef}
        className="h-full origin-left bg-teal motion-reduce:transition-none"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
