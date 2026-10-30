'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/** Ids dos negocios com vantagem do Passaporte no ar. O servidor (layout) manda a lista
 *  uma vez; cartao, pagina do negocio e carrossel perguntam aqui, sem consulta propria.
 *  Lista vazia com a flag de lancamento desligada. */
const SEM_CLUBE: ReadonlySet<string> = new Set()
const ContextoClube = createContext<ReadonlySet<string>>(SEM_CLUBE)

export function ClubeProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const conjunto = useMemo<ReadonlySet<string>>(() => new Set(ids), [ids])
  return <ContextoClube.Provider value={conjunto}>{children}</ContextoClube.Provider>
}

export function useNoClube(id: string | null | undefined): boolean {
  const ids = useContext(ContextoClube)
  return !!id && ids.has(id)
}
