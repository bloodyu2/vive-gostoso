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
  const { data: profile, isLoading } = useProfile()

  if (isLoading) return <Spinner />
  if (!profile || profile.role !== 'admin') return <Navigate to="/cadastre/painel" replace />

  return <>{children}</>
}
