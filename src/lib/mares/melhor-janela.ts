import type { TipoMare } from './extrair-tabua'
import type { Extremo } from './curva'
import { inicioDoDia } from './tempo'

export type Janela = { inicio: Date; fim: Date; extremo: Extremo }

/* Luz do dia usada para recomendar horario. Em Gostoso (5 graus sul) o sol
   nasce entre 5h15 e 5h45 e se poe entre 17h30 e 18h o ano todo; 6h-18h e a
   faixa em que da para aproveitar a praia com seguranca. */
export const INICIO_LUZ_MIN = 6 * 60
export const FIM_LUZ_MIN = 18 * 60

/* Faixa "perto do extremo": ate 15% da variacao entre o extremo e o extremo
   vizinho. Na mare semidiurna isso da cerca de 1h30 para cada lado. */
export const FRACAO_PADRAO = 0.15

/** Melhor janela do dia para uma praia que depende da mare baixa ou da alta.
 *  Entre os extremos do tipo pedido, escolhe o que tem mais minutos de luz do
 *  dia dentro da faixa, e devolve a faixa ja cortada em 6h-18h. */
export function melhorJanela(
  eventos: Array<Extremo & { tipo: TipoMare }>,
  data: string,
  tipo: TipoMare,
  fracao = FRACAO_PADRAO,
): Janela | null {
  const inicioDia = inicioDoDia(data).getTime()
  const luzIni = inicioDia + INICIO_LUZ_MIN * 60_000
  const luzFim = inicioDia + FIM_LUZ_MIN * 60_000
  let melhor: Janela | null = null
  let melhorDuracao = 0

  eventos.forEach((e, i) => {
    if (e.tipo !== tipo) return
    const antes = eventos[i - 1]
    const depois = eventos[i + 1]
    if (!antes || !depois) return
    const t = e.instante.getTime()
    const ini = t - meiaLargura(e, antes, fracao)
    const fim = t + meiaLargura(e, depois, fracao)
    const cortadoIni = Math.max(ini, luzIni)
    const cortadoFim = Math.min(fim, luzFim)
    const duracao = cortadoFim - cortadoIni
    if (duracao > 20 * 60_000 && duracao > melhorDuracao) {
      melhorDuracao = duracao
      melhor = { inicio: new Date(cortadoIni), fim: new Date(cortadoFim), extremo: e }
    }
  })
  return melhor
}

/** Distancia, em ms, entre o extremo e o ponto em que a curva cosseno sai da
 *  faixa. Com h normalizado = (1 - cos(pi*d/T))/2, h <= f quando
 *  d <= T*acos(1-2f)/pi. */
function meiaLargura(extremo: Extremo, vizinho: Extremo, fracao: number): number {
  const T = Math.abs(extremo.instante.getTime() - vizinho.instante.getTime())
  return (T * Math.acos(1 - 2 * fracao)) / Math.PI
}
