import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { GostosoEvent } from '@/types/database'

export function useEvents(featured?: boolean) {
  return useQuery({
    queryKey: ['events', featured],
    queryFn: async (): Promise<GostosoEvent[]> => {
      let q = supabase
        .from('gostoso_events')
        .select('*')
        .eq('active', true)
        .order('starts_at')
      if (featured) q = q.eq('is_featured', true)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_events')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data as GostosoEvent | null
    },
  })
}
