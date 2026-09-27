import { inicioDoDia } from './tempo'

export type Extremo = { instante: Date; altura_m: number }
export type PontoCurva = { minuto: number; altura: number | null }

/** Altura interpolada por cosseno entre o extremo anterior e o seguinte.
 *  E a aproximacao classica (regra do cosseno) para mare semidiurna: passa
 *  pelos extremos com derivada zero e e monotona entre eles. Fora do intervalo
 *  coberto pelos dados devolve null, para a tela nao inventar curva. */
export function alturaEm(eventos: Extremo[], t: Date): number | null {
  const ms = t.getTime()
  for (let i = 0; i < eventos.length - 1; i++) {
    const a = eventos[i]
    const b = eventos[i + 1]
    const ta = a.instante.getTime()
    const tb = b.instante.getTime()
    if (ms >= ta && ms <= tb) {
      const f = tb === ta ? 0 : (ms - ta) / (tb - ta)
      return a.altura_m + (b.altura_m - a.altura_m) * (1 - Math.cos(Math.PI * f)) / 2
    }
  }
  return null
}

/** Pontos da curva de um dia local, de 00h a 24h. */
export function curvaDoDia(eventos: Extremo[], data: string, passoMin = 15): PontoCurva[] {
  const inicio = inicioDoDia(data).getTime()
  const pontos: PontoCurva[] = []
  for (let minuto = 0; minuto <= 1440; minuto += passoMin) {
    pontos.push({ minuto, altura: alturaEm(eventos, new Date(inicio + minuto * 60_000)) })
  }
  return pontos
}
