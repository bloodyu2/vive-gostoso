import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import { AdminGuard } from '@/components/auth/admin-guard'
import { useAdminTransfers, useModerateTransfer } from '@/hooks/useTransfers'
import type { Transfer } from '@/types/database'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export default function AdminTransfers() {
  return <AdminGuard><AdminTransfersInner /></AdminGuard>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function TransferRow({ transfer }: { transfer: Transfer }) {
  const { mutate: moderate, isPending } = useModerateTransfer()
  const isPending_ = !transfer.active

  return (
    <div className={`bg-white border rounded-2xl p-5 space-y-3 ${isPending_ ? 'border-ocre/40' : 'border-[#E8E4DF]'}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#1A1A1A]">{transfer.provider_name}</h3>
            {isPending_ ? (
              <span className="text-xs font-semibold bg-ocre/10 text-ocre border border-ocre/20 px-2 py-0.5 rounded-full">
                Pendente
              </span>
            ) : (
              <span className="text-xs font-semibold bg-teal/10 text-teal border border-teal/20 px-2 py-0.5 rounded-full">
                Ativo
              </span>
            )}
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            {transfer.vehicle_type ?? '—'} · {transfer.max_passengers} passageiros · Enviado em {formatDate(transfer.created_at)}
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          {isPending_ ? (
            <>
              <button
                onClick={() => moderate({ id: transfer.id, action: 'approve' })}
                disabled={isPending}
                className="bg-teal text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                Publicar
              </button>
              <button
                onClick={() => moderate({ id: transfer.id, action: 'reject' })}
                disabled={isPending}
                className="bg-[#F5F2EE] text-coral text-xs font-semibold px-4 py-2 rounded-xl border border-coral/30 hover:bg-coral/5 transition-colors disabled:opacity-50"
              >
                Rejeitar
              </button>
            </>
          ) : (
            <button
              onClick={() => moderate({ id: transfer.id, action: 'deactivate' })}
              disabled={isPending}
              className="bg-[#F5F2EE] text-[#737373] text-xs font-semibold px-4 py-2 rounded-xl border border-[#E8E4DF] hover:bg-[#E8E4DF] transition-colors disabled:opacity-50"
            >
              Desativar
            </button>
          )}
        </div>
      </div>

      {transfer.description && (
        <p className="text-sm text-[#737373] leading-relaxed">{transfer.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-[#F0EDE8] text-xs text-[#A0A0A0]">
        <span>
          WhatsApp:{' '}
          <a
            href={buildWhatsAppLink(transfer.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            {transfer.whatsapp}
          </a>
        </span>
        {transfer.available_hours && <span>Horário: {transfer.available_hours}</span>}
        {transfer.languages && transfer.languages.length > 0 && (
          <span>Idiomas: {transfer.languages.join(', ')}</span>
        )}
        {transfer.routes && (
          <span>{transfer.routes.length} rota{transfer.routes.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}

function AdminTransfersInner() {
  const { data: transfers = [], isLoading } = useAdminTransfers()
  const pending = transfers.filter(t => !t.active)
  const active  = transfers.filter(t => t.active)

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link
        to="/cadastre/admin"
        className="text-sm text-[#737373] hover:text-teal transition-colors inline-block mb-6"
      >
        ← Admin
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-2">Transfers</h1>
      <p className="text-sm text-[#737373] mb-8">
        Publique novos prestadores e gerencie os ativos na página /transfer.
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-[#E8E4DF] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pendentes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-ocre">
                Pendentes ({pending.length})
              </span>
            </div>
            {pending.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
                <Car className="w-8 h-8 mb-2 text-[#737373] mx-auto" />
                <p className="text-[#737373] text-sm font-semibold">Nenhum transfer pendente.</p>
                <p className="text-xs text-[#B0A99F] mt-1">Tudo moderado!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(t => <TransferRow key={t.id} transfer={t} />)}
              </div>
            )}
          </section>

          {/* Ativos */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal">
                Publicados ({active.length})
              </span>
            </div>
            {active.length === 0 ? (
              <p className="text-sm text-[#737373]">Nenhum transfer publicado ainda.</p>
            ) : (
              <div className="space-y-4">
                {active.map(t => <TransferRow key={t.id} transfer={t} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
