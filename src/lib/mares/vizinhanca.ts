import { PRAIAS_MARES, distanciaKm, type PraiaMare } from '@/data/praias-mares'
import { PONTOS_MAPA, type PontoMapa } from '@/data/pontos-mapa'

/** Quantas praias vizinhas aparecem em cada pagina. */
export const MAX_VIZINHAS = 3
/** Raio, em km e em linha reta, para os pontos do mapa que nao sao praia. */
export const RAIO_PONTOS_KM = 10

export type Vizinha = { praia: PraiaMare; km?: number }
export type PontoPerto = { ponto: PontoMapa; km: number }

type ComCoordenada = PraiaMare & { lat: number; lon: number }
const temCoordenada = (p: PraiaMare): p is ComCoordenada => p.lat !== undefined && p.lon !== undefined

/** Praias da tabua mais perto de `praia`. Com coordenada, ordena pela distancia em
 *  linha reta e devolve os km. Sem coordenada (a posicao nao foi conferida em fonte
 *  aberta), nao ha distancia para mostrar: devolve as outras praias do mesmo
 *  municipio, na ordem da lista, sem km. Nunca inclui a propria praia. */
export function praiasVizinhas(praia: PraiaMare, max: number = MAX_VIZINHAS): Vizinha[] {
  const outras = PRAIAS_MARES.filter((p) => p.slug !== praia.slug)
  if (temCoordenada(praia)) {
    return outras
      .filter(temCoordenada)
      .map((p) => ({ praia: p as PraiaMare, km: distanciaKm(praia, p) as number }))
      .sort((a, b) => (a.km as number) - (b.km as number))
      .slice(0, max)
  }
  return outras.filter((p) => p.municipio === praia.municipio).slice(0, max).map((p) => ({ praia: p }))
}

/** Pontos do mapa que nao sao praia (hospedagem, historicos) dentro de `raioKm` da
 *  praia, do mais perto para o mais longe. Praia sem coordenada devolve vazio. */
export function pontosPerto(praia: PraiaMare, raioKm: number = RAIO_PONTOS_KM): PontoPerto[] {
  if (!temCoordenada(praia)) return []
  return PONTOS_MAPA.filter((p) => p.categoria !== 'praias')
    .map((ponto) => ({ ponto, km: distanciaKm(praia, ponto) as number }))
    .filter((x) => x.km <= raioKm)
    .sort((a, b) => a.km - b.km)
}

/** Link do Google Maps ate a praia, so para quem tem coordenada. */
export function linkMapaDaPraia(praia: PraiaMare): string | undefined {
  if (!temCoordenada(praia)) return undefined
  return `https://www.google.com/maps/search/?api=1&query=${praia.lat},${praia.lon}`
}
