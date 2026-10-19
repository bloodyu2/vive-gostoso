/** Distancias para o "Onde estou" do mapa. Tudo roda no navegador: a posicao
 *  da pessoa nunca sai do aparelho. */

export type Coord = { lat: number; lng: number }

/** Centro da vila, para saber se a pessoa esta em Gostoso ou longe. */
export const CENTRO_DA_VILA: Coord = { lat: -5.1235, lng: -35.634 }

/** Acima disso a pessoa nao esta "em Gostoso": o mapa nao da zoom nela. */
export const LONGE_DA_VILA_M = 30_000

const RAIO_TERRA_M = 6_371_000

/** Distancia em linha reta (haversine), em metros. */
export function distanciaMetros(a: Coord, b: Coord): number {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** "350 m", "1,2 km", "18 km". Arredonda para nao fingir precisao de GPS. */
export function formatarDistancia(metros: number, lang: string = 'pt'): string {
  if (metros < 1000) {
    const passo = metros < 100 ? 10 : 50
    const arredondado = Math.max(passo, Math.round(metros / passo) * passo)
    return arredondado >= 1000 ? formatarDistancia(arredondado, lang) : `${arredondado} m`
  }
  const km = metros / 1000
  const nf = new Intl.NumberFormat(lang, { maximumFractionDigits: km < 10 ? 1 : 0 })
  return `${nf.format(km)} km`
}

export type ComDistancia<T> = { item: T; metros: number }

/** Ordena do mais perto para o mais longe, ignorando quem nao tem coordenada. */
export function ordenarPorDistancia<T>(
  origem: Coord,
  itens: T[],
  coordenada: (item: T) => Coord | null,
): ComDistancia<T>[] {
  const saida: ComDistancia<T>[] = []
  for (const item of itens) {
    const c = coordenada(item)
    if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) continue
    saida.push({ item, metros: distanciaMetros(origem, c) })
  }
  return saida.sort((x, y) => x.metros - y.metros)
}
