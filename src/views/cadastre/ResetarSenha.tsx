'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'

type Stage = 'waiting' | 'form' | 'success' | 'invalid'

export default function ResetarSenha() {
  const [stage, setStage] = useState<Stage>('waiting')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()
  const lp = useLocalePath()
  const supabase = createClient()

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link.
    // The token in the URL hash is exchanged automatically — we just listen for it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStage('form')
      }
    })

    // Also check if there's already an active recovery session (e.g. page refresh)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStage('form')
      } else {
        // Give it 3s for the hash exchange, then mark as invalid
        setTimeout(() => {
          setStage(s => s === 'waiting' ? 'invalid' : s)
        }, 3000)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t('auth.error_password_length'))
      return
    }
    if (password !== confirm) {
      setError(t('auth.error_password_mismatch'))
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(t('auth.error_update'))
    } else {
      setStage('success')
    }
  }

  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-sm border border-[#E8E4DF]">
        {/* Teal header */}
        <div className="bg-teal flex flex-col items-center justify-center px-8 py-8">
          <Logo height={36} dark />
          <p className="text-white/80 text-sm mt-2">{t('auth.subtitle')}</p>
        </div>

        <div className="bg-white p-8">
          {/* Waiting */}
          {stage === 'waiting' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-4 animate-pulse">🔑</div>
              <p className="text-[#737373] text-sm">{t('auth.waiting')}</p>
            </div>
          )}

          {/* Invalid / expired link */}
          {stage === 'invalid' && (
            <div className="text-center">
              <div className="text-5xl mb-4">⏱️</div>
              <h2 className="font-display text-xl font-semibold mb-2 text-[#1A1A1A]">{t('auth.invalid_title')}</h2>
              <p className="text-[#737373] text-sm mb-6">
                {t('auth.invalid_desc')}
              </p>
              <Button variant="primary" className="w-full" onClick={() => router.push(lp('/cadastre'))}>
                {t('auth.invalid_btn')}
              </Button>
            </div>
          )}

          {/* Reset form */}
          {stage === 'form' && (
            <>
              <h1 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">
                {t('auth.form_title')}
              </h1>
              <p className="text-[#737373] text-sm mb-6">
                {t('auth.form_desc')}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="password"
                  required
                  autoFocus
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={t('auth.confirm_placeholder')}
                  className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                {error && <p className="text-coral text-sm text-center">{error}</p>}
                <Button variant="primary" className="w-full" disabled={loading}>
                  {loading ? t('auth.save_btn_loading') : t('auth.save_btn')}
                </Button>
              </form>
            </>
          )}

          {/* Success */}
          {stage === 'success' && (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-display text-xl font-semibold mb-2 text-[#1A1A1A]">{t('auth.success_title')}</h2>
              <p className="text-[#737373] text-sm mb-6">
                {t('auth.success_desc')}
              </p>
              <Button variant="primary" className="w-full" onClick={() => router.push(lp('/cadastre/painel'))}>
                {t('auth.success_btn')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
