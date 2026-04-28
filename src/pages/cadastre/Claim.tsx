import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusinesses'
import { useSubmitClaim, useMyClaimStatus } from '@/hooks/useClaims'

export default function Claim() {
  const { slug } = useParams<{ slug: string }>()
  const { data: business } = useBusiness(slug ?? '')
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [mailLoading, setMailLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const submitClaim = useSubmitClaim()
  const { data: existingClaim } = useMyClaimStatus(business?.id ?? '')

  // Após retorno do magic link (usuário autenticado), criar perfil se necessário e submeter claim
  useEffect(() => {
    if (!user || !business || claimed || existingClaim) return
    ;(async () => {
      // Garantir que o perfil existe
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

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
      setClaimed(true)
    })()
  }, [user, business])

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    if (!business) return
    setMailLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/cadastre/claim/${slug}`,
      },
    })
    if (!error) setSent(true)
    setMailLoading(false)
  }

  if (!business) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <p className="text-[#737373] text-sm">Carregando...</p>
    </div>
  )

  // Negócio já tem dono
  if (business.profile_id) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Perfil já reivindicado</h2>
        <p className="text-[#737373] text-sm mb-6">
          <strong>{business.name}</strong> já tem um dono cadastrado na plataforma.
        </p>
        <Link to={`/negocio/${business.slug}`} className="text-teal text-sm font-semibold">
          ← Ver o negócio
        </Link>
      </div>
    </div>
  )

  // Pedido pendente (já enviado)
  if (claimed || existingClaim?.status === 'pending') return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Pedido enviado!</h2>
        <p className="text-[#737373] text-sm mb-6">
          Recebemos seu pedido para reivindicar <strong>{business.name}</strong>.
          Nossa equipe vai analisar em até 48 horas e você receberá uma confirmação por e-mail.
        </p>
        <Link to={`/negocio/${business.slug}`} className="text-teal text-sm font-semibold">
          ← Voltar ao negócio
        </Link>
      </div>
    </div>
  )

  if (existingClaim?.status === 'approved') return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Já aprovado!</h2>
        <p className="text-[#737373] text-sm mb-6">
          Seu perfil está vinculado a <strong>{business.name}</strong>.
        </p>
        <Link to="/cadastre/painel" className="text-teal text-sm font-semibold">
          Ir para o painel →
        </Link>
      </div>
    </div>
  )

  // Link enviado, aguardando clique no e-mail
  if (sent) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Verifique seu e-mail</h2>
        <p className="text-[#737373] text-sm">
          Enviamos um link para <strong>{email}</strong>.
          Clique nele para confirmar e enviar o pedido de reivindicação.
        </p>
      </div>
    </div>
  )

  // Formulário principal
  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md shadow-sm">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <h1 className="font-display text-2xl font-semibold mb-1 text-center">
          Reivindicar negócio
        </h1>
        <p className="text-[#737373] text-sm text-center mb-2">
          Você está reivindicando
        </p>
        <p className="text-center font-semibold text-[#1A1A1A] mb-8">{business.name}</p>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Seu e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Mensagem para a equipe <span className="text-[#737373] font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ex: Sou o proprietário desde 2019, posso enviar documentação..."
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 resize-none"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={mailLoading || authLoading}>
            {mailLoading ? 'Enviando...' : 'Continuar com link mágico'}
          </Button>
        </form>

        <p className="text-xs text-[#737373] text-center mt-5 leading-relaxed">
          Você receberá um link por e-mail. Ao clicar, confirmamos sua identidade e enviamos o pedido para análise.
        </p>
      </div>
    </div>
  )
}
