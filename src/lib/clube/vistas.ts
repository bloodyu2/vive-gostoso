/** Vistas por parceiro na lista do /clube (KAN-998).
 *
 *  Regra: uma vista e um cartao que a pessoa viu de verdade, um parceiro de cada vez.
 *  O banco (`gostoso_club_registrar_vistas`) soma 1 a cada id que recebe, entao a conta
 *  certa depende de quem chama mandar so os ids vistos. Ate 26/11/2026 a pagina mandava
 *  todos os parceiros a cada visita e todos ficavam com o mesmo n (as visitas a lista).
 *
 *  Este modulo e logica pura, sem navegador: o hook `usar-vistas-por-cartao` liga isto ao
 *  IntersectionObserver e ao supabase. */

/** A funcao do banco corta em 30 ids (`p_partner_ids[1:30]`). */
export const MAX_IDS_POR_CHAMADA = 30

/** O cartao precisa ficar assim na tela para contar, para nao contar quem so rolou por cima. */
export const VISTA_PERMANENCIA_MS = 1000

/** Espera para juntar varios cartoes vistos numa chamada so. */
export const VISTA_LOTE_MS = 1500

/** Metade do cartao (ou da tela, no cartao mais alto que ela) precisa estar visivel. */
const RAZAO_MINIMA = 0.5

export interface ArmazemDeVistas {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
}

export function chaveDaVista(dia: string, partnerId: string): string {
  return `vg-clube-vista-${dia}-${partnerId}`
}

export interface MedidaDoCartao {
  /** fracao do cartao que aparece (IntersectionObserver.intersectionRatio) */
  ratio: number
  /** altura do cartao que aparece, em px */
  alturaVisivel: number
  /** altura da tela, em px; 0 quando nao se sabe */
  alturaDaTela: number
}

/** O cartao conta como visto com metade dele na tela. Cartao mais alto que a tela nunca
 *  chega a metade de si mesmo; nele vale ocupar metade da tela. */
export function cartaoVisivel({ ratio, alturaVisivel, alturaDaTela }: MedidaDoCartao): boolean {
  if (ratio >= RAZAO_MINIMA) return true
  return alturaDaTela > 0 && alturaVisivel >= alturaDaTela * RAZAO_MINIMA
}

export interface OpcoesDoRegistrador {
  /** Dia no fuso de Gostoso (AAAA-MM-DD), lido a cada vista. */
  dia: () => string
  /** sessionStorage da aba, ou null quando o navegador nao deixa. */
  armazem: ArmazemDeVistas | null
  /** Lembrete em memoria, para nao contar duas vezes quando o armazem falha. */
  memoria: Set<string>
  /** Manda os ids ao banco (ja em lotes de no maximo 30). */
  enviar: (ids: string[]) => void
  agendar: (fn: () => void, ms: number) => unknown
  cancelar: (agendamento: unknown) => void
  loteMs?: number
}

export interface RegistradorDeVistas {
  /** Registra que o parceiro foi visto. false quando ja contou hoje neste aparelho. */
  vi(partnerId: string): boolean
  /** Manda agora o que esta pendente (a pagina vai sumir). */
  esvaziar(): void
}

export function criarRegistradorDeVistas(o: OpcoesDoRegistrador): RegistradorDeVistas {
  let pendentes: string[] = []
  let agendado: unknown = null

  function despachar() {
    agendado = null
    const lote = pendentes
    pendentes = []
    for (let i = 0; i < lote.length; i += MAX_IDS_POR_CHAMADA) {
      o.enviar(lote.slice(i, i + MAX_IDS_POR_CHAMADA))
    }
  }

  function jaContou(chave: string): boolean {
    if (o.memoria.has(chave)) return true
    try {
      return o.armazem?.getItem(chave) != null
    } catch {
      return false
    }
  }

  function lembrar(chave: string) {
    o.memoria.add(chave)
    try {
      o.armazem?.setItem(chave, '1')
    } catch {
      /* sem armazenamento: a memoria da pagina basta */
    }
  }

  return {
    vi(partnerId) {
      if (!partnerId) return false
      const chave = chaveDaVista(o.dia(), partnerId)
      if (jaContou(chave)) return false
      lembrar(chave)
      pendentes.push(partnerId)
      if (agendado === null) agendado = o.agendar(despachar, o.loteMs ?? VISTA_LOTE_MS)
      return true
    },
    esvaziar() {
      if (agendado !== null) o.cancelar(agendado)
      if (pendentes.length > 0) despachar()
      agendado = null
    },
  }
}
