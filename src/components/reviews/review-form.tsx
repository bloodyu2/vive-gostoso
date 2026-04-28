// src/components/reviews/review-form.tsx
import { useState } from 'react'
import { StarRating } from './star-rating'
import { useSubmitReview } from '@/hooks/useReviews'

interface ReviewFormProps {
  businessId: string
}

export function ReviewForm({ businessId }: ReviewFormProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | 0>(0)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending } = useSubmitReview()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    mutate(
      { business_id: businessId, rating: rating as 1 | 2 | 3 | 4 | 5, comment: comment.trim() || undefined, author_name: authorName.trim() || undefined },
      { onSuccess: () => setSubmitted(true) }
    )
  }

  if (submitted) {
    return (
      <div className="bg-teal-light border border-teal/20 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">🙏</div>
        <p className="font-semibold text-teal">Avaliação enviada!</p>
        <p className="text-sm text-[#737373] mt-1">Ela aparece aqui após aprovação.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-[#1A1A1A]">Deixe sua avaliação</h3>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">Sua nota *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">Comentário (opcional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Conte sua experiência..."
          rows={3}
          maxLength={500}
          className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
        />
        <p className="text-xs text-[#B0A99F] text-right mt-0.5">{comment.length}/500</p>
      </div>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">Seu nome (opcional)</label>
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="Como quer ser identificado?"
          maxLength={80}
          className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
        />
      </div>

      <button
        type="submit"
        disabled={!rating || isPending}
        className="w-full bg-teal text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  )
}
