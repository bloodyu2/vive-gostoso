import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useSubmitEvent } from '@/hooks/useEventSubmissions'
import { showToast } from '@/components/ui/toast'
import type { EventSubmission } from '@/types/database'

const INPUT_CLS = 'w-full rounded-xl border border-[#E8E4DF] dark:border-[#2D2D2D] bg-white dark:bg-[#1C1C1C] dark:text-white px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none'

interface Props {
  open: boolean
  onClose: () => void
}

export function EventSubmitForm({ open, onClose }: Props) {
  const { t } = useTranslation('event_submit')
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

  const EVENT_TYPES: { value: EventSubmission['event_type']; label: string }[] = [
    { value: 'festival',    label: t('type_festival') },
    { value: 'esporte',     label: t('type_esporte') },
    { value: 'cultural',    label: t('type_cultural') },
    { value: 'gastronomia', label: t('type_gastronomia') },
  ]

  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const anteriorRef = useRef<HTMLElement | null>(null)

  /* Dialogo com foco preso: foco inicial no fechar, Tab circula so dentro do
     painel, Esc fecha e o foco volta para quem abriu. Mesmo padrao do lightbox. */
  useEffect(() => {
    if (!open) return
    anteriorRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab') {
        const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
        const list = nodes ? Array.from(nodes) : []
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      anteriorRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
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
    } catch {
      showToast(t('error_text'), 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="relative w-full max-w-lg bg-white dark:bg-card rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E4DF] dark:border-border-1">
          <h2 className="font-display font-semibold text-xl">{t('title')}</h2>
          <button ref={closeRef} onClick={onClose} aria-label={t('close_btn')} className="w-11 h-11 flex items-center justify-center text-fg-3-texto hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="w-12 h-12 mb-4 text-teal mx-auto" />
            <h3 className="font-display font-semibold text-xl mb-2">{t('success_title')}</h3>
            <p className="text-sm text-fg-3-texto mb-6">
              {t('success_desc')}
            </p>
            <Button variant="secondary" onClick={onClose}>{t('close_btn')}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_name_label')}</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('field_name_placeholder')} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_desc_label')}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder={t('field_desc_placeholder')} className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_start_label')}</label>
                <input required type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_end_label')}</label>
                <input type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_location_label')}</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder={t('field_location_placeholder')} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_type_label')}</label>
              <select value={form.event_type ?? ''} onChange={e => set('event_type', e.target.value)} className={INPUT_CLS}>
                <option value="">{t('select_placeholder')}</option>
                {EVENT_TYPES.map(ev => <option key={ev.value} value={ev.value ?? ''}>{ev.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_source_url_label')}</label>
              <input type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://..." className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg-3-texto uppercase tracking-wider mb-1.5">{t('field_cover_url_label')}</label>
              <input type="url" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://..." className={INPUT_CLS} />
            </div>
            <div className="border-t border-[#E8E4DF] pt-4">
              <p className="text-xs text-fg-3-texto mb-3">{t('submitter_section')}</p>
              <div className="space-y-3">
                <input required value={form.submitter_name} onChange={e => set('submitter_name', e.target.value)} placeholder={t('submitter_name_placeholder')} className={INPUT_CLS} />
                <input required type="email" value={form.submitter_email} onChange={e => set('submitter_email', e.target.value)} placeholder={t('submitter_email_placeholder')} className={INPUT_CLS} />
                <input type="tel" value={form.submitter_phone} onChange={e => set('submitter_phone', e.target.value)} placeholder={t('submitter_phone_placeholder')} className={INPUT_CLS} />
              </div>
            </div>
            {submit.isError && (
              <p className="text-coral text-sm text-center">{t('error_text')}</p>
            )}
            <Button variant="primary" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? t('submitting') : t('submit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
