'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import {
  CheckCircle, Store, PlusCircle, Eye, LayoutDashboard,
  Sparkles, ArrowRight, LogOut, User,
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useMyBusinesses } from '@/hooks/useMyBusinesses'
import { useMyProfessional } from '@/hooks/useProfessionals'
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

function TypeFork() {
  const router = useRouter()
  const { t } = useTranslation('painel')
  const lp = useLocalePath()
  const businessTags = t('typefork.business_tags').split('|')
  const professionalTags = t('typefork.professional_tags').split('|')
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-5">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl border border-[#E8E4DF] overflow-hidden shadow-sm">
          <div className="bg-[#1A1A1A] px-8 py-6">
            <h2 className="font-display text-xl font-bold text-white mb-1">
              {t('typefork.title')}
            </h2>
            <p className="text-[#888] text-sm">
              {t('typefork.subtitle')}
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-4">
              {t('typefork.select_prompt')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push(lp('/cadastre/negocios'))}
                className="text-left border-2 border-[#E8E4DF] rounded-2xl p-5 hover:border-teal hover:bg-teal/5 transition-all"
              >
                <Store className="w-8 h-8 text-teal mb-3" />
                <p className="font-semibold text-[#1A1A1A] text-sm mb-1">
                  {t('typefork.business_title')}
                </p>
                <p className="text-xs text-[#737373] leading-relaxed">
                  {t('typefork.business_desc')}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {businessTags.map(tag => (
                    <span key={tag} className="bg-[#F5F2EE] text-[#888] text-[10px] px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
              <button
                type="button"
                onClick={() => router.push(lp('/cadastre/profissional'))}
                className="text-left border-2 border-[#E8E4DF] rounded-2xl p-5 hover:border-teal hover:bg-teal/5 transition-all"
              >
                <User className="w-8 h-8 text-teal mb-3" />
                <p className="font-semibold text-[#1A1A1A] text-sm mb-1">
                  {t('typefork.professional_title')}
                </p>
                <p className="text-xs text-[#737373] leading-relaxed">
                  {t('typefork.professional_desc')}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {professionalTags.map(tag => (
                    <span key={tag} className="bg-[#F5F2EE] text-[#888] text-[10px] px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PainelInner() {
  const { user, supabase } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const role = profile?.role ?? null
  const { data: businesses = [], isLoading: businessesLoading } = useMyBusinesses()
  const { data: myProfessional, isLoading: profLoading } = useMyProfessional()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation('painel')
  const lp = useLocalePath()
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
  if (role === 'admin') { router.replace(lp('/cadastre/admin')); return null }

  // If no businesses and no professional profile, show the fork
  if (!profileLoading && !businessesLoading && !profLoading && businesses.length === 0 && !myProfessional) {
    return <TypeFork />
  }

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
      setCheckoutError(err instanceof Error ? err.message : t('plans_checkout_error'))
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-[#737373]" />
            <span className="text-sm font-semibold text-[#1A1A1A]">{t('header_title')}</span>
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
              title={t('sair')}
              className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#1A1A1A] border border-[#E8E4DF] hover:border-[#C4BFBA] rounded-xl px-3 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('sair')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8">

        {successMsg && (
          <div className="mb-6 bg-teal/10 border border-teal/20 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-teal flex-shrink-0" />
            <div>
              <p className="font-semibold text-teal text-sm">{t('success_title')}</p>
              <p className="text-xs text-teal/80 mt-0.5">{t('success_desc')}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">{t('greeting')}</h1>
          <p className="text-sm text-[#737373] mt-1">{t('greeting_sub')}</p>
        </div>

        {businesses.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              label={t('stats_businesses')}
              value={businesses.length}
            />
            <StatCard
              label={t('stats_published')}
              value={publishedCount}
              sub={publishedCount > 0 ? t('stats_published_sub') : undefined}
            />
            <StatCard
              label={t('stats_drafts')}
              value={draftCount}
              sub={draftCount > 0 ? t('stats_drafts_sub') : undefined}
            />
          </div>
        )}

        {draftCount > 0 && (
          <div className="mb-6 bg-ocre/8 border border-ocre/25 rounded-2xl px-5 py-4 flex items-start gap-3">
            <Eye className="w-4 h-4 text-ocre mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ocre">
                {t('draft_alert_title', { count: draftCount })}
              </p>
              <p className="text-xs text-[#737373] mt-0.5">
                {t('draft_alert_desc')}
              </p>
            </div>
            <Link
              href={lp('/cadastre/negocios')}
              className="flex items-center gap-1 text-xs font-semibold text-ocre hover:underline flex-shrink-0"
            >
              {t('draft_alert_cta')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          <Link
            href={lp('/cadastre/negocios')}
            className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Store className="w-5 h-5 mb-3 text-teal" />
            <h2 className="font-semibold text-[15px] text-[#1A1A1A] group-hover:text-teal transition-colors">
              {t('module_manage')}
            </h2>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              {t('module_manage_desc')}
            </p>
            {businesses.length > 0 && (
              <p className="text-[11px] text-teal mt-2.5 font-medium flex items-center gap-1">
                {t('module_manage_count', { count: businesses.length })} <ArrowRight className="w-3 h-3" />
              </p>
            )}
          </Link>

          <Link
            href={lp('/cadastre/perfil')}
            className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <PlusCircle className="w-5 h-5 mb-3 text-teal" />
            <h2 className="font-semibold text-[15px] text-[#1A1A1A] group-hover:text-teal transition-colors">
              {t('module_add')}
            </h2>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              {t('module_add_desc')}
            </p>
          </Link>

          <Link
            href={lp('/cadastre/preview')}
            className="group bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Eye className="w-5 h-5 mb-3 text-teal" />
            <h2 className="font-semibold text-[15px] text-[#1A1A1A] group-hover:text-teal transition-colors">
              {t('module_preview')}
            </h2>
            <p className="text-xs text-[#737373] mt-1 leading-relaxed">
              {t('module_preview_desc')}
            </p>
          </Link>

          {myProfessional && (
            <Link href={lp('/cadastre/profissional')} className="block bg-white rounded-2xl border border-[#E8E4DF] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">{myProfessional.display_name}</p>
                  <p className="text-xs text-[#737373]">{myProfessional.headline}</p>
                </div>
              </div>
              <p className="text-xs text-[#0D7C7C] font-semibold">{t('module_edit_professional')}</p>
            </Link>
          )}
        </div>

        {businesses.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-ocre" />
              <h2 className="font-display text-lg font-semibold">{t('plans_title')}</h2>
            </div>
            <p className="text-sm text-[#737373] mb-5">
              {t('plans_desc')}
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
                          {t('plan_label')}{' '}
                          <span className={
                            b.plan === 'destaque'
                              ? 'font-semibold text-ocre'
                              : b.plan === 'associado'
                              ? 'font-semibold text-teal'
                              : 'text-[#A0A0A0]'
                          }>
                            {b.plan === 'destaque' ? t('plan_destaque') : b.plan === 'associado' ? t('plan_associado') : t('plan_free')}
                          </span>
                          {b.plan_expires_at && (
                            <span className="ml-1 text-[#A0A0A0]">
                              {t('plan_expires', { date: new Date(b.plan_expires_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) })}
                            </span>
                          )}
                        </p>
                      </div>
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
                            {t('billing_monthly')}
                          </button>
                          <button
                            onClick={() => toggleBillingMode(b.id, 'annual')}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                              billing === 'annual'
                                ? 'bg-white text-[#1A1A1A] shadow-sm'
                                : 'text-[#737373] hover:text-[#1A1A1A]'
                            }`}
                          >
                            {t('billing_annual')}
                            <span className="bg-ocre text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                              -10%
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {billing === 'annual' && b.plan !== 'destaque' && (
                      <div className="mb-3 text-xs text-ocre bg-ocre/10 border border-ocre/20 rounded-xl px-3 py-2">
                        {t('annual_info')}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {b.plan === 'free' && (
                        <>
                          <button
                            onClick={() => handleCheckout(b.id, 'associado')}
                            disabled={isLoading}
                            className="text-xs font-semibold bg-teal text-white px-4 py-2 rounded-xl hover:bg-teal/90 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? '...' : t('btn_associate', { price: prices.associado })}
                          </button>
                          <button
                            onClick={() => handleCheckout(b.id, 'destaque')}
                            disabled={isLoading}
                            className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre/90 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? '...' : t('btn_destaque', { price: prices.destaque })}
                          </button>
                        </>
                      )}
                      {b.plan === 'associado' && (
                        <button
                          onClick={() => handleCheckout(b.id, 'destaque')}
                          disabled={isLoading}
                          className="text-xs font-semibold bg-ocre text-white px-4 py-2 rounded-xl hover:bg-ocre/90 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : t('btn_upgrade', { price: prices.destaque })}
                        </button>
                      )}
                      {b.plan === 'destaque' && (
                        <div className="flex items-center gap-1.5 text-xs text-ocre font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('plan_destaque_active')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {businesses.some(b => b.plan === 'free') && (
              <div className="mt-5 rounded-2xl border border-[#E8E4DF] overflow-hidden">
                <div className="grid grid-cols-3 text-xs">
                  <div className="px-4 py-3 font-semibold text-[#737373] border-b border-[#E8E4DF]">{t('feature_header_benefit')}</div>
                  <div className="px-4 py-3 font-semibold text-teal text-center border-b border-[#E8E4DF]">{t('feature_header_associado')}</div>
                  <div className="px-4 py-3 font-semibold text-ocre text-center border-b border-[#E8E4DF]">{t('feature_header_destaque')}</div>
                  {[
                    [t('feature_listed'), '✓', '✓'],
                    [t('feature_verified'), '✓', '✓'],
                    [t('feature_priority'), '—', '✓'],
                    [t('feature_cover'), '—', '✓'],
                    [t('feature_support'), '—', '✓'],
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

        <div className="mt-12 pt-6 border-t border-[#E8E4DF] text-center">
          <p className="text-xs text-[#C4BFBA]">
            {t('footer_help')}{' '}
            <a href="https://www.instagram.com/vivegostoso" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
              @vivegostoso
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
