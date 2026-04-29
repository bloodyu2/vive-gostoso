import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface GostsoProfile {
  id: string
  auth_user_id: string
  role: 'admin' | 'owner' | null
  full_name: string | null
  business_id: string | null
  created_at: string
}

export function useProfile() {
  const { user } = useAuth()
  return useQuery<GostsoProfile | null>({
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
