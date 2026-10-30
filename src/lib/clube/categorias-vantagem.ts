// Categoria de cada negocio do Passaporte, para o filtro da /clube.
//
// A funcao gostoso_club_vantagens() nao devolve category_id (e nao precisa: mexer nela pede
// migracao). O anon le gostoso_businesses e gostoso_categories, entao uma leitura pelo
// cliente publico (cache de 5 min) traz a categoria dos negocios da lista.
import { clientePublico } from '@/lib/supabase/publico'
import type { CategoriaDaVantagem, Vantagem } from '@/lib/clube/vantagens'

export interface LinhaCategoria {
  id: string
  category: { id: string; name: string; slug: string; display_order: number } | null
}

/** Nome da categoria no idioma da pagina: chave `clube.categorias.<slug>`, ou o nome do banco. */
export function nomeDaCategoria(
  traducoes: Record<string, string>,
  c: { slug: string; name: string },
): string {
  return traducoes[c.slug] ?? c.name
}

export function juntarCategorias(
  vantagens: Vantagem[],
  linhas: readonly LinhaCategoria[],
  traducoes: Record<string, string>,
): Vantagem[] {
  const porNegocio = new Map<string, CategoriaDaVantagem>()
  for (const l of linhas) {
    if (!l.category) continue
    porNegocio.set(l.id, {
      id: l.category.id,
      slug: l.category.slug,
      nome: nomeDaCategoria(traducoes, l.category),
      ordem: l.category.display_order,
    })
  }
  return vantagens.map((v) => ({ ...v, categoria: porNegocio.get(v.businessId) ?? null }))
}

/** Falha em silencio: sem categoria o filtro some e a lista segue inteira. */
export async function comCategorias(vantagens: Vantagem[], traducoes: Record<string, string>): Promise<Vantagem[]> {
  const ids = vantagens.map((v) => v.businessId).filter(Boolean)
  if (ids.length === 0) return vantagens
  try {
    const { data, error } = await clientePublico()
      .from('gostoso_businesses')
      .select('id, category:gostoso_categories(id, name, slug, display_order)')
      .in('id', ids)
    if (error) return vantagens
    return juntarCategorias(vantagens, (data ?? []) as unknown as LinhaCategoria[], traducoes)
  } catch {
    return vantagens
  }
}
