import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review, ReviewInsert } from '@/types/reviews'

/** Approved reviews for a business — public */
export function useReviews(businessId: string) {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from('gostoso_reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
    },
    enabled: !!businessId,
  })
}

/** Submit a new review — inserts with approved=false */
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
      qc.invalidateQueries({ queryKey: ['reviews', variables.business_id] })
    },
  })
}

/** All pending reviews — admin only (relies on admin_full_access RLS policy) */
export function useAdminPendingReviews() {
  return useQuery({
    queryKey: ['reviews', 'admin', 'pending'],
    queryFn: async (): Promise<(Review & { business_name?: string })[]> => {
      const { data, error } = await supabase
        .from('gostoso_reviews')
        .select('*, business:gostoso_businesses(name)')
        .eq('approved', false)
        .order('created_at', { ascending: true })
      if (error) throw error
      return ((data ?? []) as unknown as (Review & { business: { name: string } })[]).map(r => ({
        ...r,
        business_name: r.business?.name,
      }))
    },
  })
}

/** Approve or reject a review — admin only */
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
      qc.invalidateQueries({ queryKey: ['reviews', 'admin', 'pending'] })
    },
  })
}
