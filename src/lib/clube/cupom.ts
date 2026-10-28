// Leitura do cupom por token, no servidor. As duas funcoes do banco (gostoso_club_verificar
// e gostoso_club_cupom) so respondem a quem tem o token, que tem 244 bits e nao se adivinha.
import { createClient } from '@supabase/supabase-js'

export type StatusCupom = 'valido' | 'usado' | 'expirado' | 'cancelado' | 'invalido'

export interface Verificacao {
  status: StatusCupom
  /** true quando o banco nao respondeu (nao confundir com cupom inexistente) */
  erro?: boolean
  primeiro_nome?: string
  negocio?: string
  slug?: string
  beneficio?: string
  codigo?: string
  expira_em?: string
  usado_em?: string | null
}

export interface CupomDoTitular {
  status: StatusCupom
  erro?: boolean
  nome?: string
  negocio?: string
  slug?: string
  beneficio?: string
  codigo?: string
  expira_em?: string
  usado_em?: string | null
}

export function tokenValido(token: string): boolean {
  return /^[0-9a-f]{64}$/.test(token)
}

function cliente() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) },
  })
}

async function chamar<T extends { status: StatusCupom; erro?: boolean }>(funcao: string, token: string): Promise<T> {
  if (!tokenValido(token)) return { status: 'invalido' } as T
  try {
    const { data, error } = await cliente().rpc(funcao, { p_token: token })
    if (error || !data) return { status: 'invalido', erro: true } as T
    return data as T
  } catch {
    return { status: 'invalido', erro: true } as T
  }
}

export function verificarCupom(token: string): Promise<Verificacao> {
  return chamar<Verificacao>('gostoso_club_verificar', token)
}

export function cupomDoTitular(token: string): Promise<CupomDoTitular> {
  return chamar<CupomDoTitular>('gostoso_club_cupom', token)
}
