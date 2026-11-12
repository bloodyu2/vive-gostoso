/**
 * Flag única dos fluxos Stripe (doação em /apoie e checkout de planos no painel).
 *
 * KAN-356: a conta Stripe da Balaio encerra e os repasses param em 22/10/2026.
 * Por padrão os pagamentos ficam desligados — sem exigir variável nova na Vercel.
 * Para religar: NEXT_PUBLIC_PAGAMENTOS_ATIVOS=true.
 *
 * Não remove código Stripe; só esconde entradas e bloqueia o início da sessão.
 */
export function pagamentosAtivos(): boolean {
  return process.env.NEXT_PUBLIC_PAGAMENTOS_ATIVOS === 'true'
}
