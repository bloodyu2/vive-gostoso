import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useProfile } from './useProfile'

export type AppNotification = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export function useNotifications() {
  const { data: profile } = useProfile()
  return useQuery({
    queryKey: ['notifications', profile?.id],
    enabled: !!profile?.id,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('gostoso_notifications')
        .select('*')
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      return (data ?? []) as AppNotification[]
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  const { data: profile } = useProfile()
  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) return
      await supabase
        .from('gostoso_notifications')
        .update({ read: true })
        .eq('profile_id', profile.id)
        .eq('read', false)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
