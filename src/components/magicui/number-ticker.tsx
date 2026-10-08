'use client'
// src/components/magicui/number-ticker.tsx
// Adaptado do `number-ticker` do Magic UI sem `motion`. O HTML nasce com o
// valor final (leitor de tela, SEO e quem desligou o movimento veem o numero
// certo desde o primeiro quadro); so no navegador, e so quando o numero entra
// na tela com movimento permitido, ele conta de zero ate o valor.
import { useEffect, useRef, useState } from 'react'

interface NumberTickerProps {
  value: number
  /** Casas decimais mostradas. */
  decimais?: number
  /** Duracao da contagem, em ms. */
  duracao?: number
  className?: string
}

const formata = (n: number, decimais: number) => n.toFixed(decimais).replace('.', ',')

export function NumberTicker({ value, decimais = 1, duracao = 900, className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [animado, setAnimado] = useState<number | null>(null)
  const exibido = animado ?? value

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const io = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return
      io.disconnect()
      const inicio = performance.now()
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / duracao)
        const suave = 1 - Math.pow(1 - t, 4) // ease-out quart
        setAnimado(value * suave)
        if (t < 1) raf = requestAnimationFrame(passo)
        else setAnimado(null)
      }
      raf = requestAnimationFrame(passo)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duracao])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formata(exibido, decimais)}
    </span>
  )
}
