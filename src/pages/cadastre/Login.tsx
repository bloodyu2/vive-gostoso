import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user) { navigate('/cadastre/painel'); return null }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/cadastre/painel` },
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md shadow-sm">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="font-display text-2xl font-semibold mb-2">Verifique seu e-mail</h2>
            <p className="text-[#737373] text-sm">
              Enviamos um link de acesso para <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold mb-1 text-center">Área dos Prestadores</h1>
            <p className="text-[#737373] text-sm text-center mb-8">
              Entre com seu e-mail para acessar o painel.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
              <Button variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Entrar com link mágico'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
