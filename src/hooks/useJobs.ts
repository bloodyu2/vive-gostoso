import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { JobListing, ContractType } from '@/types/database'

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
