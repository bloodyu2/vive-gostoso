import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SiteStats {
  businesses: number
  accommodations: number
  events: number
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<SiteStats> => {
      const { data: fiqueCats } = await supabase
        .from('gostoso_categories')
        .select('id')
        .eq('verb', 'fique')
      const fiqueCatIds = ((fiqueCats ?? []) as { id: string }[]).map(c => c.id)

      const [bizRes, accRes, evtRes] = await Promise.all([
        supabase
          .from('gostoso_businesses')
          .select('id', { count: 'exact', head: true })
          .eq('active', true),
        fiqueCatIds.length
          ? supabase
              .from('gostoso_businesses')
              .select('id', { count: 'exact', head: true })
              .eq('active', true)
              .in('category_id', fiqueCatIds)
          : Promise.resolve({ count: 0 }),
        supabase
          .from('gostoso_events')
          .select('id', { count: 'exact', head: true }),
      ])

      return {
        businesses: bizRes.count ?? 0,
        accommodations: accRes.count ?? 0,
        events: evtRes.count ?? 0,
      }
    },
  })
}
