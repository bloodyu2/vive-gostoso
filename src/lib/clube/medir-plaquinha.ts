/** Medicao das paginas das plaquinhas (/p/NN).
 *
 *  Dois caminhos, de proposito:
 *  - GA4 (via gtag, o mesmo que o resto do site usa): so conta quem aceitou os cookies.
 *    Eventos `plaquinha_visita` e `plaquinha_clique`, sempre com `plaquinha_codigo`.
 *  - Banco (gostoso_plaquinha_cliques): conta TODO clique, sem dado pessoal e sem
 *    depender de aceite. E o numero que fecha com o que a plaquinha de fato rendeu.
 *
 *  Falha em silencio: o QR ja esta colado no balcao, a medicao nunca pode derrubar a pagina. */

export type AcaoPlaquinha = 'avaliar' | 'instagram' | 'perfil' | 'passaporte'

type Gtag = (...args: unknown[]) => void

/** Evento ao GA4. Sem gtag na pagina (bloqueador, script que nao carregou) nao faz nada. */
export function eventoPlaquinha(nome: string, parametros: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const gtag = (window as typeof window & { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', nome, parametros)
  } catch {
    // Medicao nao pode quebrar a pagina.
  }
}

export function parametrosDoClique(codigo: string, acao: AcaoPlaquinha, negocio: string): Record<string, unknown> {
  return {
    plaquinha_codigo: codigo,
    plaquinha_acao: acao,
    plaquinha_negocio: negocio,
    origem: 'plaquinha',
  }
}
