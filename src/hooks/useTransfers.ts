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
  advance_notice: string
  payment_methods: string[]
  meeting_point: string
  observations: string
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

export function useAdminTransfers() {
  return useQuery({
    queryKey: ['transfers', 'admin'],
    queryFn: async (): Promise<Transfer[]> => {
      const { data, error } = await supabase
        .from('gostoso_transfers')
        .select('*')
        .order('active', { ascending: true })
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Transfer[]
    },
  })
}

export function useModerateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'deactivate' }) => {
      if (action === 'reject') {
        const { error } = await supabase.from('gostoso_transfers').delete().eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gostoso_transfers')
          .update({ active: action === 'approve' })
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
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
          provider_name: form.provider_name,
          whatsapp: form.whatsapp,
          vehicle_type: form.vehicle_type,
          max_passengers: form.max_passengers,
          available_hours: form.available_hours,
          languages: form.languages,
          description: form.description,
          advance_notice: form.advance_notice || null,
          payment_methods: form.payment_methods.length > 0 ? form.payment_methods : null,
          meeting_point: form.meeting_point || null,
          observations: form.observations || null,
          photo_url: null,
          routes: null,
          active: false,
        })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfers'] }),
  })
}
