import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Car, Users, Clock, Languages, MessageCircle, Plus } from 'lucide-react'
import { useTransfers, useSubmitTransfer } from '@/hooks/useTransfers'
import type { TransferFormData } from '@/hooks/useTransfers'
import type { Transfer, TransferRoute } from '@/types/database'
import { usePageMeta } from '@/hooks/usePageMeta'

const VEHICLE_TYPES = ['Van', 'Carro', 'Buggy', 'SUV']
const LANGUAGES_LIST = ['Português', 'Inglês', 'Espanhol', 'Francês']

function uniqueRoutes(transfers: Transfer[]): TransferRoute[] {
  const seen = new Set<string>()
  const result: TransferRoute[] = []
  for (const t of transfers) {
    if (!t.routes) continue
    for (const r of t.routes) {
      const key = `${r.from}|||${r.to}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push(r)
      }
    }
  }
  return result
}

function routeKey(r: TransferRoute) {
  return `${r.from}|||${r.to}`
}

interface TransferCardProps {
  transfer: Transfer
  selectedRoute: string
}

function TransferCard({ transfer, selectedRoute }: TransferCardProps) {
  const { t } = useTranslation()

  const matchedRoute =
    selectedRoute && transfer.routes
      ? transfer.routes.find(r => routeKey(r) === selectedRoute) ?? null
      : null

  const routeCount = transfer.routes ? transfer.routes.length : 0

  const waLink = `https://wa.me/${transfer.whatsapp.replace(/\D/g, '')}`

  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden flex flex-col">
      <div className="relative h-36 bg-gradient-to-br from-teal/20 to-teal/5 flex items-center justify-center flex-shrink-0">
        {transfer.photo_url ? (
          <img
            src={transfer.photo_url}
            alt={transfer.provider_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Car className="w-12 h-12 text-teal/40" />
        )}
        {transfer.vehicle_type && (
          <span className="absolute top-3 left-3 bg-white/90 text-teal text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {transfer.vehicle_type}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-display font-bold text-[#1A1A1A] text-base leading-snug">
          {transfer.provider_name}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-[#737373]">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{transfer.max_passengers} passageiros</span>
          </div>
          {transfer.available_hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{transfer.available_hours}</span>
            </div>
          )}
          {transfer.languages && transfer.languages.length > 0 && (
            <div className="flex items-start gap-2">
              <Languages className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {transfer.languages.map(lang => (
                  <span
                    key={lang}
                    className="bg-[#F5F2EE] text-[#737373] text-xs px-2 py-0.5 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-1">
          {matchedRoute ? (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#737373]">
                {matchedRoute.from} → {matchedRoute.to}
              </span>
              <span className="font-display font-bold text-teal text-base">
                R${matchedRoute.price_brl.toLocaleString('pt-BR')}
              </span>
            </div>
          ) : (
            <div className="mb-3">
              <span className="text-xs text-[#737373]">
                {t('transfer.rotas_disponiveis', {
                  n: routeCount,
                  s: routeCount !== 1 ? 's' : '',
                  is: routeCount !== 1 ? 'is' : 'el',
                })}
              </span>
            </div>
          )}

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-teal text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-dark transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('transfer.chamar_whatsapp')}
          </a>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden animate-pulse">
          <div className="h-36 bg-[#E8E4DF]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-[#E8E4DF] rounded w-2/3" />
            <div className="h-3 bg-[#E8E4DF] rounded w-1/2" />
            <div className="h-3 bg-[#E8E4DF] rounded w-1/3" />
            <div className="h-9 bg-[#E8E4DF] rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </>
  )
}

interface RegistrationModalProps {
  onClose: () => void
}

function RegistrationModal({ onClose }: RegistrationModalProps) {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useSubmitTransfer()
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [form, setForm] = useState<TransferFormData>({
    provider_name: '',
    whatsapp: '',
    vehicle_type: '',
    max_passengers: 1,
    available_hours: '',
    languages: [],
    description: '',
  })

  function setField<K extends keyof TransferFormData>(k: K, v: TransferFormData[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function toggleLanguage(lang: string) {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }))
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!form.provider_name.trim()) errs.push('provider_name')
    if (!form.whatsapp.trim()) errs.push('whatsapp')
    if (!form.vehicle_type) errs.push('vehicle_type')
    if (!form.max_passengers || form.max_passengers < 1) errs.push('max_passengers')
    if (!form.available_hours.trim()) errs.push('available_hours')
    if (form.languages.length === 0) errs.push('languages')
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    await mutateAsync(form)
    setSent(true)
  }

  const fieldCls = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white ${
      errors.includes(field) ? 'border-red-400' : 'border-[#E8E4DF]'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF] sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-xl text-[#1A1A1A]">{t('transfer.modal_titulo')}</h2>
            <p className="text-xs text-[#737373] mt-0.5">{t('transfer.modal_sub')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="font-display font-bold text-xl mb-2">{t('transfer.modal_sucesso_titulo')}</h3>
            <p className="text-[#737373] text-sm leading-relaxed">
              {t('transfer.modal_sucesso_desc')}
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
            >
              {t('transfer.modal_fechar')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                {t('transfer.modal_nome')}
              </label>
              <input
                type="text"
                value={form.provider_name}
                onChange={e => setField('provider_name', e.target.value)}
                placeholder="Ex: Transfer Gostoso"
                className={fieldCls('provider_name')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                {t('transfer.modal_whatsapp')}
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => setField('whatsapp', e.target.value)}
                placeholder="84 99999-9999"
                className={fieldCls('whatsapp')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                {t('transfer.modal_veiculo')}
              </label>
              <select
                value={form.vehicle_type}
                onChange={e => setField('vehicle_type', e.target.value)}
                className={fieldCls('vehicle_type')}
              >
                <option value="">Selecione...</option>
                {VEHICLE_TYPES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                {t('transfer.modal_passageiros')}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.max_passengers}
                onChange={e => setField('max_passengers', Number(e.target.value))}
                className={fieldCls('max_passengers')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                {t('transfer.modal_horario')}
              </label>
              <input
                type="text"
                value={form.available_hours}
                onChange={e => setField('available_hours', e.target.value)}
                placeholder="06:00 - 22:00"
                className={fieldCls('available_hours')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                {t('transfer.modal_idiomas')}
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_LIST.map(lang => {
                  const checked = form.languages.includes(lang)
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        checked
                          ? 'bg-teal text-white border-teal'
                          : 'bg-white text-[#737373] border-[#E8E4DF] hover:border-teal/40'
                      }`}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
              {errors.includes('languages') && (
                <p className="text-xs text-red-500 mt-1.5">Selecione ao menos um idioma.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                {t('transfer.modal_descricao')}
              </label>
              <textarea
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Conta um pouco sobre o seu serviço, área de atuação, diferenciais..."
                rows={3}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-teal text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? t('transfer.modal_enviando') : t('transfer.modal_enviar')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Transfer() {
  const { t } = useTranslation()

  usePageMeta({
    title: 'Transfer São Miguel do Gostoso | Aeroporto Natal',
    description:
      'Transfer do aeroporto de Natal para São Miguel do Gostoso. 110 km, ~1h50. Prestadores verificados, preço fixo, direto no WhatsApp.',
  })

  const { data: transfers = [], isLoading } = useTransfers()
  const [selectedRoute, setSelectedRoute] = useState('')
  const [showModal, setShowModal] = useState(false)

  const routes = uniqueRoutes(transfers)

  const filteredTransfers = selectedRoute
    ? transfers.filter(t => t.routes?.some(r => routeKey(r) === selectedRoute))
    : transfers

  return (
    <>
      <section className="bg-teal text-white px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-medium tracking-widest uppercase opacity-80 mb-3">
            {t('transfer.badge')}
          </div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-none tracking-tight mb-4">
            {t('transfer.titulo')}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed">
            {t('transfer.desc')}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[{ label: '110 km' }, { label: '~1h50' }, { label: 'Aeroporto de Natal (NAT)' }].map(c => (
              <div key={c.label} className="bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold">
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              aria-label={t('transfer.filtro_rota')}
              className="border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            >
              <option value="">{t('transfer.filtro_todas')}</option>
              {routes.map(r => (
                <option key={routeKey(r)} value={routeKey(r)}>
                  {r.from} → {r.to}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-teal text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-dark transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('transfer.cadastre_btn')}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton />
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🚗</div>
            <h3 className="font-display font-bold text-xl mb-2">{t('transfer.sem_providers')}</h3>
            <p className="text-[#737373] text-sm max-w-xs mx-auto leading-relaxed mb-5">
              {t('transfer.sem_providers_sub')}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
            >
              {t('transfer.cadastre_btn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransfers.map(transfer => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                selectedRoute={selectedRoute}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && <RegistrationModal onClose={() => setShowModal(false)} />}
    </>
  )
}
