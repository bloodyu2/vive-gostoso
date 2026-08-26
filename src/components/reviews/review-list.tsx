'use client'
// src/components/reviews/review-list.tsx
import { useState } from 'react'
import { StarRating } from './star-rating'
import { useReviews } from '@/hooks/useReviews'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

interface ReviewListProps {
  targetType: 'business' | 'professional' | 'transfer'
  targetId: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function PaginationBar({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm text-[#737373] hover:bg-[#F5F2EE] disabled:opacity-30 transition-colors"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-1.5 text-sm text-[#B0A99F]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`min-w-[32px] px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-teal text-white'
                : 'text-[#737373] hover:bg-[#F5F2EE]'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm text-[#737373] hover:bg-[#F5F2EE] disabled:opacity-30 transition-colors"
      >
        ›
      </button>
    </div>
  )
}

export function ReviewList({ targetType, targetId }: ReviewListProps) {
  const { t } = useTranslation('review_list')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useReviews(targetType, targetId, page)

  const reviews = data?.reviews ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-20" />
      ))}
    </div>
  )

  if (!reviews.length && page === 1) return (
    <p className="text-sm text-[#B0A99F] text-center py-4">
      {t('empty')}
    </p>
  )

  const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-4">
      {page === 1 && reviews.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-3xl text-[#1A1A1A]">{avg.toFixed(1)}</span>
          <div>
            <StarRating value={Math.round(avg)} readonly size="sm" />
            <p className="text-xs text-[#737373] mt-0.5">{total} {t('count', { count: total })}</p>
          </div>
        </div>
      )}

      {reviews.map(r => (
        <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold text-sm text-[#1A1A1A]">{r.author_name ?? t('anonymous')}</p>
              <p className="text-xs text-[#B0A99F]">{formatDate(r.created_at)}</p>
            </div>
            <StarRating value={r.rating} readonly size="sm" />
          </div>
          {r.comment && <p className="text-sm text-[#3D3D3D] leading-relaxed">{r.comment}</p>}
        </div>
      ))}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
      />
    </div>
  )
}
