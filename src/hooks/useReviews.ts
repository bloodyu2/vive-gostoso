import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review, ReviewInsert, ReviewTarget } from '@/types/reviews'
import { useModerateListing } from '@/hooks/useModeration'

const PAGE_SIZE = 10

export interface ReviewPage {
  reviews: Review[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Approved reviews for a target (business/professional/transfer) — paginated, public */
export function useReviews(targetType: ReviewTarget, targetId: string, page = 1) {
  const idField = targetType === 'business' ? 'business_id' : targetType === 'professional' ? 'professional_id' : 'transfer_id'
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  return useQuery({
    queryKey: ['reviews', targetType, targetId, page],
    queryFn: async (): Promise<ReviewPage> => {
      const { data, error, count } = await supabase
        .from('gostoso_reviews')
        .select('*', { count: 'exact' })
        .eq(idField, targetId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      const total = count ?? 0
      return {
        reviews: (data ?? []) as Review[],
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      }
    },
    enabled: !!targetId,
  })
}

/** Aggregated ratings for ALL businesses in one query (view gostoso_business_ratings).
 *  Every BusinessCard calls this hook with the same queryKey, so TanStack Query
 *  dedupes it into a single shared fetch -- no N+1. Key starts with 'reviews' so
 *  useModerateReview's broad invalidation refreshes card stars too. */
export function useBusinessRatings() {
  return useQuery({
    queryKey: ['reviews', 'ratings', 'business'],
    queryFn: async (): Promise<Map<string, { avg: number; count: number }>> => {
      const { data, error } = await supabase
        .from('gostoso_business_ratings')
        .select('*')
      if (error) throw error
      const map = new Map<string, { avg: number; count: number }>()
      for (const row of (data ?? []) as { business_id: string; avg_rating: string | number; review_count: number }[]) {
        map.set(row.business_id, { avg: Number(row.avg_rating), count: row.review_count })
      }
      return map
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** Aggregated ratings for ALL transfers in one query (view gostoso_transfer_ratings). */
export function useTransferRatings() {
  return useQuery({
    queryKey: ['reviews', 'ratings', 'transfer'],
    queryFn: async (): Promise<Map<string, { avg: number; count: number }>> => {
      const { data, error } = await supabase
        .from('gostoso_transfer_ratings')
        .select('*')
      if (error) throw error
      const map = new Map<string, { avg: number; count: number }>()
      for (const row of (data ?? []) as { transfer_id: string; avg_rating: string | number; review_count: number }[]) {
        map.set(row.transfer_id, { avg: Number(row.avg_rating), count: row.review_count })
      }
      return map
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (review: ReviewInsert) => {
      const { error } = await supabase
        .from('gostoso_reviews')
        .insert({ ...review, approved: false })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      const targetType: ReviewTarget = variables.business_id ? 'business' : variables.professional_id ? 'professional' : 'transfer'
      const targetId = variables.business_id ?? variables.professional_id ?? variables.transfer_id ?? ''
      qc.invalidateQueries({ queryKey: ['reviews', targetType, targetId] })
    },
  })
}

type PendingReviewRow = Review & {
  business: { name: string } | null
  professional: { display_name: string } | null
  transfer: { provider_name: string } | null
}

export function useAdminPendingReviews() {
  return useQuery({
    queryKey: ['reviews', 'admin', 'pending'],
    queryFn: async (): Promise<(Review & { target_name?: string; target_type?: string })[]> => {
      const { data, error } = await supabase
        .from('gostoso_reviews')
        .select('*, business:gostoso_businesses(name), professional:gostoso_professionals(display_name), transfer:gostoso_transfers(provider_name)')
        .eq('approved', false)
        .order('created_at', { ascending: true })
      if (error) throw error

      return ((data ?? []) as PendingReviewRow[]).map(r => ({
        ...r,
        target_name: r.business?.name || r.professional?.display_name || r.transfer?.provider_name || 'Desconhecido',
        target_type: r.business_id ? 'business' : r.professional_id ? 'professional' : 'transfer',
      }))
    },
  })
}

export function useModerateReview() {
  // Invalidates all review caches: admin pending + all public business/professional/transfer caches.
  return useModerateListing({
    table: 'gostoso_reviews',
    activeField: 'approved',
    invalidateKeys: [['reviews']],
    errorMessage: 'Não foi possível moderar a avaliação. Tente novamente.',
  })
}

/** Aggregated ratings for ALL professionals in one query (view gostoso_professional_ratings). */
export function useProfessionalRatings() {
  return useQuery({
    queryKey: ['reviews', 'ratings', 'professional'],
    queryFn: async (): Promise<Map<string, { avg: number; count: number }>> => {
      const { data, error } = await supabase
        .from('gostoso_professional_ratings')
        .select('*')
      if (error) throw error
      const map = new Map<string, { avg: number; count: number }>()
      for (const row of (data ?? []) as { professional_id: string; avg_rating: string | number; review_count: number }[]) {
        map.set(row.professional_id, { avg: Number(row.avg_rating), count: row.review_count })
      }
      return map
    },
    staleTime: 5 * 60 * 1000,
  })
}
