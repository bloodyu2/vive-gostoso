/**
 * Empurra um evento customizado para o dataLayer do GTM.
 *
 * Os nomes de evento viram gatilho de "Evento personalizado" no GTM/GA4, entao
 * precisam bater exatamente com o que esta configurado la.
 */
export function pushDataLayer(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const w = window as typeof window & { dataLayer?: Record<string, unknown>[] }
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push({ event, ...params })
}
