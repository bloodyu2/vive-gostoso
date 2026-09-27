'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  listaId: string
  total: number
  anterior: string
  proximo: string
  /** Modelo com {i} e {n}, ex.: "Ir para o cartao {i} de {n}". */
  pagina: string
}

function semMovimento(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Setas e bolinhas do carrossel da vitrine no celular. Ouve a rolagem da
 *  lista e marca a bolinha do cartao encostado na borda esquerda. Sem JS a lista continua rolavel; do sm para cima vira grade e os
 *  controles somem. */
export function VitrineControles({ listaId, total, anterior, proximo, pagina }: Props) {
  const [ativo, setAtivo] = useState(0)

  useEffect(() => {
    const lista = document.getElementById(listaId)
    if (!lista) return
    const el = lista
    function medir() {
      const itens = Array.from(el.children) as HTMLElement[]
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) return setAtivo(itens.length - 1)
      if (!itens.length) return
      // offsetLeft nao muda com a rolagem: o cartao ativo e o que esta a scrollLeft do primeiro.
      const base = el.scrollLeft + itens[0].offsetLeft
      let melhor = 0
      itens.forEach((item, i) => {
        if (Math.abs(item.offsetLeft - base) < Math.abs(itens[melhor].offsetLeft - base)) melhor = i
      })
      setAtivo(melhor)
    }
    el.addEventListener('scroll', medir, { passive: true })
    medir()
    return () => el.removeEventListener('scroll', medir)
  }, [listaId])

  function irPara(i: number) {
    const lista = document.getElementById(listaId)
    const alvo = lista?.children[Math.max(0, Math.min(total - 1, i))] as HTMLElement | undefined
    if (!lista || !alvo) return
    const primeiro = lista.children[0] as HTMLElement
    lista.scrollTo({ left: alvo.offsetLeft - primeiro.offsetLeft, behavior: semMovimento() ? 'auto' : 'smooth' })
  }

  const seta =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-1 bg-elev text-fg-1 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'

  return (
    <div className="mt-2 flex items-center justify-between gap-3 px-5 sm:hidden">
      <button type="button" className={seta} aria-label={anterior} aria-controls={listaId} disabled={ativo === 0} onClick={() => irPara(ativo - 1)}>
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </button>
      {/* Bolinhas so indicam a posicao (onze alvos de 44 px nao cabem ao lado
          das setas em 360 px); a navegacao por toque e teclado fica nas setas
          e no proprio arraste da lista. */}
      <p className="sr-only" aria-live="polite">
        {pagina.replace('{i}', String(ativo + 1)).replace('{n}', String(total))}
      </p>
      <div aria-hidden="true" className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`block h-2 rounded-full transition-all duration-300 ease-out motion-reduce:transition-none ${i === ativo ? 'w-5 bg-teal' : 'w-2 bg-fg-3/40'}`}
          />
        ))}
      </div>
      <button type="button" className={seta} aria-label={proximo} aria-controls={listaId} disabled={ativo >= total - 1} onClick={() => irPara(ativo + 1)}>
        <ChevronRight aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  )
}
