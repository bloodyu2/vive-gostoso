import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
  </div>
)

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/cadastre" replace />

  return <AdminRoleCheck>{children}</AdminRoleCheck>
}

function AdminRoleCheck({ children }: { children: React.ReactNode }) {
  // useProfile has its own useAuth() instance starting with user=null.
  // In RQ v5, isLoading = isPending && isFetching — when enabled:false, isFetching
  // is false so isLoading is false even though profile is undefined. Use isPending
  // instead so we wait while the query is disabled OR fetching.
  const { loading: authLoading } = useAuth()
  const { data: profile, isPending } = useProfile()

  if (authLoading || isPending) return <Spinner />
  if (!profile || profile.role !== 'admin') return <Navigate to="/cadastre/painel" replace />

  return <>{children}</>
}
