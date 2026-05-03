import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubmitEvent } from '@/hooks/useEventSubmissions'
import type { EventSubmission } from '@/types/database'

const INPUT_CLS = 'w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none'

const EVENT_TYPES: { value: EventSubmission['event_type']; label: string }[] = [
  { value: 'festival',    label: 'Festival' },
  { value: 'esporte',     label: 'Esporte' },
  { value: 'cultural',    label: 'Cultural' },
  { value: 'gastronomia', label: 'Gastronomia' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function EventSubmitForm({ open, onClose }: Props) {
  const submit = useSubmitEvent()
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    starts_at: '',
    ends_at: '',
    location: '',
    cover_url: '',
    event_type: '' as EventSubmission['event_type'] | '',
    source_url: '',
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
  })

  if (!open) return null

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submit.mutateAsync({
      name: form.name,
      description: form.description || undefined,
      starts_at: form.starts_at,
      ends_at: form.ends_at || undefined,
      location: form.location || undefined,
      cover_url: form.cover_url || undefined,
      event_type: (form.event_type as EventSubmission['event_type']) || undefined,
      source_url: form.source_url || undefined,
      submitter_name: form.submitter_name,
      submitter_email: form.submitter_email,
      submitter_phone: form.submitter_phone || undefined,
    })
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E4DF]">
          <h2 className="font-display font-semibold text-xl">Submeter evento</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#1A1A1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="w-12 h-12 mb-4 text-teal mx-auto" />
            <h3 className="font-display font-semibold text-xl mb-2">Evento enviado!</h3>
            <p className="text-sm text-[#737373] mb-6">
              Recebemos sua sugestão. Vamos revisar e publicar em breve.
            </p>
            <Button variant="secondary" onClick={onClose}>Fechar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Nome do evento *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Gostoso Sunset Festival" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Descrição</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="O que vai acontecer?" className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Início *</label>
                <input required type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Fim</label>
                <input type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Local</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ex: Praia da Malhada" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Tipo</label>
              <select value={form.event_type ?? ''} onChange={e => set('event_type', e.target.value)} className={INPUT_CLS}>
                <option value="">Selecione...</option>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value ?? ''}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">Link externo (site, Instagram etc)</label>
              <input type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://..." className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1.5">URL da foto (opcional)</label>
              <input type="url" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://..." className={INPUT_CLS} />
            </div>
            <div className="border-t border-[#E8E4DF] pt-4">
              <p className="text-xs text-[#737373] mb-3">Quem está enviando?</p>
              <div className="space-y-3">
                <input required value={form.submitter_name} onChange={e => set('submitter_name', e.target.value)} placeholder="Seu nome *" className={INPUT_CLS} />
                <input required type="email" value={form.submitter_email} onChange={e => set('submitter_email', e.target.value)} placeholder="seu@email.com *" className={INPUT_CLS} />
                <input type="tel" value={form.submitter_phone} onChange={e => set('submitter_phone', e.target.value)} placeholder="WhatsApp (opcional)" className={INPUT_CLS} />
              </div>
            </div>
            {submit.error && (
              <p className="text-coral text-sm text-center">Ocorreu um erro. Tente novamente.</p>
            )}
            <Button variant="primary" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? 'Enviando...' : 'Enviar sugestão de evento'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
