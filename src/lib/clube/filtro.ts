// Filtro de categoria da /clube. Roda no cliente, sem recarregar: so decide quais
// cartoes ficam visiveis, sem mexer na ordem que o servidor mandou.
import type { CategoriaDaVantagem, Vantagem } from '@/lib/clube/vantagens'

export interface ChipCategoria {
  id: string
  rotulo: string
  /** cartoes visiveis quando este chip esta ativo */
  n: number
}

type ComCategoria = Pick<Vantagem, 'status' | 'categoria'>

/** Chips do filtro: so categorias com pelo menos um parceiro NO AR, na ordem do guia
 *  (display_order, depois o nome). O numero e o de cartoes que ficam na tela com o chip ativo. */
export function chipsDeCategorias(vantagens: readonly ComCategoria[]): ChipCategoria[] {
  const noAr = new Map<string, CategoriaDaVantagem>()
  for (const v of vantagens) {
    if (v.status === 'no_ar' && v.categoria) noAr.set(v.categoria.id, v.categoria)
  }
  return [...noAr.values()]
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
    .map((c) => ({
      id: c.id,
      rotulo: c.nome,
      n: vantagens.filter((v) => v.categoria?.id === c.id).length,
    }))
}

/** `null` = Todos. Mantem a ordem original. Categoria desconhecida devolve lista vazia. */
export function filtrarPorCategoria<T extends Pick<Vantagem, 'categoria'>>(
  vantagens: readonly T[],
  categoriaId: string | null,
): T[] {
  if (categoriaId === null) return [...vantagens]
  return vantagens.filter((v) => v.categoria?.id === categoriaId)
}
