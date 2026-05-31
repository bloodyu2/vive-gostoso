'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import i18n from '@/i18n'
import { AdminGuard } from '@/components/auth/admin-guard'
import { StarRating } from '@/components/reviews/star-rating'
import { useAdminPendingReviews, useModerateReview } from '@/hooks/useReviews'

export default function AdminReviews() {
  return <AdminGuard><AdminReviewsInner /></AdminGuard>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function AdminReviewsInner() {
  const { t } = useTranslation('admin_reviews')
  const lp = useLocalePath()
  const { data: reviews = [], isLoading } = useAdminPendingReviews()
  const { mutate: moderate, isPending } = useModerateReview()

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link href={lp('/cadastre/admin')} className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('back_to_admin')}
      </Link>

      <h1 className="font-display text-3xl font-semibold mb-2">{t('title')}</h1>
      <p className="text-sm text-[#737373] mb-8">{t('subtitle')}</p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-24" />)}
        </div>
      )}

      {!isLoading && !reviews.length && (
        <div className="text-center py-16 text-[#B0A99F]">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold">{t('empty_state')}</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{r.author_name ?? t('anonymous')}</p>
                <p className="text-xs text-[#B0A99F]">
                  {r.target_name}
                  <span className="mx-1">·</span>
                  {r.target_type === 'business' ? t('type_business') :
                   r.target_type === 'professional' ? t('type_professional') :
                   t('type_transfer')}
                  <span className="mx-1">·</span>
                  {formatDate(r.created_at)}
                </p>
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
                {t('approve')}
              </button>
              <button
                onClick={() => moderate({ id: r.id, approve: false })}
                disabled={isPending}
                className="flex-1 bg-[#F5F2EE] text-[#737373] rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#E8E4DF] transition-colors disabled:opacity-50"
              >
                {t('reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
