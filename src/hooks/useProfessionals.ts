// src/hooks/useProfessionals.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Professional, ProfessionalCategory } from '@/types/professional'
import { generateSlug } from '@/types/professional'

// ── Public queries ────────────────────────────────────────────────────────

/** List all published professionals, optionally filtered by category. */
export function useProfessionals(category?: ProfessionalCategory | 'all') {
  return useQuery<Professional[]>({
    queryKey: ['professionals', category ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('gostoso_professionals')
        .select('*')
        .eq('is_published', true)
        .order('rating_avg', { ascending: false })
        .order('created_at', { ascending: false })
      if (category && category !== 'all') {
        q = q.eq('category', category)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Professional[]
    },
  })
}

/** Get a single published professional by slug. */
export function useProfessional(slug: string) {
  return useQuery<Professional | null>({
    queryKey: ['professional', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_professionals')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()
      if (error) throw error
      return data as Professional | null
    },
  })
}

// ── Owner queries (authenticated) ─────────────────────────────────────────

/** Get the current user's professional profile (published or draft). */
export function useMyProfessional() {
  return useQuery<Professional | null>({
    queryKey: ['my-professional'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      if (!profile) return null
      const { data, error } = await supabase
        .from('gostoso_professionals')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle()
      if (error) throw error
      return data as Professional | null
    },
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────

export type ProfessionalUpsert = {
  display_name: string
  headline: string
  bio?: string
  photo_url?: string
  category: ProfessionalCategory
  specialties: string[]
  portfolio_items?: Professional['portfolio_items']
  whatsapp?: string
  instagram?: string
  website?: string
  hourly_rate?: number | null
  is_published?: boolean
}

/** Create or update the current user's professional profile. */
export function useUpsertProfessional() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProfessionalUpsert) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      if (!profile) throw new Error('Profile not found')

      // Check if record exists
      const { data: existing } = await supabase
        .from('gostoso_professionals')
        .select('id, slug')
        .eq('profile_id', profile.id)
        .maybeSingle()

      const slug = existing?.slug ?? generateSlug(input.display_name)

      if (existing) {
        const { data, error } = await supabase
          .from('gostoso_professionals')
          .update({ ...input, slug })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data as Professional
      } else {
        const { data, error } = await supabase
          .from('gostoso_professionals')
          .insert({ ...input, profile_id: profile.id, slug })
          .select()
          .single()
        if (error) throw error
        return data as Professional
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-professional'] })
      qc.invalidateQueries({ queryKey: ['professionals'] })
    },
  })
}

// ── Admin queries ─────────────────────────────────────────────────────────

/** Admin: list ALL professionals (published and draft). */
export function useAdminProfessionals() {
  return useQuery<Professional[]>({
    queryKey: ['admin-professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_professionals')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Professional[]
    },
  })
}

/** Admin: toggle is_published for a professional. */
export function useToggleProfessionalPublished() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from('gostoso_professionals')
        .update({ is_published })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-professionals'] })
      qc.invalidateQueries({ queryKey: ['professionals'] })
    },
  })
}

/** Admin: delete a professional. */
export function useDeleteProfessional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gostoso_professionals')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-professionals'] })
      qc.invalidateQueries({ queryKey: ['professionals'] })
    },
  })
}
