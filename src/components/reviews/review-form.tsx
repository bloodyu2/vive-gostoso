'use client'
// src/components/reviews/review-form.tsx
import { useState } from 'react'
import { StarRating } from './star-rating'
import { useSubmitReview } from '@/hooks/useReviews'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'

interface ReviewFormProps {
  targetType: 'business' | 'professional' | 'transfer'
  targetId: string
}

export function ReviewForm({ targetType, targetId }: ReviewFormProps) {
  const { t } = useTranslation('review_form')
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | 0>(0)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const { mutate, isPending } = useSubmitReview()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    setSubmitError(false)
    const payload: any = { rating: rating as 1 | 2 | 3 | 4 | 5, comment: comment.trim() || undefined, author_name: authorName.trim() || undefined }
    if (targetType === 'business') payload.business_id = targetId
    else if (targetType === 'professional') payload.professional_id = targetId
    else payload.transfer_id = targetId
    mutate(payload, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitError(true),
    })
  }

  if (submitted) {
    return (
      <div className="bg-teal-light border border-teal/20 rounded-2xl p-6 text-center">
        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-teal" />
        <p className="font-semibold text-teal">{t('success_title')}</p>
        <p className="text-sm text-[#737373] mt-1">{t('success_desc')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-[#1A1A1A]">{t('title')}</h3>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">{t('label_rating')}</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">{t('label_comment')}</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={t('placeholder_comment')}
          rows={3}
          maxLength={500}
          className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
        />
        <p className="text-xs text-[#B0A99F] text-right mt-0.5">{comment.length}/500</p>
      </div>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">{t('label_name')}</label>
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder={t('placeholder_name')}
          maxLength={80}
          className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
        />
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-xl px-4 py-2.5">
          {t('common.erro_desc', { ns: 'translation', defaultValue: 'Nao conseguimos enviar. Verifique sua conexao e tente de novo.' })}
        </p>
      )}

      <button
        type="submit"
        disabled={!rating || isPending}
        className="w-full bg-teal text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
