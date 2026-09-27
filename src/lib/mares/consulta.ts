import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { LinhaLida } from './semana'
import { inicioDoDia } from './tempo'

export type ClienteMares = Pick<SupabaseClient, 'from'>

/** Cliente anonimo sem cookies: a pagina das mares e publica e usa ISR, e o
 *  cliente de lib/supabase/server le cookies, o que tornaria a rota dinamica. */
export function clienteAnonimo(): ClienteMares | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, { auth: { persistSession: false } })
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
