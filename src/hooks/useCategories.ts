import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

export function useCategories(verb?: string) {
  return useQuery({
    queryKey: ['categories', verb],
    queryFn: async (): Promise<Category[]> => {
      let q = supabase.from('gostoso_categories').select('*').eq('active', true).order('display_order')
      if (verb) q = q.eq('verb', verb)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
  })
}
