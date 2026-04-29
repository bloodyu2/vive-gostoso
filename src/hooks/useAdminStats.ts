import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface AdminStats {
  pendingReviews: number
  pendingClaims: number
  pendingServices: number
  pendingJobs: number
  totalBusinesses: number
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<AdminStats> => {
      const [
        reviewsResult,
        claimsResult,
        servicesResult,
        jobsResult,
        businessesResult,
      ] = await Promise.all([
        supabase
          .from('gostoso_reviews')
          .select('id', { count: 'exact', head: true })
          .eq('approved', false),
        supabase
          .from('gostoso_claim_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('gostoso_service_listings')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', false),
        supabase
          .from('gostoso_job_listings')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', false),
        supabase
          .from('gostoso_businesses')
          .select('id', { count: 'exact', head: true }),
      ])

      if (reviewsResult.error) throw reviewsResult.error
      if (claimsResult.error) throw claimsResult.error
      if (servicesResult.error) throw servicesResult.error
      if (jobsResult.error) throw jobsResult.error
      if (businessesResult.error) throw businessesResult.error

      return {
        pendingReviews: reviewsResult.count ?? 0,
        pendingClaims: claimsResult.count ?? 0,
        pendingServices: servicesResult.count ?? 0,
        pendingJobs: jobsResult.count ?? 0,
        totalBusinesses: businessesResult.count ?? 0,
      }
    },
  })
}
