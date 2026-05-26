'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle, Store, PlusCircle, Eye, LayoutDashboard,
  Sparkles, ArrowRight, LogOut, User,
} from 'lucide-react'
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

function UserAvatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full bg-teal/15 text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 min-w-0">
      <p className="text-2xl font-bold text-[#1A1A1A] tabular-nums">{value}</p>
      <p className="text-xs text-[#737373] mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-[11px] text-teal mt-1 font-medium">{sub}</p>}
    </div>
  )
}

function PainelInner() {
  const { user, supabase } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const role = profile?.role ?? null
  const { data: businesses = [] } = useMyBusinesses()
  const router = useRouter()
  const searchParams = useSearchParams()
  const successMsg = searchParams?.get('associado') === 'success'
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [billingMode, setBillingMode] = useState<Record<string, 'monthly' | 'annual'>>({})

  // Must be AFTER all hook calls
  if (profileLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (role === 'admin') { router.replace('/cadastre/admin'); return null }

  const publishedCount = businesses.filter(b => b.is_published).length
  const draftCount = businesses.filter(b => !b.is_published).length
  const hasActivePlan = businesses.some(b => b.plan !== 'free')

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
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-[#737373]" />
            <span className="text-sm font-semibold text-[#1A1A1A]">Painel do Prestador</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <div className="hidden sm:flex items-center gap-2">
                <UserAvatar email={user.email} />
                <span className="text-xs text-[#737373] truncate max-w-[180px]">{user.email}</span>
              </div>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              title="Sair"
              className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#1A1A1A] border border-[#E8E4DF] hover:border-[#C4BFBA] rounded-xl px-3 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8">

        {/* ── Success banner ── */}
        {successMsg && (
          <div className="mb-6 bg-teal/10 border border-teal/20 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-teal flex-shrink-0" />
            <div>
              <p className="font-semibold text-teal text-sm">Associação confirmada!</p>
              <p className="text-xs text-teal/80 mt-0.5">Seu negócio agora aparece com o selo verificado.</p>
            </div>
          </div>
        )}

        {/* ── Greeting ── */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">Olá! 👋</h1>
          <p className="text-sm text-[#737373] mt-1">Gerencie seus negócios e planos no Vive Gostoso.</p>
        </div>

        {/* ── Stats bar ── */}
        {businesses.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              label="Negócios cadastrados"
              value={businesses.length}
            />
            <StatCard
              label="Publicados"
              value={publishedCount}
              sub={publishedCount > 0 ? 'Visíveis no diretório' : undefined}
            />
            <StatCard
              label="Rascunhos"
              value={draftCount}
              sub={draftCount > 0 ? 'Não visíveis ainda' : undefined}
            />
          </div>
        )}

        {/* ── Draft alert ── */}
        {draftCount > 0 && (
          <div className="mb-6 bg-ocre/8 border border-ocre/25 rounded-2xl px-5 py-4 flex items-start gap-3">
            <Eye className="w-4 h-4 text-ocre mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ocre">
                {draftCount === 1 ? '1 negócio em rascunho' : `${draftCount} negócios em rascunho`}
              </p>
              <p className="text-xs text-[#737373] mt-0.5">
                Complete o perfil e publique para aparecer no diretório.
              </p>
            </div>
            <Link
              href="/cadastre/negocios"
              className="flex items-center gap-1 text-xs font-semibold text-ocre hover:underline flex-shrink-0"
            >
              Ver <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ── Module grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <Link
            href="/cadastre/negocios"
            className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Store className="w-5 h-5 mb-3 text-teal" />
            <h2 className="font-semibold text-[15px] text-[#1A1A1A] group-hover:text-teal transition-colors">
              Gerenciar negócios
            </h2>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Veja, edite e publique seus negócios cadastrados.
            </p>
            {businesses.length > 0 && (
              <p className="text-[11px] text-teal mt-2.5 font-medium flex items-center gap-1">
                {businesses.length} negócio{businesses.length !== 1 ? 's' : ''} <ArrowRight className="w-3 h-3" />
              </p>
            )}
          </Link>

          <Link
            href="/cadastre/perfil"
            className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <PlusCircle className="w-5 h-5 mb-3 text-teal" />
            <h2 className="font-semibold text-[15px] text-[#1A1A1A] group-hover:text-teal transition-colors">
              Adicionar negócio
            </h2>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Cadastre um novo negócio na plataforma Vive Gostoso.
            </p>
          </Link>

          <Link
            href="/cadastre/preview"
            className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Eye className="w-5 h-5 mb-3 text-teal" />
            <h2 className="font-semibold text-[15px] text-[#1A1A1A] group-hover:text-teal transition-colors">
              Preview
            </h2>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              Veja como seu negócio aparece para visitantes do diretório.
            </p>
          </Link>
        </div>

        {/* ── Subscription section ── */}
        {businesses.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-ocre" />
              <h2 className="font-display text-lg font-semibold">Planos</h2>
            </div>
            <p className="text-sm text-[#737373] mb-5">
              Destaque seu negócio e apoie o Vive Gostoso.
            </p>

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
                    className={`bg-white border rounded-2xl p-5 transition-colors ${
                      b.plan === 'destaque'
                        ? 'border-ocre/30 bg-ocre/[0.02]'
                        : b.plan === 'associado'
                        ? 'border-teal/20 bg-teal/[0.01]'
                        : 'border-[#E8E4DF]'
                    }`}
                  >
                    {/* Business name + current plan */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#1A1A1A] truncate">{b.name}</p>
                        <p className="text-xs text-[#737373] mt-0.5">
                          Plano:{' '}
                          <span className={
                            b.plan === 'destaque'
                              ? 'font-semibold text-ocre'
                              : b.plan === 'associado'
                              ? 'font-semibold text-teal'
                              : 'text-[#A0A0A0]'
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
                        <div className="flex items-center gap-0.5 bg-[#F5F2EE] rounded-xl p-1 flex-shrink-0">
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
                            className="text-xs font-semibold bg-teal text-white px-4 py-2 rounded-xl hover:bg-teal/90 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? '...' : `Associar — ${prices.associado}`}
                          </button>
                          <button
                            onClick={() => handleCheckout(b.id, 'destaque')}
                            disabled={isLoading}
                            className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre/90 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? '...' : `Destaque — ${prices.destaque}`}
                          </button>
                        </>
                      )}
                      {b.plan === 'associado' && (
                        <button
                          onClick={() => handleCheckout(b.id, 'destaque')}
                          disabled={isLoading}
                          className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre/90 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : `Upgrade para Destaque — ${prices.destaque}`}
                        </button>
                      )}
                      {b.plan === 'destaque' && (
                        <div className="flex items-center gap-1.5 text-xs text-ocre font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Plano Destaque ativo
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Plan feature comparison */}
            {businesses.some(b => b.plan === 'free') && (
              <div className="mt-5 rounded-2xl border border-[#E8E4DF] overflow-hidden">
                <div className="grid grid-cols-3 text-xs">
                  <div className="px-4 py-3 font-semibold text-[#737373] border-b border-[#E8E4DF]">Benefício</div>
                  <div className="px-4 py-3 font-semibold text-teal text-center border-b border-[#E8E4DF]">Associado</div>
                  <div className="px-4 py-3 font-semibold text-ocre text-center border-b border-[#E8E4DF]">Destaque</div>
                  {[
                    ['Listado no diretório', '✓', '✓'],
                    ['Selo verificado', '✓', '✓'],
                    ['Posição prioritária', '—', '✓'],
                    ['Foto de capa em destaque', '—', '✓'],
                    ['Suporte prioritário', '—', '✓'],
                  ].map(([feat, a, d]) => (
                    <>
                      <div key={`f-${feat}`} className="px-4 py-2.5 text-[#737373] border-b border-[#F5F2EE] last:border-0">{feat}</div>
                      <div key={`a-${feat}`} className={`px-4 py-2.5 text-center border-b border-[#F5F2EE] last:border-0 ${a === '✓' ? 'text-teal font-semibold' : 'text-[#C4BFBA]'}`}>{a}</div>
                      <div key={`d-${feat}`} className={`px-4 py-2.5 text-center border-b border-[#F5F2EE] last:border-0 ${d === '✓' ? 'text-ocre font-semibold' : 'text-[#C4BFBA]'}`}>{d}</div>
                    </>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Empty state (no businesses yet) ── */}
        {businesses.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
            <Store className="w-10 h-10 mb-4 text-[#C4BFBA] mx-auto" />
            <h2 className="font-display text-lg font-semibold text-[#1A1A1A] mb-2">
              Seu espaço no Vive Gostoso espera por você
            </h2>
            <p className="text-sm text-[#737373] mb-6 max-w-xs mx-auto">
              Cadastre seu negócio e apareça para os turistas e moradores de São Miguel do Gostoso.
            </p>
            <Link href="/cadastre/perfil">
              <Button variant="primary" className="inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Cadastrar meu negócio
              </Button>
            </Link>
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="mt-12 pt-6 border-t border-[#E8E4DF] text-center">
          <p className="text-xs text-[#C4BFBA]">
            Dúvidas? Fale com a equipe pelo{' '}
            <a href="https://www.instagram.com/vivegostoso" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
              @vivegostoso
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
