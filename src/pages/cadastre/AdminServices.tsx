import { Link } from 'react-router-dom'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminPendingServices, useModerateService } from '@/hooks/useServices'
import { SERVICE_CATEGORY_LABELS } from '@/types/database'
import type { ServiceListing } from '@/types/database'

export default function AdminServices() {
  return <AdminGuard><AdminServicesInner /></AdminGuard>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function ServiceRow({ svc }: { svc: ServiceListing }) {
  const { mutate: moderate, isPending } = useModerateService()

  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A1A]">{svc.name}</h3>
          <p className="text-xs text-[#737373] mt-0.5">
            {SERVICE_CATEGORY_LABELS[svc.service_category]} · Enviado em {formatDate(svc.created_at)}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => moderate({ id: svc.id, approve: true })}
            disabled={isPending}
            className="bg-teal text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50"
          >
            Publicar
          </button>
          <button
            onClick={() => moderate({ id: svc.id, approve: false })}
            disabled={isPending}
            className="bg-[#F5F2EE] text-coral text-xs font-semibold px-4 py-2 rounded-xl border border-coral/30 hover:bg-coral/5 transition-colors disabled:opacity-50"
          >
            Rejeitar
          </button>
        </div>
      </div>

      {svc.headline && (
        <p className="text-sm font-medium text-[#3D3D3D]">{svc.headline}</p>
      )}

      {svc.description && (
        <p className="text-sm text-[#737373] leading-relaxed">{svc.description}</p>
      )}

      <div className="flex items-center gap-3 pt-1 border-t border-[#F0EDE8] text-xs text-[#A0A0A0]">
        <span>
          WhatsApp:{' '}
          <a
            href={`https://wa.me/${svc.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            {svc.whatsapp}
          </a>
        </span>
        {svc.is_featured && (
          <span className="bg-ocre/10 text-ocre border border-ocre/20 px-2 py-0.5 rounded-full font-semibold">
            Destaque
          </span>
        )}
      </div>
    </div>
  )
}

function AdminServicesInner() {
  const { data: services = [], isLoading } = useAdminPendingServices()

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link
        to="/cadastre/admin"
        className="text-sm text-[#737373] hover:text-teal transition-colors inline-block mb-6"
      >
        ← Admin
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-2">Serviços pendentes</h1>
      <p className="text-sm text-[#737373] mb-8">
        Publique ou rejeite serviços enviados por moradores via CONTRATE.
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-[#E8E4DF] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
          <div className="text-4xl mb-3">💼</div>
          <p className="text-[#737373] text-sm font-semibold">Nenhum serviço pendente.</p>
          <p className="text-xs text-[#B0A99F] mt-1">Tudo moderado!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(s => (
            <ServiceRow key={s.id} svc={s} />
          ))}
        </div>
      )}
    </main>
  )
}
