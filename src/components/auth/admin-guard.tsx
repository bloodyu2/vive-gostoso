'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
  </div>
)

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/cadastre')
  }, [loading, user, router])

  if (loading || !user) return <Spinner />

  return <AdminRoleCheck>{children}</AdminRoleCheck>
}

function AdminRoleCheck({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth()
  const { data: profile, isPending } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isPending && (!profile || profile.role !== 'admin')) {
      router.replace('/cadastre/painel')
    }
  }, [authLoading, isPending, profile, router])

  if (authLoading || isPending) return <Spinner />
  if (!profile || profile.role !== 'admin') return null

  return <>{children}</>
}
