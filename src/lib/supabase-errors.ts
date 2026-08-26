/** Maps Postgres/Supabase error codes and messages to friendly pt-BR strings. */
export function translateSupabaseError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  const code = (err as { code?: string })?.code ?? ''

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
