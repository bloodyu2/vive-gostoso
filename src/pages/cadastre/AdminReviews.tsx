import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { StarRating } from '@/components/reviews/star-rating'
import { useAdminPendingReviews, useModerateReview } from '@/hooks/useReviews'

export default function AdminReviews() {
  return <AuthGuard><AdminReviewsInner /></AuthGuard>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function AdminReviewsInner() {
  const { data: reviews = [], isLoading } = useAdminPendingReviews()
  const { mutate: moderate, isPending } = useModerateReview()

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link to="/cadastre/painel" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
      </Link>

      <h1 className="font-display text-3xl font-semibold mb-2">Avaliações Pendentes</h1>
      <p className="text-sm text-[#737373] mb-8">Aprove ou rejeite avaliações antes de publicar.</p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-24" />)}
        </div>
      )}

      {!isLoading && !reviews.length && (
        <div className="text-center py-16 text-[#B0A99F]">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold">Nenhuma avaliação pendente</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{r.author_name ?? 'Anônimo'}</p>
                <p className="text-xs text-[#B0A99F]">{r.business_name} · {formatDate(r.created_at)}</p>
              </div>
              <StarRating value={r.rating} readonly size="sm" />
            </div>
            {r.comment && <p className="text-sm text-[#3D3D3D] leading-relaxed mt-2 mb-4">{r.comment}</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => moderate({ id: r.id, approve: true })}
                disabled={isPending}
                className="flex-1 bg-teal text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                onClick={() => moderate({ id: r.id, approve: false })}
                disabled={isPending}
                className="flex-1 bg-[#F5F2EE] text-[#737373] rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#E8E4DF] transition-colors disabled:opacity-50"
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
