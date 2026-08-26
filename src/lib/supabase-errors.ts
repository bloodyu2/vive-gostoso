import type { SupabaseClient } from '@supabase/supabase-js'

export class SessionExpiredError extends Error {
  constructor() { super('SESSION_EXPIRED') }
}

/** Validates the session against the server before a protected write.
 *  Throws SessionExpiredError if the user is not authenticated.
 *  Use getUser() (server-validated) rather than getSession() (local cache only). */
export async function assertSession(supabase: Pick<SupabaseClient, 'auth'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new SessionExpiredError()
}

/** Maps Postgres/Supabase error codes and messages to friendly pt-BR strings. */
export function translateSupabaseError(err: unknown): string {
  // Session errors: checked before the write, so this path means a real permission issue.
  // But keep the SessionExpiredError check first in case the session expires mid-operation.
  if (err instanceof SessionExpiredError) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  const msg = err instanceof Error ? err.message : String(err)
  const code = (err as { code?: string })?.code ?? ''

  // 42501 after a valid session check = real ownership/permission issue, not a session problem.
  if (code === '42501' || msg.includes('row-level security') || msg.includes('RLS')) {
    return 'Você não tem permissão para editar este negócio.'
  }
  if (msg.includes('duplicate key') || code === '23505') {
    return 'Já existe um registro com esses dados. Verifique e tente novamente.'
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout') || msg.includes('Failed to fetch')) {
    return 'Não foi possível salvar agora. Verifique sua conexão e tente novamente.'
  }
  if (msg.includes('JWT') || msg.includes('token')) {
    return 'Sua sessão expirou. Faça login novamente.'
  }
  // Generic fallback — never expose raw SQL or stack
  return 'Não foi possível salvar. Tente novamente em instantes.'
}
