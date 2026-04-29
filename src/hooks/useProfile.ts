import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types/database'

export type { Profile }

export function useProfile() {
  const { user } = useAuth()
  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('gostoso_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
