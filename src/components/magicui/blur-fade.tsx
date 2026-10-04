'use client'
// src/components/magicui/blur-fade.tsx
// Adaptado do `blur-fade` do Magic UI sem `motion`: um IntersectionObserver
// revela a secao uma unica vez (desfoque leve -> nitido). O conteudo nasce
// visivel (nunca escondido no HTML); so e escondido, em runtime, quando comeca
// abaixo da dobra e o movimento esta permitido.
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface BlurFadeProps {
  children: React.ReactNode
  /** Atraso da entrada, em ms. */
  delay?: number
  className?: string
}

export function BlurFade({ children, delay = 0, className }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [escondido, setEscondido] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top <= window.innerHeight) return
    setEscondido(true)
    const io = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setEscondido(false)
        io.disconnect()
      }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,filter,transform] duration-700 ease-out motion-reduce:transition-none',
        escondido ? 'opacity-0 blur-[2px] translate-y-2' : 'opacity-100 blur-none translate-y-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
