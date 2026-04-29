import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type RecentBusiness = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  category: { name: string } | null
  is_verified: boolean
}

export function useRecentBusinesses(limit = 4) {
  return useQuery({
    queryKey: ['recent-businesses', limit],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, cover_url, is_verified, category:gostoso_categories(name)')
        .eq('active', true)
        .not('profile_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit)
      if (!data) return []
      return data.map(b => ({
        ...b,
        category: Array.isArray(b.category) ? (b.category[0] ?? null) : b.category,
      })) as RecentBusiness[]
    },
  })
}
