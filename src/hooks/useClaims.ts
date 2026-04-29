import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClaimRequest } from '@/types/database'

// Submete um pedido de claim (usuário autenticado)
export function useSubmitClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ businessId, profileId, message }: {
      businessId: string
      profileId: string
      message?: string
    }) => {
      const { error } = await supabase
        .from('gostoso_claim_requests')
        .insert([{ business_id: businessId, profile_id: profileId, message: message ?? null }])
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-claim'] })
    },
  })
}

// Status do pedido do usuário atual para um negócio
export function useMyClaimStatus(businessId: string) {
  return useQuery({
    queryKey: ['my-claim', businessId],
    queryFn: async (): Promise<ClaimRequest | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      if (!profile) return null
      const { data } = await supabase
        .from('gostoso_claim_requests')
        .select('*')
        .eq('business_id', businessId)
        .eq('profile_id', (profile as { id: string }).id)
        .maybeSingle()
      return (data as ClaimRequest | null) ?? null
    },
    enabled: !!businessId,
  })
}

// Admin: lista todos os pedidos pendentes com joins
export function useClaimsAdmin() {
  return useQuery({
    queryKey: ['claims-admin'],
    queryFn: async (): Promise<(ClaimRequest & {
      business: { name: string; slug: string }
      profile: { full_name: string | null; email: string | null }
    })[]> => {
      const { data, error } = await supabase
        .from('gostoso_claim_requests')
        .select(`
          *,
          business:gostoso_businesses(name, slug),
          profile:gostoso_profiles(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as (ClaimRequest & {
        business: { name: string; slug: string }
        profile: { full_name: string | null; email: string | null }
      })[]
    },
  })
}

// Admin: aprovar claim — vincula perfil ao negócio + is_verified = true
export function useApproveClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ claimId, businessId, profileId }: {
      claimId: string
      businessId: string
      profileId: string
    }) => {
      const { error: e1 } = await supabase
        .from('gostoso_claim_requests')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', claimId)
      if (e1) throw e1

      const { error: e2 } = await supabase
        .from('gostoso_businesses')
        .update({ profile_id: profileId, is_verified: true })
        .eq('id', businessId)
      if (e2) throw e2

      const { error: e3 } = await supabase
        .from('gostoso_profiles')
        .update({ business_id: businessId })
        .eq('id', profileId)
      if (e3) throw e3

      // Notify the profile owner
      await supabase.from('gostoso_notifications').insert({
        profile_id: profileId,
        type: 'claim_approved',
        title: '🎉 Negócio aprovado!',
        body: 'Seu pedido foi aprovado. Você já pode gerenciar seu perfil.',
        link: '/cadastre/painel',
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims-admin'] })
      qc.invalidateQueries({ queryKey: ['businesses'] })
    },
  })
}

// Admin: rejeitar claim
export function useRejectClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ claimId, adminNote, profileId }: { claimId: string; adminNote?: string; profileId?: string }) => {
      const { error } = await supabase
        .from('gostoso_claim_requests')
        .update({ status: 'rejected', admin_note: adminNote ?? null, resolved_at: new Date().toISOString() })
        .eq('id', claimId)
      if (error) throw error

      if (profileId) {
        await supabase.from('gostoso_notifications').insert({
          profile_id: profileId,
          type: 'claim_rejected',
          title: 'Pedido não aprovado',
          body: adminNote ? `Motivo: ${adminNote}` : 'Seu pedido de reivindicação não foi aprovado desta vez.',
          link: null,
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims-admin'] })
    },
  })
}
