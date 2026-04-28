// src/components/reviews/review-list.tsx
import { StarRating } from './star-rating'
import { useReviews } from '@/hooks/useReviews'

interface ReviewListProps {
  businessId: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ReviewList({ businessId }: ReviewListProps) {
  const { data: reviews = [], isLoading } = useReviews(businessId)

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-20" />
      ))}
    </div>
  )

  if (!reviews.length) return (
    <p className="text-sm text-[#B0A99F] text-center py-4">
      Nenhuma avaliação ainda. Seja o primeiro a avaliar!
    </p>
  )

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-3xl text-[#1A1A1A]">{avg.toFixed(1)}</span>
        <div>
          <StarRating value={Math.round(avg)} readonly size="sm" />
          <p className="text-xs text-[#737373] mt-0.5">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</p>
        </div>
      </div>

      {reviews.map(r => (
        <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold text-sm text-[#1A1A1A]">{r.author_name ?? 'Visitante'}</p>
              <p className="text-xs text-[#B0A99F]">{formatDate(r.created_at)}</p>
            </div>
            <StarRating value={r.rating} readonly size="sm" />
          </div>
          {r.comment && <p className="text-sm text-[#3D3D3D] leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  )
}
