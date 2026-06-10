import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review, ReviewInsert, ReviewTarget } from '@/types/reviews'

/** Approved reviews for a target (business/professional/transfer) — public */
export function useReviews(targetType: ReviewTarget, targetId: string) {
  const idField = targetType === 'business' ? 'business_id' : targetType === 'professional' ? 'professional_id' : 'transfer_id'
  return useQuery({
    queryKey: ['reviews', targetType, targetId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from('gostoso_reviews')
        .select('*')
        .eq(idField, targetId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
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

      return ((data ?? []) as any[]).map(r => ({
        ...r,
        target_name: r.business?.name || r.professional?.display_name || r.transfer?.provider_name || 'Desconhecido',
        target_type: r.business_id ? 'business' : r.professional_id ? 'professional' : 'transfer',
      }))
    },
  })
}

export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase
          .from('gostoso_reviews')
          .update({ approved: true })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gostoso_reviews')
          .delete()
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      // Invalidate all review caches: admin pending + all public business/professional/transfer caches.
      // Without this, after approving a review the business profile page keeps showing the stale
      // empty array (cached before approval) until staleTime expires.
      qc.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
