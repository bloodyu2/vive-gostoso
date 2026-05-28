import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Business, Category } from '@/types/database'

export function useBusinesses(
  verb?: 'come' | 'fique' | 'passeie' | 'resolva',
  options?: Pick<UseQueryOptions<Business[]>, 'initialData'>,
) {
  return useQuery({
    queryKey: ['businesses', verb],
    queryFn: async (): Promise<Business[]> => {
      if (verb) {
        const { data: cats } = await supabase
          .from('gostoso_categories')
          .select('id')
          .eq('verb', verb)
        const catIds = ((cats ?? []) as { id: string }[]).map(c => c.id)
        if (!catIds.length) return []

        const { data, error } = await supabase
          .from('gostoso_businesses')
          .select('*, category:gostoso_categories(*)')
          .eq('active', true)
          .eq('is_published', true)
          .in('category_id', catIds)
          .order('is_featured', { ascending: false })
          .order('display_order')
        if (error) throw error
        return (data ?? []) as Business[]
      }

      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select('*, category:gostoso_categories(*)')
        .eq('active', true)
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('display_order')
      if (error) throw error
      return (data ?? []) as Business[]
    },
    ...options,
  })
}

export function useBusiness(
  slug: string,
  options?: Pick<UseQueryOptions<Business | null>, 'initialData'>,
) {
  return useQuery({
    queryKey: ['business', slug],
    enabled: !!slug,
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select('*, category:gostoso_categories(*)')
        .eq('slug', slug)
        .eq('active', true)
        .eq('is_published', true)
        .single()
      if (error) return null
      return data as Business
    },
    ...options,
  })
}

export function useAllBusinessesWithCoords() {
  return useQuery({
    queryKey: ['businesses-map'],
    queryFn: async (): Promise<Business[]> => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select('*, category:gostoso_categories(*)')
        .eq('active', true)
        .eq('is_published', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
      if (error) throw error
      return (data ?? []) as Business[]
    },
  })
}

// Silence unused import warning
export type { Category }
