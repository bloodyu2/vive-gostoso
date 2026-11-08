'use client'

import { useEffect } from 'react'
import { aplicarEscolhaSalva, type JanelaDeMedicao } from '@/lib/consentimento'

/** Reaplica a escolha de cookies que a pessoa ja gravou, sem mostrar aviso nenhum.
 *
 *  Nas rotas "sem cromo" (/bio, /clube) o banner nao aparece, e era ele quem reaplicava
 *  o aceite a cada carregamento. Sem isso, quem ja tinha aceitado no site continuava
 *  "negado" aqui e nao era medido. Quem nunca respondeu segue negado. */
export function ConsentimentoSalvo() {
  useEffect(() => {
    aplicarEscolhaSalva(window as unknown as JanelaDeMedicao)
  }, [])
  return null
}
