'use client'

import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { dataLocal } from '@/lib/mares/tempo'

/* Seletor de dia. Os oito cartoes chegam prontos do servidor (children); aqui
   so se escolhe qual aparece. Com ISR de 1 h, a pagina pode ter sido gerada
   ontem a noite: o "hoje" do visitante (America/Fortaleza) e lido do relogio
   dele e, se estiver na lista, vira o dia selecionado por padrao. */

function assinar(aviso: () => void) {
  const id = setInterval(aviso, 60_000)
  return () => clearInterval(id)
}

type Dia = { data: string; nome: string; curta: string }

export function PainelDias({
  dias,
  hojeDoServidor,
  rotulo,
  children,
}: {
  dias: Dia[]
  hojeDoServidor: string
  rotulo: string
  children: ReactNode[]
}) {
  const hoje = useSyncExternalStore(assinar, () => dataLocal(new Date()), () => hojeDoServidor)
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const padrao = dias.some((d) => d.data === hoje) ? hoje : dias[0]?.data
  const ativo = escolhido ?? padrao
  const indice = Math.max(0, dias.findIndex((d) => d.data === ativo))

  return (
    <div>
      <div role="tablist" aria-label={rotulo} className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
        {dias.map((d, i) => {
          const selecionado = i === indice
          return (
            <button
              key={d.data}
              type="button"
              role="tab"
              id={`aba-${d.data}`}
              aria-selected={selecionado}
              aria-controls={`dia-${d.data}`}
              onClick={() => setEscolhido(d.data)}
              className={`shrink-0 min-w-[4.25rem] min-h-14 rounded-xl border px-3 py-2 text-center transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                selecionado
                  ? 'bg-teal border-teal text-white'
                  : 'bg-elev border-border-1 text-fg-1 hover:border-teal'
              }`}
            >
              <span className="block text-sm font-semibold leading-tight">{d.nome}</span>
              <span className={`block text-xs tabular-nums ${selecionado ? 'text-white/85' : 'text-fg-3'}`}>{d.curta}</span>
            </button>
          )
        })}
      </div>
      {children.map((cartao, i) => (
        <div
          key={dias[i]?.data ?? i}
          role="tabpanel"
          id={`dia-${dias[i]?.data}`}
          aria-labelledby={`aba-${dias[i]?.data}`}
          hidden={i !== indice}
          className="mt-4"
        >
          {cartao}
        </div>
      ))}
    </div>
  )
}
