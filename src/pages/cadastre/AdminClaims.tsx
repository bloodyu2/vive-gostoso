import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useClaimsAdmin, useApproveClaim, useRejectClaim } from '@/hooks/useClaims'
import { Button } from '@/components/ui/button'

export default function AdminClaims() {
  return <AuthGuard><AdminClaimsInner /></AuthGuard>
}

function AdminClaimsInner() {
  const { data: claims = [], isLoading } = useClaimsAdmin()
  const approve = useApproveClaim()
  const reject = useRejectClaim()
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})

  if (isLoading) return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#E8E4DF] rounded-2xl" />)}
      </div>
    </main>
  )

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cadastre/painel" className="text-sm text-[#737373] hover:text-teal transition-colors">
          ← Painel
        </Link>
        <h1 className="font-display text-3xl font-semibold">Pedidos de Reivindicação</h1>
        {claims.length > 0 && (
          <span className="ml-auto bg-coral text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {claims.length} pendente{claims.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-[#737373]">Nenhum pedido pendente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A1A] truncate">{claim.business.name}</p>
                  <p className="text-sm text-teal font-medium">
                    {claim.profile.email ?? '—'}{' '}
                    {claim.profile.full_name && (
                      <span className="text-[#737373]">({claim.profile.full_name})</span>
                    )}
                  </p>
                  {claim.message && (
                    <p className="text-sm text-[#3D3D3D] mt-2 italic">"{claim.message}"</p>
                  )}
                  <p className="text-xs text-[#737373] mt-2">
                    Solicitado em{' '}
                    {new Date(claim.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end sm:min-w-[200px]">
                  <Link
                    to={`/negocio/${claim.business.slug}`}
                    target="_blank"
                    className="text-xs text-[#737373] underline hover:text-teal transition-colors"
                  >
                    Ver negócio ↗
                  </Link>
                  <Button
                    variant="primary"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate({
                      claimId: claim.id,
                      businessId: claim.business_id,
                      profileId: claim.profile_id,
                    })}
                  >
                    Aprovar
                  </Button>
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Nota (opcional)"
                      value={rejectNote[claim.id] ?? ''}
                      onChange={e => setRejectNote(n => ({ ...n, [claim.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E8E4DF] text-xs focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 min-w-0"
                    />
                    <Button
                      variant="ghost"
                      disabled={reject.isPending}
                      onClick={() => reject.mutate({
                        claimId: claim.id,
                        adminNote: rejectNote[claim.id],
                      })}
                      className="text-coral hover:text-coral flex-shrink-0"
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
