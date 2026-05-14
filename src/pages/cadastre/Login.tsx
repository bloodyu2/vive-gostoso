import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { Calendar, Camera, BarChart2 } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

type Mode = 'login' | 'register' | 'forgot'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()

  if (authLoading || (user && profileLoading)) return (
    <div className="flex items-center justify-center min-h-screen bg-areia">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (user) {
    if (profile?.role === 'admin') return <Navigate to="/cadastre/admin" replace />
    return <Navigate to="/cadastre/painel" replace />
  }

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
      setError('E-mail ou senha incorretos. Tente de novo.')
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
      navigate(prof?.role === 'admin' ? '/cadastre/admin' : '/cadastre/painel')
    } else {
      navigate('/cadastre/painel')
    }
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      setError('Não foi possível criar a conta. Tente de novo.')
    } else {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/cadastre/resetar-senha`,
    })
    if (authError) {
      setError('Não foi possível enviar o e-mail. Tente de novo.')
    } else {
      setSuccess('E-mail enviado! Verifique sua caixa de entrada.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-sm border border-[#E8E4DF]">
        {/* Teal header */}
        <div className="bg-teal flex flex-col items-center justify-center px-8 py-8">
          <Logo height={36} dark />
          <p className="text-white/80 text-sm mt-2">Para seu negócio crescer</p>
        </div>

        {/* White body */}
        <div className="bg-white p-8">
          {/* Tourist notice */}
          <div className="flex items-start gap-2.5 bg-areia rounded-xl px-4 py-3 mb-6 text-sm text-[#737373]">
            <span className="text-base leading-none mt-0.5 flex-shrink-0">🗺️</span>
            <span>Só explorando Gostoso? Não precisa criar conta — <Link to="/" className="text-teal font-medium hover:underline">navegue à vontade</Link>.</span>
          </div>

          {/* Value props - shown only on login/register, not forgot */}
          {mode !== 'forgot' && (
            <>
              <h1 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">
                {mode === 'login' ? 'Área dos Prestadores' : 'Criar conta'}
              </h1>
              <p className="text-[#737373] text-sm mb-6">
                {mode === 'login'
                  ? 'Gerencie seu perfil e apareça para quem visita Gostoso.'
                  : 'Cadastre seu negócio e apareça no guia da cidade.'}
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                  <Calendar className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <span>Seus horários e contato sempre atualizados</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                  <Camera className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <span>Fotos e descrição do seu negócio</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                  <BarChart2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <span>Visibilidade para turistas e moradores</span>
                </li>
              </ul>
            </>
          )}

          {/* Forgot password */}
          {mode === 'forgot' && (
            <>
              <h1 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">
                Recuperar senha
              </h1>
              <p className="text-[#737373] text-sm mb-6">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>
            </>
          )}

          {/* Success state */}
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <p className="text-[#1A1A1A] text-sm mb-6">{success}</p>
              <Button variant="secondary" className="w-full" onClick={() => { setSuccess(null); switchMode('login') }}>
                Voltar para o login
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
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  {error && <p className="text-coral text-sm text-center">{error}</p>}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[#737373] hover:text-teal transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-teal font-medium hover:underline"
                    >
                      Criar conta
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
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Senha (mínimo 8 caracteres)"
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirmar senha"
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  {error && <p className="text-coral text-sm text-center">{error}</p>}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                  <div className="text-center text-sm mt-1">
                    <span className="text-[#737373]">Já tem conta? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-teal font-medium hover:underline"
                    >
                      Entrar
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
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                  />
                  {error && <p className="text-coral text-sm text-center">{error}</p>}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
                  </Button>
                  <div className="text-center text-sm mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#737373] hover:text-teal transition-colors"
                    >
                      Voltar para o login
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
