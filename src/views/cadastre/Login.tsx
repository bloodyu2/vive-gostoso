'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Camera, BarChart2, MapPin, Mail } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'

type Mode = 'login' | 'register' | 'forgot'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { t } = useTranslation()
  const lp = useLocalePath()

  if (authLoading || (user && profileLoading)) return (
    <div className="flex items-center justify-center min-h-screen bg-areia">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (user) {
    if (profile?.role === 'admin') {
      router.replace(lp('/cadastre/admin'))
    } else {
      router.replace(lp('/cadastre/painel'))
    }
    return null
  }

  const supabase = createClient()

  function resetForm() {
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirm('')
  }

  function switchMode(next: Mode) {
    resetForm()
    setMode(next)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(t('cadastro.error_invalid_credentials'))
      setLoading(false)
      return
    }
    // Fetch profile immediately to route admin users directly
    const userId = data.user?.id
    if (userId) {
      const { data: prof } = await supabase
        .from('gostoso_profiles')
        .select('role')
        .eq('auth_user_id', userId)
        .maybeSingle()
      router.push(prof?.role === 'admin' ? lp('/cadastre/admin') : lp('/cadastre/painel'))
    } else {
      router.push(lp('/cadastre/painel'))
    }
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('cadastro.error_password_mismatch'))
      return
    }
    if (password.length < 8) {
      setError(t('cadastro.error_password_length'))
      return
    }
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      setError(t('cadastro.error_create_account'))
    } else {
      setSuccess(t('cadastro.success_account_created'))
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${lp('/cadastre/resetar-senha')}`,
    })
    if (authError) {
      setError(t('cadastro.error_send_email'))
    } else {
      setSuccess(t('cadastro.success_email_sent'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-sm border border-[#E8E4DF]">
        {/* Teal header */}
        <div className="bg-teal flex flex-col items-center justify-center px-8 py-8">
          <Logo height={36} dark />
          <p className="text-white/80 text-sm mt-2">{t('cadastro.subtitle')}</p>
        </div>

        {/* White body */}
        <div className="bg-white p-8">
          {/* Tourist notice */}
          <div className="flex items-start gap-2.5 bg-areia rounded-xl px-4 py-3 mb-6 text-sm text-[#737373]">
            <MapPin className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
            <span>{t('cadastro.tourist_notice')} <Link href={lp('/')} className="text-teal font-medium hover:underline">{t('cadastro.tourist_link')}</Link>.</span>
          </div>

          {/* Value props - shown only on login/register, not forgot */}
          {mode !== 'forgot' && (
            <>
              <h1 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">
                {mode === 'login' ? t('cadastro.title_login') : t('cadastro.title_register')}
              </h1>
              <p className="text-[#737373] text-sm mb-6">
                {mode === 'login'
                  ? t('cadastro.sub_login')
                  : t('cadastro.sub_register')}
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                  <Calendar className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <span>{t('cadastro.benefit_1')}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                  <Camera className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <span>{t('cadastro.benefit_2')}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                  <BarChart2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <span>{t('cadastro.benefit_3')}</span>
                </li>
              </ul>
            </>
          )}

          {/* Forgot password */}
          {mode === 'forgot' && (
            <>
              <h1 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">
                {t('cadastro.forgot_title')}
              </h1>
              <p className="text-[#737373] text-sm mb-6">
                {t('cadastro.forgot_sub')}
              </p>
            </>
          )}

          {/* Success state */}
          {success ? (
            <div className="text-center">
              <Mail className="w-12 h-12 text-teal mx-auto mb-4" />
              <p className="text-[#1A1A1A] text-sm mb-6">{success}</p>
              <Button variant="secondary" className="w-full" onClick={() => { setSuccess(null); switchMode('login') }}>
                {t('cadastro.back_login')}
              </Button>
            </div>
          ) : (
            <>
              {/* Login form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('cadastro.email_placeholder')}
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('cadastro.password_placeholder')}
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  {error && <p className="text-coral text-sm text-center">{error}</p>}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? t('cadastro.login_btn_loading') : t('cadastro.login_btn')}
                  </Button>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[#737373] hover:text-teal transition-colors"
                    >
                      {t('cadastro.forgot_link')}
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-teal font-medium hover:underline"
                    >
                      {t('cadastro.register_btn')}
                    </button>
                  </div>
                </form>
              )}

              {/* Register form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('cadastro.email_placeholder')}
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('cadastro.password_register_placeholder')}
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder={t('cadastro.confirm_placeholder')}
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  {error && <p className="text-coral text-sm text-center">{error}</p>}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? t('cadastro.register_btn_loading') : t('cadastro.register_btn')}
                  </Button>
                  <div className="text-center text-sm mt-1">
                    <span className="text-[#737373]">{t('cadastro.has_account')} </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-teal font-medium hover:underline"
                    >
                      {t('cadastro.login_link')}
                    </button>
                  </div>
                </form>
              )}

              {/* Forgot password form */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('cadastro.email_placeholder')}
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  {error && <p className="text-coral text-sm text-center">{error}</p>}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? t('cadastro.forgot_btn_loading') : t('cadastro.forgot_btn')}
                  </Button>
                  <div className="text-center text-sm mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#737373] hover:text-teal transition-colors"
                    >
                      {t('cadastro.back_login')}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
