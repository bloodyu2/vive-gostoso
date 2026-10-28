/**
 * Monta a lista do carrossel de banners da home: negocios em destaque, novos
 * e verificados, sem repetir nenhum.
 *
 * A ordem e fixa e deliberada: destaque primeiro (e quem o Vive Gostoso quer
 * ver na primeira tela), depois novos e verificados alternados para o carrossel
 * nao virar uma fila de um tipo so. Negocio sem foto fica de fora: banner sem
 * imagem e um retangulo vazio, e a lista de negocios ja cobre esse caso.
 */

export type MotivoCarrossel = 'destaque' | 'novo' | 'verificado'

export type NegocioDoCarrossel = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  category: { name: string } | null
  is_verified: boolean
}

export type ItemCarrossel = NegocioDoCarrossel & { motivo: MotivoCarrossel }

export type FontesCarrossel = {
  destaques: NegocioDoCarrossel[]
  novos: NegocioDoCarrossel[]
  verificados: NegocioDoCarrossel[]
}

export const MAXIMO_NO_CARROSSEL = 8

export function montarCarrossel(
  { destaques, novos, verificados }: FontesCarrossel,
  maximo: number = MAXIMO_NO_CARROSSEL,
): ItemCarrossel[] {
  const vistos = new Set<string>()
  const saida: ItemCarrossel[] = []

  const colocar = (negocio: NegocioDoCarrossel, motivo: MotivoCarrossel) => {
    if (saida.length >= maximo) return
    if (vistos.has(negocio.id)) return
    if (!negocio.cover_url) return
    vistos.add(negocio.id)
    saida.push({ ...negocio, motivo })
  }

  for (const n of destaques) colocar(n, 'destaque')

  const fim = Math.max(novos.length, verificados.length)
  for (let i = 0; i < fim; i++) {
    if (novos[i]) colocar(novos[i], 'novo')
    if (verificados[i]) colocar(verificados[i], 'verificado')
  }

  return saida
}

/** Proximo indice, voltando ao inicio depois do ultimo. */
export function proximoIndice(atual: number, total: number): number {
  if (total <= 0) return 0
  return (atual + 1) % total
}

/** Indice anterior, indo ao ultimo antes do primeiro. */
export function indiceAnterior(atual: number, total: number): number {
  if (total <= 0) return 0
  return (atual - 1 + total) % total
}
