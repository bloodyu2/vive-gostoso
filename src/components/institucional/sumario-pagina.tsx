'use client'
// Sumario da pagina: chips que quebram linha no celular e coluna fixa (sticky)
// no desktop. Marca a secao visivel com aria-current, sem animacao.
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ItemSumario = { id: string; rotulo: string }

export function SumarioPagina({ itens, titulo, className }: { itens: ItemSumario[]; titulo: string; className?: string }) {
  const [ativo, setAtivo] = useState<string | null>(null)

  useEffect(() => {
    const els = itens.map(i => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      entradas => {
        const visivel = entradas.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visivel) setAtivo(visivel.target.id)
      },
      { rootMargin: '-96px 0px -60% 0px' },
    )
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [itens])

  return (
    <nav aria-label={titulo} className={cn('lg:sticky lg:top-24 lg:self-start', className)}>
      <p className="hidden lg:block text-sm font-semibold text-fg-1 mb-3 px-3">{titulo}</p>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
        {itens.map(i => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={ativo === i.id ? 'location' : undefined}
              className={cn(
                'inline-flex items-center min-h-11 px-4 lg:px-3 rounded-full lg:rounded-lg border lg:border-transparent text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
                ativo === i.id
                  ? 'border-teal/40 bg-teal/10 text-teal-dark dark:text-teal font-semibold'
                  : 'border-border-1 text-fg-3-texto hover:text-fg-1 hover:bg-card',
              )}
            >
              {i.rotulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
