'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { CheckCircle } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusinesses'
import { useSubmitClaim, useMyClaimStatus } from '@/hooks/useClaims'

type Props = { slug?: string; user?: User | null }

export default function Claim({ slug: slugProp }: Props) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { data: business } = useBusiness(slugProp ?? '')
  const { user, loading: authLoading } = useAuth()
  // Auth form state
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading2, setAuthLoading2] = useState(false)
  const [message, setMessage] = useState('')

  const [submitted, setSubmitted] = useState(false)
  const submitClaim = useSubmitClaim()
  const { data: existingClaim } = useMyClaimStatus(business?.id ?? '')

  // Once user is authenticated, auto-submit the claim
  useEffect(() => {
    if (!user || !business || submitted || existingClaim) return
    ;(async () => {
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      let pid: string
      if (profile) {
        pid = (profile as { id: string }).id
      } else {
        const { data: newP } = await supabase
          .from('gostoso_profiles')
          .insert([{ auth_user_id: user.id, email: user.email ?? '' }])
          .select('id')
          .single()
        if (!newP) return
        pid = (newP as { id: string }).id
      }

      await submitClaim.mutateAsync({ businessId: business.id, profileId: pid, message: message || undefined })
      setSubmitted(true)
    })()
  }, [user, business])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading2(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(t('claim:error_auth'))
    } else {
      if (password.length < 8) {
        setAuthError(t('claim:error_password'))
        setAuthLoading2(false)
        return
      }
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
    }
    setAuthLoading2(false)
  }

  if (!business) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <p className="text-[#737373] text-sm">{t('claim:loading')}</p>
    </div>
  )

  // Business already has an owner
  if (business.profile_id) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-display text-2xl font-semibold mb-2">{t('claim:owned_title')}</h2>
        <p className="text-[#737373] text-sm mb-6">
          {t('claim:owned_desc', { name: business.name })}
        </p>
        <Link
          href={lp(`/negocio/${business.slug}`)}
          className="text-teal text-sm font-semibold"
        >
          {t('claim:owned_back')}
        </Link>
      </div>
    </div>
  )

  // Claim already submitted / approved
  if (submitted || existingClaim?.status === 'pending') return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <CheckCircle className="w-10 h-10 mb-4 text-teal mx-auto" />
        <h2 className="font-display text-2xl font-semibold mb-2">{t('claim:success_title')}</h2>
        <p className="text-[#737373] text-sm mb-6">
          {t('claim:success_desc', { name: business.name })}
        </p>
        <Link href={lp(`/negocio/${business.slug}`)} className="text-teal text-sm font-semibold">
          {t('claim:success_back')}
        </Link>
      </div>
    </div>
  )

  if (existingClaim?.status === 'approved') return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">&#x2705;</div>
        <h2 className="font-display text-2xl font-semibold mb-2">{t('claim:approved_title')}</h2>
        <p className="text-[#737373] text-sm mb-6">
          {t('claim:approved_desc', { name: business.name })}
        </p>
        <Link href={lp('/cadastre/painel')} className="text-teal text-sm font-semibold">
          {t('claim:approved_cta')}
        </Link>
      </div>
    </div>
  )

  // If user is already logged in but claim not submitted yet — auto-submits via useEffect
  if (user || authLoading) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <p className="text-[#737373] text-sm">{t('claim:submitting')}</p>
      </div>
    </div>
  )

  // Main form — not logged in
  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md shadow-sm">
        <div className="flex justify-center mb-6"><Logo height={32} /></div>

        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-semibold mb-1">{t('claim:main_title')}</h1>
          <p className="text-[#737373] text-sm">{t('claim:main_sub')}</p>
          <p className="font-semibold text-[#1A1A1A] mt-1">{business.name}</p>
        </div>

        {/* Message to admin */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1.5">
            {t('claim:message_label')} <span className="text-[#737373] font-normal">{t('claim:message_optional')}</span>
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('claim:message_placeholder')}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 resize-none"
          />
        </div>

        <div className="border-t border-[#F5F2EE] pt-5">
          <p className="text-xs text-[#737373] mb-4 text-center">
            {mode === 'login' ? t('claim:form_login_hint') : t('claim:form_register_hint')}
          </p>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-[#E8E4DF] overflow-hidden mb-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 transition-colors ${mode === 'login' ? 'bg-teal text-white' : 'text-[#737373] hover:bg-areia'}`}
            >
              {t('claim:tab_login')}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 transition-colors ${mode === 'register' ? 'bg-teal text-white' : 'text-[#737373] hover:bg-areia'}`}
            >
              {t('claim:tab_register')}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('claim:email_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('claim:password_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            {authError && (
              <p className="text-xs text-red-500">{authError}</p>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={authLoading2}>
              {authLoading2 ? t('claim:submit_loading') : mode === 'login' ? t('claim:submit_login') : t('claim:submit_register')}
            </Button>
          </form>
        </div>

        <p className="text-xs text-[#737373] text-center mt-5 leading-relaxed">
          {t('claim:footer')}
        </p>
      </div>
    </div>
  )
}
