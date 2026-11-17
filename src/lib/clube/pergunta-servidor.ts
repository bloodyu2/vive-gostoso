// Leitura, no servidor, dos dados da pagina "Voce usou o cupom?" (KAN-896). So responde a
// quem tem o token (o da pergunta ou o do cupom, 244 bits), e devolve o minimo: primeiro nome,
// negocio, vantagem e o estado. Nunca e-mail nem telefone.
import { createClient } from '@supabase/supabase-js'
import { tokenValido } from './cupom'

export interface DadosPergunta {
  status: 'valido' | 'usado' | 'cancelado' | 'invalido'
  /** true quando o banco nao respondeu (nao confundir com link inexistente) */
  erro?: boolean
  primeiro_nome?: string
  negocio?: string
  slug?: string
  beneficio?: string
  codigo?: string
  expira_em?: string
  /** resposta ja dada: 'sim', 'nao' ou null */
  resposta?: 'sim' | 'nao' | null
}

export async function dadosDaPergunta(token: string): Promise<DadosPergunta> {
  if (!tokenValido(token)) return { status: 'invalido' }
  try {
    const cliente = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) },
    })
    const { data, error } = await cliente.rpc('gostoso_club_pergunta_dados', { p_token: token })
    if (error || !data) return { status: 'invalido', erro: true }
    return data as DadosPergunta
  } catch {
    return { status: 'invalido', erro: true }
  }
}
