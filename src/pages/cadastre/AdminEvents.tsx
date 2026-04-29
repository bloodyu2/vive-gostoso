import { Link } from 'react-router-dom'
import { AdminGuard } from '@/components/auth/admin-guard'
import { usePendingEventSubmissions, useApproveEventSubmission, useRejectEventSubmission } from '@/hooks/useEventSubmissions'
import { Button } from '@/components/ui/button'
import type { EventSubmission } from '@/types/database'

export default function AdminEvents() {
  return <AdminGuard><AdminEventsInner /></AdminGuard>
}

function EventRow({ sub }: { sub: EventSubmission }) {
  const approve = useApproveEventSubmission()
  const reject = useRejectEventSubmission()
  const start = new Date(sub.starts_at)
  const dateStr = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A1A]">{sub.name}</h3>
          <p className="text-xs text-[#737373] mt-0.5">
            {dateStr}{sub.location ? ` · ${sub.location}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="primary"
            className="text-xs px-3 py-1.5 min-h-0"
            disabled={approve.isPending}
            onClick={() => approve.mutate(sub)}
          >
            Aprovar
          </Button>
          <Button
            variant="ghost"
            className="text-xs px-3 py-1.5 min-h-0 text-coral border border-coral/30 hover:bg-coral/5"
            disabled={reject.isPending}
            onClick={() => reject.mutate({ id: sub.id, note: 'Rejeitado pelo admin' })}
          >
            Rejeitar
          </Button>
        </div>
      </div>
      {sub.description && <p className="text-sm text-[#3D3D3D]">{sub.description}</p>}
      {sub.source_url && (
        <a href={sub.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:underline">
          {sub.source_url}
        </a>
      )}
      <div className="text-xs text-[#A0A0A0] border-t border-[#F0EDE8] pt-3">
        Enviado por: <span className="text-[#737373]">{sub.submitter_name}</span>
        {sub.submitter_email ? ` · ${sub.submitter_email}` : ''}
        {sub.submitter_phone ? ` · ${sub.submitter_phone}` : ''}
      </div>
    </div>
  )
}

function AdminEventsInner() {
  const { data: submissions = [], isLoading } = usePendingEventSubmissions()

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link to="/cadastre/admin" className="text-sm text-[#737373] hover:text-teal transition-colors inline-block mb-6">
        ← Admin
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-2">Eventos pendentes</h1>
      <p className="text-sm text-[#737373] mb-8">Submissões da comunidade aguardando aprovação.</p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-[#E8E4DF] rounded-2xl animate-pulse" />)}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-[#737373] text-sm">Nenhuma submissão pendente. Tudo em dia!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(s => <EventRow key={s.id} sub={s} />)}
        </div>
      )}
    </main>
  )
}
