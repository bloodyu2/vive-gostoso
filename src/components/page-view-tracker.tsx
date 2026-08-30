'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Envia page_view ao GA4 nas navegacoes client-side do App Router.
 *
 * O gtag('config') do carregamento inicial ja manda o primeiro page_view, mas
 * trocar de rota no Next nao recarrega a pagina e nao dispara outro sozinho.
 * Sem isto, so a primeira pagina da visita seria medida.
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const primeiraRota = useRef(true)

  useEffect(() => {
    if (primeiraRota.current) {
      primeiraRota.current = false
      return
    }
    const w = window as typeof window & { gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return null
}
