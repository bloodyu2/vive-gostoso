// Leitura das vantagens no servidor (paginas /clube e /p/NN).
import { createClient } from '@supabase/supabase-js'
import { VANTAGENS_FUNDADORAS, paraVantagem, type LinhaVantagem, type Vantagem } from './vantagens'

/** Leitura no servidor, sempre fresca: o que o parceiro muda vale na hora. Se a
 *  funcao ainda nao existe (migracao nao aplicada) ou o banco falha, devolve
 *  `doBanco: false` e a pagina mostra os tres parceiros fundadores, sem Usar. */
export async function carregarVantagens(
  businessIds?: string[],
): Promise<{ vantagens: Vantagem[]; doBanco: boolean }> {
  try {
    const cliente = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) },
    })
    const { data, error } = await cliente.rpc('gostoso_club_vantagens', {
      p_business_ids: businessIds ?? null,
    })
    if (error) throw error
    return { vantagens: ((data ?? []) as LinhaVantagem[]).map(paraVantagem), doBanco: true }
  } catch {
    return { vantagens: businessIds ? [] : VANTAGENS_FUNDADORAS, doBanco: false }
  }
}
