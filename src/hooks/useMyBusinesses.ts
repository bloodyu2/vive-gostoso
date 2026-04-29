import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'

export interface BusinessSummary {
  id: string
  name: string
  slug: string
  cover_url: string | null
  active: boolean
  is_published: boolean
  plan: 'free' | 'associado' | 'destaque'
  category: { name: string } | null
}

export function useMyBusinesses() {
  const { data: profile } = useProfile()

  return useQuery<BusinessSummary[]>({
    queryKey: ['my-businesses', profile?.id],
    enabled: !!profile?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, cover_url, active, is_published, plan, category:gostoso_categories(name)')
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map(b => ({
        ...b,
        category: Array.isArray(b.category) ? (b.category[0] ?? null) : b.category,
      })) as unknown as BusinessSummary[]
    },
  })
}

export function useInvalidateMyBusinesses() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['my-businesses'] })
}
