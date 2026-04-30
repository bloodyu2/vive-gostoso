import { useState } from 'react'
import { Link, useSearchParams, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useMyBusinesses } from '@/hooks/useMyBusinesses'
import { startCheckout } from '@/hooks/useCheckout'
import { Button } from '@/components/ui/button'

const PLAN_PRICES = {
  monthly: { associado: 'R$39,90/mês', destaque: 'R$59,90/mês' },
  annual:  { associado: 'R$430,92/ano', destaque: 'R$646,92/ano' },
} as const

export default function Painel() {
  return <AuthGuard><PainelInner /></AuthGuard>
}

function PainelInner() {
  const { user, signOut } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const role = profile?.role ?? null
  const { data: businesses = [] } = useMyBusinesses()
  const [searchParams] = useSearchParams()
  const successMsg = searchParams.get('associado') === 'success'
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [billingMode, setBillingMode] = useState<Record<string, 'monthly' | 'annual'>>({})

  // Must be AFTER all hook calls
  if (profileLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (role === 'admin') return <Navigate to="/cadastre/admin" replace />

  function getBilling(bizId: string): 'monthly' | 'annual' {
    return billingMode[bizId] ?? 'monthly'
  }

  function toggleBillingMode(bizId: string, mode: 'monthly' | 'annual') {
    setBillingMode(prev => ({ ...prev, [bizId]: mode }))
  }

  async function handleCheckout(bizId: string, plan: 'associado' | 'destaque') {
    setCheckoutLoading(bizId)
    setCheckoutError(null)
    try {
      await startCheckout(bizId, plan, getBilling(bizId))
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Erro ao iniciar pagamento. Tente novamente.')
      setCheckoutLoading(null)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold">Painel do Prestador</h1>
          <p className="text-sm text-[#737373] mt-1">{user?.email}</p>
        </div>
        <Button variant="ghost" onClick={signOut}>Sair</Button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-6 bg-teal/10 border border-teal/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-teal text-sm">Associação confirmada!</p>
            <p className="text-xs text-teal/80 mt-0.5">Seu negócio agora aparece com o selo verificado.</p>
          </div>
        </div>
      )}

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/cadastre/negocios" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">🏪</div>
          <h2 className="font-semibold text-lg">Gerenciar negócios</h2>
          <p className="text-sm text-[#737373] mt-1">Veja, edite e publique seus negócios cadastrados.</p>
        </Link>
        <Link to="/cadastre/perfil" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">➕</div>
          <h2 className="font-semibold text-lg">Adicionar novo negócio</h2>
          <p className="text-sm text-[#737373] mt-1">Cadastre mais um negócio na plataforma.</p>
        </Link>
        <Link to="/cadastre/preview" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">👁</div>
          <h2 className="font-semibold text-lg">Preview</h2>
          <p className="text-sm text-[#737373] mt-1">Como seu negócio aparece no diretório.</p>
        </Link>
        {role === 'admin' && (
          <Link
            to="/cadastre/admin"
            className="bg-teal/10 border border-teal/20 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all col-span-full"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h2 className="font-semibold text-lg text-teal">Painel Admin</h2>
            <p className="text-sm text-[#737373] mt-1">Moderar avaliações, reivindicações, serviços e vagas.</p>
          </Link>
        )}
      </div>

      {/* Subscription section */}
      {businesses.length > 0 && (
        <div className="mt-10 border-t border-[#E8E4DF] pt-8">
          <h2 className="font-display text-xl font-semibold mb-1">Planos</h2>
          <p className="text-sm text-[#737373] mb-5">Destaque seu negócio no diretório e apoie Gostoso.</p>

          {checkoutError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {checkoutError}
            </div>
          )}

          <div className="space-y-4">
            {businesses.map(b => {
              const billing = getBilling(b.id)
              const isLoading = checkoutLoading === b.id
              const prices = PLAN_PRICES[billing]

              return (
                <div
                  key={b.id}
                  className="bg-white border border-[#E8E4DF] rounded-2xl p-5"
                >
                  {/* Business name + current plan */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">{b.name}</p>
                      <p className="text-xs text-[#737373] mt-0.5">
                        Plano atual:{' '}
                        <span className={
                          b.plan === 'destaque'
                            ? 'font-semibold text-ocre'
                            : b.plan === 'associado'
                            ? 'font-semibold text-teal'
                            : ''
                        }>
                          {b.plan === 'destaque' ? '★ Destaque' : b.plan === 'associado' ? '✓ Associado' : 'Gratuito'}
                        </span>
                        {b.plan_expires_at && (
                          <span className="ml-1 text-[#A0A0A0]">
                            · válido até {new Date(b.plan_expires_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Billing toggle — only show for upgradeable plans */}
                    {b.plan !== 'destaque' && (
                      <div className="flex items-center gap-1 bg-[#F5F2EE] rounded-xl p-1">
                        <button
                          onClick={() => toggleBillingMode(b.id, 'monthly')}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            billing === 'monthly'
                              ? 'bg-white text-[#1A1A1A] shadow-sm'
                              : 'text-[#737373] hover:text-[#1A1A1A]'
                          }`}
                        >
                          Mensal
                        </button>
                        <button
                          onClick={() => toggleBillingMode(b.id, 'annual')}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                            billing === 'annual'
                              ? 'bg-white text-[#1A1A1A] shadow-sm'
                              : 'text-[#737373] hover:text-[#1A1A1A]'
                          }`}
                        >
                          Anual
                          <span className="bg-ocre text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            -10%
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Annual info pill */}
                  {billing === 'annual' && b.plan !== 'destaque' && (
                    <div className="mb-3 text-xs text-ocre bg-ocre/10 border border-ocre/20 rounded-xl px-3 py-2">
                      Pague uma vez por ano e economize 10%. Cartão e boleto aceitos.
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {b.plan === 'free' && (
                      <>
                        <button
                          onClick={() => handleCheckout(b.id, 'associado')}
                          disabled={isLoading}
                          className="text-xs font-semibold bg-teal text-white px-4 py-2 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : `Associar — ${prices.associado}`}
                        </button>
                        <button
                          onClick={() => handleCheckout(b.id, 'destaque')}
                          disabled={isLoading}
                          className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre-dark transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : `Destaque — ${prices.destaque}`}
                        </button>
                      </>
                    )}
                    {b.plan === 'associado' && (
                      <button
                        onClick={() => handleCheckout(b.id, 'destaque')}
                        disabled={isLoading}
                        className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre-dark transition-colors disabled:opacity-50"
                      >
                        {isLoading ? '...' : `Atualizar para Destaque — ${prices.destaque}`}
                      </button>
                    )}
                    {b.plan === 'destaque' && (
                      <span className="text-xs text-ocre font-semibold">★ Plano Destaque ativo</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
