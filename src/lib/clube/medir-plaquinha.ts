/** Medicao das paginas das plaquinhas (/p/NN).
 *
 *  Dois caminhos, de proposito:
 *  - GA4 (via gtag, o mesmo que o resto do site usa): so conta quem aceitou os cookies.
 *    Eventos `plaquinha_visita` e `plaquinha_clique`, sempre com `plaquinha_codigo`.
 *  - Banco (gostoso_plaquinha_cliques): conta TODO clique, sem dado pessoal e sem
 *    depender de aceite. E o numero que fecha com o que a plaquinha de fato rendeu.
 *
 *  Os eventos vao direto para a propriedade do Vive Gostoso (`send_to`). Evento so
 *  empurrado no dataLayer depende de gatilho e tag criados no GTM para cada nome,
 *  e esses dois nomes nao tem; sem `send_to` o GA4 nunca recebia nada.
 *
 *  Falha em silencio: o QR ja esta colado no balcao, a medicao nunca pode derrubar a pagina. */

export type AcaoPlaquinha =
  | 'avaliar'
  | 'instagram'
  | 'perfil'
  | 'passaporte'
  /** a setinha "Conhecer mais" abaixo dos botões */
  | 'conhecer_mais'
  /** o botão "Seguir @vivegostoso no Instagram" da seção de convite */
  | 'seguir_vive'

/** Todas as ações que o banco aceita (gostoso_plaquinha_cliques); mantém o código e a migração alinhados. */
export const ACOES_PLAQUINHA: readonly AcaoPlaquinha[] = ['avaliar', 'instagram', 'perfil', 'passaporte', 'conhecer_mais', 'seguir_vive']

/** Medicao do GA4 do Vive Gostoso (propriedade 535132611), a mesma que o conteiner GTM-KDGMDLHG carrega. */
export const GA4_VIVE_GOSTOSO = 'G-Z915DS14EM'

type Gtag = (...args: unknown[]) => void

/** Evento ao GA4. Sem gtag na pagina (bloqueador, script que nao carregou) nao faz nada. */
export function eventoPlaquinha(nome: string, parametros: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const gtag = (window as typeof window & { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', nome, { ...parametros, send_to: GA4_VIVE_GOSTOSO })
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
