import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { JobListing, ContractType } from '@/types/database'
import { useModerateListing } from '@/hooks/useModeration'

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
  return useModerateListing({
    table: 'gostoso_job_listings',
    activeField: 'is_active',
    invalidateKeys: [['jobs'], ['admin-stats']],
    errorMessage: 'Não foi possível moderar a vaga. Tente novamente.',
  })
}

export function useJobs(
  contractType?: ContractType,
  options?: Pick<UseQueryOptions<JobListing[]>, 'initialData'>,
) {
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
    ...options,
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
