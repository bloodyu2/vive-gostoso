import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SiteStats {
  /** Negócios ativos, verificados ou não. */
  businesses: number
  /** Só os que passaram pelo critério do selo. NUNCA use `businesses` numa
   *  frase que diga "verificados": ate 2026-09-07 a home dizia "+182 negocios
   *  verificados" porque a contagem nao filtrava `is_verified`, e verificados
   *  eram 67. */
  verified: number
  accommodations: number
  events: number
  categories: number
}

export function useStats(options?: Pick<UseQueryOptions<SiteStats>, 'initialData'>) {
  return useQuery({
    queryKey: ['stats'],
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<SiteStats> => {
      const { data: fiqueCats } = await supabase
        .from('gostoso_categories')
        .select('id')
        .eq('verb', 'fique')
      const fiqueCatIds = ((fiqueCats ?? []) as { id: string }[]).map(c => c.id)

      const [bizRes, verRes, accRes, evtRes, catRes] = await Promise.all([
        supabase
          .from('gostoso_businesses')
          .select('id', { count: 'exact', head: true })
          .eq('active', true),
        supabase
          .from('gostoso_businesses')
          .select('id', { count: 'exact', head: true })
          .eq('active', true)
          .eq('is_verified', true),
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
        supabase
          .from('gostoso_categories')
          .select('id', { count: 'exact', head: true }),
      ])

      return {
        businesses: bizRes.count ?? 0,
        verified: verRes.count ?? 0,
        accommodations: accRes.count ?? 0,
        events: evtRes.count ?? 0,
        categories: catRes.count ?? 0,
      }
    },
    ...options,
  })
}
