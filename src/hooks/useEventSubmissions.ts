import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { EventSubmission } from '@/types/database'

// Public: submit a new event
export function useSubmitEvent() {
  return useMutation({
    mutationFn: async (payload: {
      name: string
      description?: string
      starts_at: string
      ends_at?: string
      location?: string
      cover_url?: string
      event_type?: EventSubmission['event_type']
      source_url?: string
      submitter_name: string
      submitter_email: string
      submitter_phone?: string
    }) => {
      const { error } = await supabase
        .from('gostoso_event_submissions')
        .insert([{ ...payload, is_approved: false }])
      if (error) throw error
    },
  })
}

// Admin: list pending submissions (not yet reviewed — is_approved=false AND reviewed_at IS NULL)
export function usePendingEventSubmissions() {
  return useQuery<EventSubmission[]>({
    queryKey: ['admin-event-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_event_submissions')
        .select('*')
        .eq('is_approved', false)
        .is('reviewed_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as EventSubmission[]
    },
  })
}

// Admin: approve a submission (copies to gostoso_events, marks approved)
export function useApproveEventSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sub: EventSubmission) => {
      // Insert into approved events
      const { error: evErr } = await supabase
        .from('gostoso_events')
        .insert([{
          name: sub.name,
          description: sub.description,
          starts_at: sub.starts_at,
          ends_at: sub.ends_at,
          location: sub.location,
          cover_url: sub.cover_url,
          event_type: sub.event_type,
          source_url: sub.source_url,
          is_featured: false,
          active: true,
        }])
      if (evErr) throw evErr
      // Mark submission as approved
      const { error } = await supabase
        .from('gostoso_event_submissions')
        .update({ is_approved: true, reviewed_at: new Date().toISOString() })
        .eq('id', sub.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-event-submissions'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Admin: reject a submission (is_approved stays false; reviewed_at marks it as processed)
export function useRejectEventSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { error } = await supabase
        .from('gostoso_event_submissions')
        .update({
          is_approved: false,
          admin_note: note ?? 'Rejeitado',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-event-submissions'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}
