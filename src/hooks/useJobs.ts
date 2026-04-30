import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { JobListing, ContractType } from '@/types/database'

/** Pending job listings awaiting admin approval — admin only */
export function useAdminPendingJobs() {
  return useQuery({
    queryKey: ['jobs', 'admin', 'pending'],
    queryFn: async (): Promise<JobListing[]> => {
      const { data, error } = await supabase
        .from('gostoso_job_listings')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as JobListing[]
    },
  })
}

/** Approve or reject a pending job listing — admin only */
export function useModerateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase
          .from('gostoso_job_listings')
          .update({ is_active: true })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gostoso_job_listings')
          .delete()
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useJobs(contractType?: ContractType) {
  return useQuery({
    queryKey: ['jobs', contractType],
    queryFn: async (): Promise<JobListing[]> => {
      let q = supabase
        .from('gostoso_job_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (contractType) q = q.eq('contract_type', contractType)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as JobListing[]
    },
  })
}

export interface JobFormData {
  business_name: string
  title: string
  description: string
  contract_type: ContractType
  whatsapp: string
}

export function useSubmitJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: JobFormData) => {
      const { error } = await supabase
        .from('gostoso_job_listings')
        .insert({
          ...form,
          business_id: null,
          is_active: false, // pendente até admin aprovar
        })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}
