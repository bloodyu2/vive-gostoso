import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useMyBusinesses } from '@/hooks/useMyBusinesses'
import { startCheckout } from '@/hooks/useCheckout'
import { Button } from '@/components/ui/button'

export default function Painel() {
  return <AuthGuard><PainelInner /></AuthGuard>
}

function PainelInner() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const role = profile?.role ?? null
  const { data: businesses = [] } = useMyBusinesses()
  const [searchParams] = useSearchParams()
  const successMsg = searchParams.get('associado') === 'success'
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  async function handleCheckout(bizId: string, plan: 'associado' | 'destaque') {
    setCheckoutLoading(bizId)
    try {
      await startCheckout(bizId, plan)
    } catch {
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
          <div className="space-y-3">
            {businesses.map(b => (
              <div
                key={b.id}
                className="bg-white border border-[#E8E4DF] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
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
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {b.plan === 'free' && (
                    <>
                      <button
                        onClick={() => handleCheckout(b.id, 'associado')}
                        disabled={checkoutLoading === b.id}
                        className="text-xs font-semibold bg-teal text-white px-4 py-2 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50"
                      >
                        {checkoutLoading === b.id ? '...' : 'Associar — R$39,90/mês'}
                      </button>
                      <button
                        onClick={() => handleCheckout(b.id, 'destaque')}
                        disabled={checkoutLoading === b.id}
                        className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre-dark transition-colors disabled:opacity-50"
                      >
                        {checkoutLoading === b.id ? '...' : 'Destaque — R$59,90/mês'}
                      </button>
                    </>
                  )}
                  {b.plan === 'associado' && (
                    <button
                      onClick={() => handleCheckout(b.id, 'destaque')}
                      disabled={checkoutLoading === b.id}
                      className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre-dark transition-colors disabled:opacity-50"
                    >
                      {checkoutLoading === b.id ? '...' : 'Atualizar para Destaque — R$59,90/mês'}
                    </button>
                  )}
                  {b.plan === 'destaque' && (
                    <span className="text-xs text-ocre font-semibold">★ Plano Destaque ativo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
