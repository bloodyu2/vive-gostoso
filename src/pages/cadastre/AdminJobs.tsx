import { Link } from 'react-router-dom'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminPendingJobs, useModerateJob } from '@/hooks/useJobs'
import { CONTRACT_TYPE_LABELS } from '@/types/database'
import type { JobListing } from '@/types/database'

export default function AdminJobs() {
  return <AdminGuard><AdminJobsInner /></AdminGuard>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function JobRow({ job }: { job: JobListing }) {
  const { mutate: moderate, isPending } = useModerateJob()

  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A1A]">{job.title}</h3>
          <p className="text-xs text-[#737373] mt-0.5">
            {job.business_name} · {CONTRACT_TYPE_LABELS[job.contract_type]} · Enviado em {formatDate(job.created_at)}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => moderate({ id: job.id, approve: true })}
            disabled={isPending}
            className="bg-teal text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50"
          >
            Publicar
          </button>
          <button
            onClick={() => moderate({ id: job.id, approve: false })}
            disabled={isPending}
            className="bg-[#F5F2EE] text-coral text-xs font-semibold px-4 py-2 rounded-xl border border-coral/30 hover:bg-coral/5 transition-colors disabled:opacity-50"
          >
            Rejeitar
          </button>
        </div>
      </div>

      {job.description && (
        <p className="text-sm text-[#3D3D3D] leading-relaxed">{job.description}</p>
      )}

      <div className="pt-1 border-t border-[#F0EDE8] text-xs text-[#A0A0A0]">
        WhatsApp:{' '}
        <a
          href={`https://wa.me/${job.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline"
        >
          {job.whatsapp}
        </a>
      </div>
    </div>
  )
}

function AdminJobsInner() {
  const { data: jobs = [], isLoading } = useAdminPendingJobs()

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link
        to="/cadastre/admin"
        className="text-sm text-[#737373] hover:text-teal transition-colors inline-block mb-6"
      >
        ← Admin
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-2">Vagas pendentes</h1>
      <p className="text-sm text-[#737373] mb-8">
        Publique ou rejeite vagas enviadas por empregadores via CONTRATE.
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-[#E8E4DF] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-[#737373] text-sm font-semibold">Nenhuma vaga pendente.</p>
          <p className="text-xs text-[#B0A99F] mt-1">Tudo moderado!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(j => (
            <JobRow key={j.id} job={j} />
          ))}
        </div>
      )}
    </main>
  )
}
