import { useState } from 'react'
import { X } from 'lucide-react'
import { SERVICE_CATEGORY_LABELS } from '@/types/database'
import type { ServiceCategory } from '@/types/database'
import { useSubmitService } from '@/hooks/useServices'

interface Props { onClose: () => void }

const CATEGORIES = Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategory, string][]

export function ServiceForm({ onClose }: Props) {
  const { mutateAsync, isPending } = useSubmitService()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    headline: '',
    description: '',
    service_category: '' as ServiceCategory | '',
    whatsapp: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name && form.headline && form.service_category && form.whatsapp

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    await mutateAsync({ ...form, service_category: form.service_category as ServiceCategory })
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF] sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-xl text-[#1A1A1A]">Ofereço meu serviço</h2>
            <p className="text-xs text-[#737373] mt-0.5">Seu cadastro fica ativo após revisão — normalmente 24h</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="font-display font-bold text-xl mb-2">Recebemos!</h3>
            <p className="text-[#737373] text-sm leading-relaxed">
              Vamos revisar e publicar em até 24 horas. Fique de olho no WhatsApp — podemos entrar em contato para confirmar.
            </p>
            <button onClick={onClose} className="mt-6 bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Seu nome completo *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Título do serviço *</label>
              <input
                type="text"
                value={form.headline}
                onChange={e => set('headline', e.target.value)}
                placeholder="Ex: Guia de kitesurf e passeios de barco"
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Categoria *</label>
              <select
                value={form.service_category}
                onChange={e => set('service_category', e.target.value)}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal bg-white transition-colors"
                required
              >
                <option value="">Selecione...</option>
                {CATEGORIES.map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Descrição do serviço</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Conte um pouco mais sobre o que você faz, experiência, área de atuação..."
                rows={3}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">WhatsApp *</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="84 99999-9999"
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                required
              />
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              Ao enviar, você concorda que seu nome e WhatsApp fiquem visíveis para quem buscar o serviço. Sem taxas — a plataforma é da cidade.
            </p>

            <button
              type="submit"
              disabled={!valid || isPending}
              className="w-full bg-teal text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Enviando...' : 'Enviar cadastro'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
