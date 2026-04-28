import { useState } from 'react'
import { X } from 'lucide-react'
import { CONTRACT_TYPE_LABELS } from '@/types/database'
import type { ContractType } from '@/types/database'
import { useSubmitJob } from '@/hooks/useJobs'

interface Props { onClose: () => void }

const CONTRACT_TYPES = Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]

export function JobForm({ onClose }: Props) {
  const { mutateAsync, isPending } = useSubmitJob()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    title: '',
    description: '',
    contract_type: '' as ContractType | '',
    whatsapp: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.business_name && form.title && form.contract_type && form.whatsapp

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    await mutateAsync({ ...form, contract_type: form.contract_type as ContractType })
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF] sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-xl text-[#1A1A1A]">Publicar vaga</h2>
            <p className="text-xs text-[#737373] mt-0.5">A vaga fica ativa após revisão — normalmente 24h</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="font-display font-bold text-xl mb-2">Vaga recebida!</h3>
            <p className="text-[#737373] text-sm leading-relaxed">
              Vamos revisar e publicar em até 24 horas. Se precisarmos de mais informações, entraremos em contato pelo WhatsApp.
            </p>
            <button onClick={onClose} className="mt-6 bg-ocre text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nome do negócio / empregador *</label>
              <input
                type="text"
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                placeholder="Ex: Pousada Ventania"
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocre/30 focus:border-ocre transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Cargo / função *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Ex: Garçom, Recepcionista, Cozinheiro..."
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocre/30 focus:border-ocre transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Tipo de contrato *</label>
              <select
                value={form.contract_type}
                onChange={e => set('contract_type', e.target.value)}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocre/30 focus:border-ocre bg-white transition-colors"
                required
              >
                <option value="">Selecione...</option>
                {CONTRACT_TYPES.map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Descrição da vaga</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Requisitos, horário, salário (opcional), diferenciais..."
                rows={3}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocre/30 focus:border-ocre transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">WhatsApp para contato *</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="84 99999-9999"
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocre/30 focus:border-ocre transition-colors"
                required
              />
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              Publicação gratuita. A vaga fica disponível até você solicitar remoção. Negócios associados ganham destaque automático.
            </p>

            <button
              type="submit"
              disabled={!valid || isPending}
              className="w-full bg-ocre text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isPending ? 'Enviando...' : 'Publicar vaga'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
