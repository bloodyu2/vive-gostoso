import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { fetchComCache } from '@/lib/mares/consulta'

export type ClienteContagens = Pick<SupabaseClient, 'from'>

export type VerboContado = 'come' | 'fique' | 'passeie'
export type Contagens = Partial<Record<VerboContado | 'participe', number | null>>

/** Negocios ativos e publicados das categorias de um verbo. Qualquer erro vira
 *  null: a vitrine usa entao a frase sem numero. */
export async function contarPorVerbo(cliente: ClienteContagens | null, verbo: VerboContado): Promise<number | null> {
  if (!cliente) return null
  try {
    const { data: cats, error: erroCat } = await cliente.from('gostoso_categories').select('id').eq('verb', verbo)
    if (erroCat) return null
    const ids = ((cats ?? []) as { id: string }[]).map((c) => c.id)
    if (!ids.length) return 0
    const { count, error } = await cliente
      .from('gostoso_businesses')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .eq('is_published', true)
      .in('category_id', ids)
    if (error || typeof count !== 'number') return null
    return count
  } catch {
    return null
  }
}

/** Eventos ativos que ainda nao terminaram (mesmo criterio da agenda da home). */
export async function contarEventosFuturos(cliente: ClienteContagens | null, agora: Date): Promise<number | null> {
  if (!cliente) return null
  try {
    const { count, error } = await cliente
      .from('gostoso_events')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .gte('ends_at', agora.toISOString())
    if (error || typeof count !== 'number') return null
    return count
  } catch {
    return null
  }
}

export async function lerContagens(cliente: ClienteContagens | null, agora: Date): Promise<Contagens> {
  const [come, fique, passeie, participe] = await Promise.all([
    contarPorVerbo(cliente, 'come'),
    contarPorVerbo(cliente, 'fique'),
    contarPorVerbo(cliente, 'passeie'),
    contarEventosFuturos(cliente, agora),
  ])
  return { come, fique, passeie, participe }
}

/** Cliente anonimo sem cookies, resposta guardada por 1 h (tag gostoso_businesses). */
function clienteContagens(): ClienteContagens | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, {
    auth: { persistSession: false },
    global: { fetch: fetchComCache(fetch, 'gostoso_businesses') },
  })
}

export function contagensDaVitrine(): Promise<Contagens> {
  return lerContagens(clienteContagens(), new Date())
}
