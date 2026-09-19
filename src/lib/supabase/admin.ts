import { createClient } from '@supabase/supabase-js'

/**
 * Cliente admin (service role) para os Route Handlers de cobranca.
 *
 * Existe porque `gostoso_businesses` tem trigger anti-autoelevacao: dono autenticado
 * nao consegue escrever `plan`/`plan_expires_at` nem pela chave anonima
 * (`vp_guard_business_update`), nem por INSERT. Quem ativa plano e a cobranca
 * confirmada, que roda sem sessao de usuario -- mesmo caminho que as edge
 * functions do Stripe ja usavam com a service role.
 *
 * Falha explicita quando a chave nao esta configurada, em vez de cair num
 * placeholder silencioso que so aparece em producao.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Cliente admin indisponivel: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
