import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

type Stage = 'waiting' | 'form' | 'success' | 'invalid'

export default function ResetarSenha() {
  const [stage, setStage] = useState<Stage>('waiting')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Não foi possível atualizar a senha. O link pode ter expirado.')
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
          <p className="text-white/80 text-sm mt-2">Para seu negócio crescer</p>
        </div>

        <div className="bg-white p-8">
          {/* Waiting */}
          {stage === 'waiting' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-4 animate-pulse">🔑</div>
              <p className="text-[#737373] text-sm">Verificando link...</p>
            </div>
          )}

          {/* Invalid / expired link */}
          {stage === 'invalid' && (
            <div className="text-center">
              <div className="text-5xl mb-4">⏱️</div>
              <h2 className="font-display text-xl font-semibold mb-2 text-[#1A1A1A]">Link inválido ou expirado</h2>
              <p className="text-[#737373] text-sm mb-6">
                O link de redefinição já foi usado ou expirou. Solicite um novo.
              </p>
              <Button variant="primary" className="w-full" onClick={() => navigate('/cadastre')}>
                Pedir novo link
              </Button>
            </div>
          )}

          {/* Reset form */}
          {stage === 'form' && (
            <>
              <h1 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">
                Criar nova senha
              </h1>
              <p className="text-[#737373] text-sm mb-6">
                Escolha uma senha segura para sua conta.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="password"
                  required
                  autoFocus
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nova senha (mínimo 8 caracteres)"
                  className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirmar nova senha"
                  className="w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                {error && <p className="text-coral text-sm text-center">{error}</p>}
                <Button variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </>
          )}

          {/* Success */}
          {stage === 'success' && (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-display text-xl font-semibold mb-2 text-[#1A1A1A]">Senha atualizada!</h2>
              <p className="text-[#737373] text-sm mb-6">
                Sua nova senha foi salva. Você já está conectado.
              </p>
              <Button variant="primary" className="w-full" onClick={() => navigate('/cadastre/painel')}>
                Ir para o painel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
