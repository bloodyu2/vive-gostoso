import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Goal } from '@/types/database'

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from('gostoso_goals')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Goal[]
    },
  })
}
