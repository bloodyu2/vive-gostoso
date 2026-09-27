import type { PraiaMare } from '@/data/praias-mares'
import type { TipoMare } from './extrair-tabua'
import { curvaDoDia, type PontoCurva } from './curva'
import { faseDaLua, type FaseDaLua } from './lua'
import { melhorJanela } from './melhor-janela'
import { dataLocal, diasAPartirDe, formatarHora } from './tempo'

export type LinhaLida = { data_hora: string; altura_m: number | string; tipo: TipoMare }
export type EventoLido = { instante: Date; altura_m: number; tipo: TipoMare; data: string }

export type MareDoDia = { hora: string; altura: number; tipo: TipoMare; iso: string }

export type DiaDeMare = {
  data: string
  temDados: boolean
  eventos: MareDoDia[]
  curva: PontoCurva[]
  lua: FaseDaLua
  janela: { inicio: string; fim: string } | null
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

export function montarSemana(eventos: EventoLido[], hoje: string, praia: PraiaMare): DiaDeMare[] {
  return diasAPartirDe(hoje, DIAS_NA_TELA).map((data) => {
    const doDia = eventos.filter((e) => e.data === data)
    const temDados = doDia.length > 0
    const janela = temDados && praia.melhorMare ? melhorJanela(eventos, data, praia.melhorMare) : null
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
      janela: janela ? { inicio: formatarHora(janela.inicio), fim: formatarHora(janela.fim) } : null,
    }
  })
}

/** Dias, a partir de hoje, sem nenhuma mare gravada. Alimenta o aviso do admin. */
export function diasSemDado(eventos: EventoLido[], hoje: string, janelaDias: number): string[] {
  const comDado = new Set(eventos.map((e) => e.data))
  return diasAPartirDe(hoje, janelaDias).filter((d) => !comDado.has(d))
}
