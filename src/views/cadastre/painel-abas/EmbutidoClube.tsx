'use client'

import type { ReactNode } from 'react'
import '@/styles/clube.css'
import '@/styles/painel-abas.css'

/** Moldura das abas que reaproveitam as telas do Passaporte (classes clube-*). A paleta e as
 *  fontes vem do site (ver painel-abas.css), nao do tema de areia do passaporte. */
export function EmbutidoClube({ children }: { children: ReactNode }) {
  return <div className="clube painel-clube">{children}</div>
}
