'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'

/** Troca parametros da URL do painel (?aba=, ?bizId=, ?vista=) sem recarregar nem pedir a
 *  pagina de novo ao servidor: o Next acompanha o history.replaceState e o useSearchParams
 *  ja devolve o valor novo. Replace, e nao push, para trocar de aba nao encher o historico.
 *  `montar` recebe os parametros de agora e devolve os novos. O #hash sai da URL junto. */
export function useTrocarUrlDoPainel() {
  const pathname = usePathname()
  return useCallback(
    (montar: (atual: URLSearchParams) => URLSearchParams) => {
      const qs = montar(new URLSearchParams(window.location.search)).toString()
      window.history.replaceState(null, '', `${pathname}${qs ? `?${qs}` : ''}`)
    },
    [pathname],
  )
}
