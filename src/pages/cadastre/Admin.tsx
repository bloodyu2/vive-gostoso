import { Link } from 'react-router-dom'
import { Star, Tag, Calendar, Briefcase, ClipboardList, Car } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function Admin() {
  return <AdminGuard><AdminInner /></AdminGuard>
}

function Badge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="absolute top-4 right-4 bg-coral text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {count}
    </span>
  )
}

function AdminInner() {
  const statsQuery = useAdminStats()
  const stats = statsQuery.data
  const { user, signOut } = useAuth()

  const modules: { to: string; icon: LucideIcon; title: string; desc: string; badge: number }[] = [
    {
      to: '/cadastre/admin/reviews',
      icon: Star,
      title: 'Avaliações',
      desc: 'Aprovar ou rejeitar avaliações de negócios.',
      badge: stats?.pendingReviews ?? 0,
    },
    {
      to: '/cadastre/admin/claims',
      icon: Tag,
      title: 'Reivindicações',
      desc: 'Aprovar ou rejeitar pedidos de ownership.',
      badge: stats?.pendingClaims ?? 0,
    },
    {
      to: '/cadastre/admin/events',
      icon: Calendar,
      title: 'Eventos',
      desc: 'Aprovar ou rejeitar submissões de eventos da comunidade.',
      badge: stats?.pendingEvents ?? 0,
    },
    {
      to: '/cadastre/admin/services',
      icon: Briefcase,
      title: 'Serviços CONTRATE',
      desc: 'Publicar ou rejeitar serviços de moradores.',
      badge: stats?.pendingServices ?? 0,
    },
    {
      to: '/cadastre/admin/jobs',
      icon: ClipboardList,
      title: 'Vagas CONTRATE',
      desc: 'Publicar ou rejeitar vagas de emprego.',
      badge: stats?.pendingJobs ?? 0,
    },
    {
      to: '/cadastre/admin/transfers',
      icon: Car,
      title: 'Transfers',
      desc: 'Publicar ou rejeitar prestadores de transfer.',
      badge: stats?.pendingTransfers ?? 0,
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      {/* Back link */}
      <Link
        to="/cadastre/painel"
        className="text-sm text-[#737373] hover:text-teal transition-colors inline-block mb-6"
      >
        ← Painel
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <h1 className="font-display text-3xl font-semibold flex-1">Painel Admin</h1>
        {user?.email && (
          <span className="text-sm text-[#737373]">{user.email}</span>
        )}
        <Button variant="ghost" onClick={() => signOut()} className="text-sm px-3 py-2 min-h-0">
          Sair
        </Button>
      </div>

      {/* Stat bar */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-20 bg-[#E8E4DF] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
          {[
            { value: stats?.pendingReviews ?? '—', label: 'Avaliações' },
            { value: stats?.pendingClaims ?? '—', label: 'Reivind.' },
            { value: stats?.pendingEvents ?? '—', label: 'Eventos' },
            { value: stats?.pendingServices ?? '—', label: 'Serviços' },
            { value: stats?.pendingJobs ?? '—', label: 'Vagas' },
            { value: stats?.pendingTransfers ?? '—', label: 'Transfers' },
            { value: stats?.totalBusinesses ?? '—', label: 'Negócios' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white border border-[#E8E4DF] rounded-xl p-4"
            >
              <p className="text-2xl font-bold text-teal">{value}</p>
              <p className="text-xs text-[#737373] mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map(({ to, icon: Icon, title, desc, badge }) => (
          <Link
            key={to}
            to={to}
            className="relative bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all block"
          >
            <Badge count={badge} />
            <Icon className="w-7 h-7 mb-3 text-[#1A1A1A]" />
            <p className="font-semibold text-[#1A1A1A] text-lg mb-1">{title}</p>
            <p className="text-sm text-[#737373]">{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
