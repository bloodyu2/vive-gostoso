'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  /** id da lista rolavel (o `ul` com scroll-snap) que as setas comandam. */
  listaId: string
  anterior: string
  proximo: string
}

function semMovimento(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Quanto rolar por clique: a distancia entre o primeiro e o segundo cartao
 *  (largura + espaco), ou seja, exatamente um cartao. */
export function passoDaLista(lista: HTMLElement): number {
  const itens = lista.children
  if (itens.length >= 2) {
    const a = itens[0] as HTMLElement
    const b = itens[1] as HTMLElement
    const passo = b.offsetLeft - a.offsetLeft
    if (passo > 0) return passo
  }
  return Math.max(1, lista.clientWidth * 0.8)
}

const SETA =
  'inline-flex size-11 items-center justify-center rounded-full border border-border-1 bg-card text-fg-1 transition-colors hover:border-teal hover:text-teal disabled:cursor-default disabled:opacity-40 disabled:hover:border-border-1 disabled:hover:text-fg-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal motion-reduce:transition-none'

/**
 * Setas anterior/proximo para uma faixa que rola na horizontal. No celular a
 * pessoa arrasta o dedo; no desktop nao ha o que arrastar, entao as setas
 * existem de sm para cima. So aparecem quando a lista de fato transborda (com
 * poucos cartoes numa tela larga nao ha o que rolar) e cada uma desabilita na
 * ponta da lista. Sao botoes de verdade: Tab, Enter e Espaco funcionam, e a
 * rolagem respeita prefers-reduced-motion.
 */
export function SetasDaFaixa({ listaId, anterior, proximo }: Props) {
  const [rola, setRola] = useState(false)
  const [noInicio, setNoInicio] = useState(true)
  const [noFim, setNoFim] = useState(true)

  const medir = useCallback(() => {
    const lista = document.getElementById(listaId)
    if (!lista) return
    setRola(lista.scrollWidth - lista.clientWidth > 4)
    setNoInicio(lista.scrollLeft <= 2)
    setNoFim(lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 2)
  }, [listaId])

  useEffect(() => {
    const lista = document.getElementById(listaId)
    if (!lista) return
    lista.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null
    ro?.observe(lista)
    // Medida inicial adiada para um microtask: setState sincrono dentro do efeito dispara render em cascata.
    queueMicrotask(medir)
    return () => {
      lista.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
      ro?.disconnect()
    }
  }, [listaId, medir])

  function ir(sentido: -1 | 1) {
    const lista = document.getElementById(listaId)
    if (!lista) return
    lista.scrollBy({ left: sentido * passoDaLista(lista), behavior: semMovimento() ? 'auto' : 'smooth' })
  }

  if (!rola) return null

  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      <button type="button" className={SETA} aria-label={anterior} aria-controls={listaId} disabled={noInicio} onClick={() => ir(-1)}>
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <button type="button" className={SETA} aria-label={proximo} aria-controls={listaId} disabled={noFim} onClick={() => ir(1)}>
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </div>
  )
}
