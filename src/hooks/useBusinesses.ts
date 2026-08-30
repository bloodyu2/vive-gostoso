import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Business, Category } from '@/types/database'
import { PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY } from '@/lib/supabase/business-columns'

export function useBusinesses(
  verb?: 'come' | 'fique' | 'passeie' | 'resolva',
  options?: Pick<UseQueryOptions<Business[]>, 'initialData'>,
) {
  return useQuery({
    queryKey: ['businesses', verb],
    queryFn: async (): Promise<Business[]> => {
      if (verb) {
        const { data: cats, error: catsError } = await supabase
          .from('gostoso_categories')
          .select('id')
          .eq('verb', verb)
        if (catsError) throw catsError
        const catIds = ((cats ?? []) as { id: string }[]).map(c => c.id)
        if (!catIds.length) return []

        const { data, error } = await supabase
          .from('gostoso_businesses')
          .select(PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY)
          .eq('active', true)
          .eq('is_published', true)
          .in('category_id', catIds)
          .order('is_featured', { ascending: false })
          .order('display_order')
        if (error) throw error
        return (data ?? []) as unknown as Business[]
      }

      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select(PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY)
        .eq('active', true)
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('display_order')
      if (error) throw error
      return (data ?? []) as unknown as Business[]
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
        .select(PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY)
        .eq('slug', slug)
        .eq('active', true)
        .eq('is_published', true)
        .single()
      if (error) return null
      return data as unknown as Business
    },
    ...options,
  })
}

// Silence unused import warning
export type { Category }
