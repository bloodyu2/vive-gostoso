import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { SERVICE_CATEGORY_LABELS } from '@/types/database'
import type { ServiceCategory } from '@/types/database'
import { useSubmitService } from '@/hooks/useServices'
import { useTranslation } from 'react-i18next'

interface Props { onClose: () => void }

const CATEGORIES = Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategory, string][]

export function ServiceForm({ onClose }: Props) {
  const { t } = useTranslation('service_form')
  const { mutateAsync, isPending } = useSubmitService()
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState(false)
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
    setSubmitError(false)
    try {
      await mutateAsync({ ...form, service_category: form.service_category as ServiceCategory })
      setSent(true)
    } catch {
      setSubmitError(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF] sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-xl text-[#1A1A1A]">{t('title')}</h2>
            <p className="text-xs text-[#737373] mt-0.5">{t('subtitle')}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle className="w-10 h-10 mb-4 text-teal mx-auto" />
            <h3 className="font-display font-bold text-xl mb-2">{t('received_title')}</h3>
            <p className="text-[#737373] text-sm leading-relaxed">
              {t('received_desc')}
            </p>
            <button onClick={onClose} className="mt-6 bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('label_name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder={t('placeholder_name')}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('label_headline')}</label>
              <input
                type="text"
                value={form.headline}
                onChange={e => set('headline', e.target.value)}
                placeholder={t('placeholder_headline')}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('label_category')}</label>
              <select
                value={form.service_category}
                onChange={e => set('service_category', e.target.value)}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal bg-white transition-colors"
                required
              >
                <option value="">{t('select_placeholder')}</option>
                {CATEGORIES.map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('label_description')}</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder={t('placeholder_description')}
                rows={3}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('label_whatsapp')}</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder={t('placeholder_whatsapp')}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                required
              />
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              {t('consent_text')}
            </p>

            {submitError && (
              <p role="alert" className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-xl px-4 py-2.5">
                {t('common.erro_desc', { ns: 'translation' })}
              </p>
            )}

            <button
              type="submit"
              disabled={!valid || isPending}
              className="w-full bg-teal text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? t('submitting') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
