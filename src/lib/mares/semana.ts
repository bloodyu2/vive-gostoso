import type { PraiaMare } from '@/data/praias-mares'
import type { TipoMare } from './extrair-tabua'
import { curvaDoDia, type PontoCurva } from './curva'
import { faseDaLua, type FaseDaLua } from './lua'
import { melhorJanela } from './melhor-janela'
import { dataLocal, diasAPartirDe, formatarHora, minutosLocais } from './tempo'

export type LinhaLida = { data_hora: string; altura_m: number | string; tipo: TipoMare }
export type EventoLido = { instante: Date; altura_m: number; tipo: TipoMare; data: string }

export type MareDoDia = { hora: string; altura: number; tipo: TipoMare; iso: string }

export type DiaDeMare = {
  data: string
  temDados: boolean
  eventos: MareDoDia[]
  curva: PontoCurva[]
  lua: FaseDaLua
  janela: { inicio: string; fim: string; inicioMin: number; fimMin: number } | null
  /** true quando a estacao principal nao tinha dado neste dia e a tela usa a reserva. */
  usaReserva: boolean
}

export const DIAS_NA_TELA = 8 // hoje e os proximos 7

export function linhasParaEventos(linhas: LinhaLida[]): EventoLido[] {
  return linhas
    .map((l) => {
      const instante = new Date(l.data_hora)
      return { instante, altura_m: Number(l.altura_m), tipo: l.tipo, data: dataLocal(instante) }
    })
    .sort((a, b) => a.instante.getTime() - b.instante.getTime())
}

/** Junta as mares de duas estacoes, dia a dia (dia local): o dia que a
 *  principal tem fica com ela; o dia que so a reserva tem fica com a reserva e
 *  entra em diasDaReserva, para a tela avisar. Nunca mistura as duas no mesmo dia. */
export function combinarEstacoes(
  principal: EventoLido[],
  reserva: EventoLido[],
): { eventos: EventoLido[]; diasDaReserva: Set<string> } {
  const diasDaPrincipal = new Set(principal.map((e) => e.data))
  const daReserva = reserva.filter((e) => !diasDaPrincipal.has(e.data))
  return {
    eventos: [...principal, ...daReserva].sort((a, b) => a.instante.getTime() - b.instante.getTime()),
    diasDaReserva: new Set(daReserva.map((e) => e.data)),
  }
}

export function montarSemana(
  eventos: EventoLido[],
  hoje: string,
  praia?: PraiaMare,
  diasDaReserva: ReadonlySet<string> = new Set(),
): DiaDeMare[] {
  return diasAPartirDe(hoje, DIAS_NA_TELA).map((data) => {
    const doDia = eventos.filter((e) => e.data === data)
    const temDados = doDia.length > 0
    const janela = temDados && praia?.melhorMare ? melhorJanela(eventos, data, praia.melhorMare) : null
    return {
      data,
      temDados,
      eventos: doDia.map((e) => ({
        hora: formatarHora(e.instante),
        altura: e.altura_m,
        tipo: e.tipo,
        iso: e.instante.toISOString(),
      })),
      curva: temDados ? curvaDoDia(eventos, data, 15) : [],
      lua: faseDaLua(data),
      janela: janela
        ? {
            inicio: formatarHora(janela.inicio),
            fim: formatarHora(janela.fim),
            inicioMin: minutosLocais(janela.inicio),
            fimMin: minutosLocais(janela.fim),
          }
        : null,
      usaReserva: temDados && diasDaReserva.has(data),
    }
  })
}

/** Dias, a partir de hoje, sem nenhuma mare gravada. Alimenta o aviso do admin. */
export function diasSemDado(eventos: EventoLido[], hoje: string, janelaDias: number): string[] {
  const comDado = new Set(eventos.map((e) => e.data))
  return diasAPartirDe(hoje, janelaDias).filter((d) => !comDado.has(d))
}
