'use client'

import Link from 'next/link'
import {
  Star, Tag, Calendar, Briefcase, ClipboardList, Car, Store,
  LogOut, LayoutDashboard, User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminStats } from '@/hooks/useAdminStats'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function Admin() {
  return <AdminGuard><AdminInner /></AdminGuard>
}

function PendingBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="ml-auto flex-shrink-0 bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
      {count}
    </span>
  )
}

function AdminInner() {
  const statsQuery = useAdminStats()
  const stats = statsQuery.data
  const { user, supabase } = useAuth()

  const modules: { href: string; icon: LucideIcon; title: string; desc: string; badge: number }[] = [
    {
      href: '/cadastre/admin/reviews',
      icon: Star,
      title: 'Avaliações',
      desc: 'Aprovar ou rejeitar avaliações de negócios.',
      badge: stats?.pendingReviews ?? 0,
    },
    {
      href: '/cadastre/admin/claims',
      icon: Tag,
      title: 'Reivindicações',
      desc: 'Aprovar ou rejeitar pedidos de ownership.',
      badge: stats?.pendingClaims ?? 0,
    },
    {
      href: '/cadastre/admin/events',
      icon: Calendar,
      title: 'Eventos',
      desc: 'Aprovar eventos submetidos pela comunidade.',
      badge: stats?.pendingEvents ?? 0,
    },
    {
      href: '/cadastre/admin/services',
      icon: Briefcase,
      title: 'Serviços CONTRATE',
      desc: 'Publicar ou rejeitar serviços de moradores.',
      badge: stats?.pendingServices ?? 0,
    },
    {
      href: '/cadastre/admin/jobs',
      icon: ClipboardList,
      title: 'Vagas CONTRATE',
      desc: 'Publicar ou rejeitar vagas de emprego.',
      badge: stats?.pendingJobs ?? 0,
    },
    {
      href: '/cadastre/admin/transfers',
      icon: Car,
      title: 'Transfers',
      desc: 'Publicar ou rejeitar prestadores de transfer.',
      badge: stats?.pendingTransfers ?? 0,
    },
    {
      href: '/cadastre/admin/businesses',
      icon: Store,
      title: 'Negócios',
      desc: 'Publicar, despublicar e editar slugs de negócios.',
      badge: stats?.draftBusinesses ?? 0,
    },
    {
      href: '/cadastre/admin/profissionais',
      icon: User,
      title: 'Profissionais',
      desc: 'Publicar, despublicar e deletar perfis de profissionais autônomos.',
      badge: 0,
    },
  ]

  const totalPending = (stats?.pendingReviews ?? 0)
    + (stats?.pendingClaims ?? 0)
    + (stats?.pendingEvents ?? 0)
    + (stats?.pendingServices ?? 0)
    + (stats?.pendingJobs ?? 0)
    + (stats?.pendingTransfers ?? 0)

  const statItems = [
    { value: stats?.pendingReviews ?? '—', label: 'Avaliações', urgent: (stats?.pendingReviews ?? 0) > 0 },
    { value: stats?.pendingClaims ?? '—', label: 'Reivind.', urgent: (stats?.pendingClaims ?? 0) > 0 },
    { value: stats?.pendingEvents ?? '—', label: 'Eventos', urgent: (stats?.pendingEvents ?? 0) > 0 },
    { value: stats?.pendingServices ?? '—', label: 'Serviços', urgent: false },
    { value: stats?.pendingJobs ?? '—', label: 'Vagas', urgent: false },
    { value: stats?.pendingTransfers ?? '—', label: 'Transfers', urgent: false },
    { value: stats?.totalBusinesses ?? '—', label: 'Negócios', urgent: false },
    { value: stats?.draftBusinesses ?? '—', label: 'Rascunhos', urgent: (stats?.draftBusinesses ?? 0) > 0 },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-[#737373]" />
            <span className="text-sm font-semibold text-[#1A1A1A]">Admin</span>
            {totalPending > 0 && (
              <span className="bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                {totalPending} pendente{totalPending !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:block text-xs text-[#737373] truncate max-w-[180px]">
                {user.email}
              </span>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              title="Sair"
              className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#1A1A1A] border border-[#E8E4DF] hover:border-[#C4BFBA] rounded-xl px-3 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        {/* ── Back link ── */}
        <Link
          href="/cadastre/painel"
          className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6"
        >
          ← Painel do prestador
        </Link>

        {/* ── Heading ── */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">Painel Admin</h1>
          <p className="text-sm text-[#737373] mt-1">Moderação e gestão do diretório Vive Gostoso.</p>
        </div>

        {/* ── Stats bar ── */}
        {statsQuery.isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-16 bg-[#E8E4DF] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
            {statItems.map(({ value, label, urgent }) => (
              <div
                key={label}
                className={`rounded-xl border p-3 text-center ${
                  urgent
                    ? 'bg-coral/5 border-coral/25'
                    : 'bg-white border-[#E8E4DF]'
                }`}
              >
                <p className={`text-xl font-bold tabular-nums leading-none ${urgent ? 'text-coral' : 'text-[#1A1A1A]'}`}>
                  {value}
                </p>
                <p className="text-[10px] text-[#737373] mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Module list ── */}
        <div className="space-y-2">
          {modules.map(({ href, icon: Icon, title, desc, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 bg-white border border-[#E8E4DF] rounded-2xl px-5 py-4 hover:shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                badge > 0 ? 'bg-coral/10' : 'bg-[#F5F2EE]'
              }`}>
                <Icon className={`w-4 h-4 ${badge > 0 ? 'text-coral' : 'text-[#737373]'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1A1A1A] group-hover:text-teal transition-colors">{title}</p>
                <p className="text-xs text-[#737373] mt-0.5 truncate">{desc}</p>
              </div>
              <PendingBadge count={badge} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
