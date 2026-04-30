import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ServiceListing, ServiceCategory } from '@/types/database'

/** Pending services awaiting admin approval — admin only */
export function useAdminPendingServices() {
  return useQuery({
    queryKey: ['services', 'admin', 'pending'],
    queryFn: async (): Promise<ServiceListing[]> => {
      const { data, error } = await supabase
        .from('gostoso_service_listings')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as ServiceListing[]
    },
  })
}

/** Approve or reject a pending service — admin only */
export function useModerateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase
          .from('gostoso_service_listings')
          .update({ is_active: true })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gostoso_service_listings')
          .delete()
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useServices(category?: ServiceCategory) {
  return useQuery({
    queryKey: ['services', category],
    queryFn: async (): Promise<ServiceListing[]> => {
      let q = supabase
        .from('gostoso_service_listings')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
      if (category) q = q.eq('service_category', category)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as ServiceListing[]
    },
  })
}

export interface ServiceFormData {
  name: string
  headline: string
  description: string
  service_category: ServiceCategory
  whatsapp: string
}

export function useSubmitService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: ServiceFormData) => {
      const { error } = await supabase
        .from('gostoso_service_listings')
        .insert({
          ...form,
          photo_url: null,
          is_active: false, // fica pendente até admin aprovar
          is_featured: false,
        })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}
