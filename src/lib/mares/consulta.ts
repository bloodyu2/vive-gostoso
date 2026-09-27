import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { LinhaLida } from './semana'
import { inicioDoDia } from './tempo'

export type ClienteMares = Pick<SupabaseClient, 'from'>

export const SEGUNDOS_DE_CACHE = 3600

/** O HTML do site inteiro e dinamico (o nonce de CSP do proxy.ts e gerado por
 *  requisicao), entao `revalidate` na pagina nao segura nada. O que se guarda
 *  por 1 h e a resposta do Supabase, no cache de dados do Next: a pagina
 *  continua calculando "hoje" e "agora" a cada visita, mas o banco e lido no
 *  maximo uma vez por hora por consulta. */
export function fetchComCache(base: typeof fetch = fetch): typeof fetch {
  return ((entrada: RequestInfo | URL, init?: RequestInit) =>
    base(entrada, { ...init, next: { revalidate: SEGUNDOS_DE_CACHE, tags: ['gostoso_mares'] } } as RequestInit)) as typeof fetch
}

/** Cliente anonimo sem cookies: a tabua e publica. */
export function clienteAnonimo(): ClienteMares | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, { auth: { persistSession: false }, global: { fetch: fetchComCache() } })
}

/** Mares de uma estacao entre duas datas locais (fim exclusivo). Qualquer erro,
 *  inclusive a tabela ainda nao existir em producao, vira lista vazia: a
 *  pagina mostra o estado vazio em vez de quebrar. */
export async function buscarLinhas(
  cliente: ClienteMares | null,
  estacao: string,
  deData: string,
  ateData: string,
): Promise<{ linhas: LinhaLida[]; erro: boolean }> {
  if (!cliente) return { linhas: [], erro: true }
  try {
    const { data, error } = await cliente
      .from('gostoso_mares')
      .select('data_hora, altura_m, tipo')
      .eq('estacao', estacao)
      .gte('data_hora', inicioDoDia(deData).toISOString())
      .lt('data_hora', inicioDoDia(ateData).toISOString())
      .order('data_hora', { ascending: true })
    if (error) {
      console.error('[mares] leitura falhou:', error.message)
      return { linhas: [], erro: true }
    }
    return { linhas: (data ?? []) as LinhaLida[], erro: false }
  } catch (e) {
    console.error('[mares] leitura falhou:', e instanceof Error ? e.message : e)
    return { linhas: [], erro: true }
  }
}
