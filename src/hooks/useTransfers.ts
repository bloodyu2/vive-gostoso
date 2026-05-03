import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Transfer } from '@/types/database'

export interface TransferFormData {
  provider_name: string
  whatsapp: string
  vehicle_type: string
  max_passengers: number
  available_hours: string
  languages: string[]
  description: string
}

export function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: async (): Promise<Transfer[]> => {
      const { data, error } = await supabase
        .from('gostoso_transfers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Transfer[]
    },
  })
}

export function useSubmitTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: TransferFormData) => {
      const { error } = await supabase
        .from('gostoso_transfers')
        .insert({
          ...form,
          photo_url: null,
          routes: null,
          active: false,
        })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfers'] }),
  })
}
