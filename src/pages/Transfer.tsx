import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, Car, Users, Clock, Languages, MessageCircle, Plus,
  CreditCard, AlertCircle, MapPin,
} from 'lucide-react'
import { useTransfers, useSubmitTransfer } from '@/hooks/useTransfers'
import type { TransferFormData } from '@/hooks/useTransfers'
import type { Transfer, TransferRoute } from '@/types/database'
import { usePageMeta } from '@/hooks/usePageMeta'

const VEHICLE_TYPES = ['Van', 'Carro', 'Buggy', 'SUV']
const LANGUAGES_LIST = ['Português', 'Inglês', 'Espanhol', 'Francês']
const PAYMENT_METHODS_LIST = ['Pix', 'Dinheiro', 'Cartão', 'Transferência']

function uniqueRoutes(transfers: Transfer[]): TransferRoute[] {
  const seen = new Set<string>()
  const result: TransferRoute[] = []
  for (const t of transfers) {
    if (!t.routes) continue
    for (const r of t.routes) {
      const key = `${r.from}|||${r.to}`
      if (!seen.has(key)) { seen.add(key); result.push(r) }
    }
  }
  return result
}

function routeKey(r: TransferRoute) { return `${r.from}|||${r.to}` }

function buildWaMessage(transfer: Transfer, route: TransferRoute | null): string {
  const base = `Olá! Vi o serviço da *${transfer.provider_name}* no Vive Gostoso.\n\n`
  if (route) {
    const price = route.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
    return `${base}Rota: ${route.from} → ${route.to}\nValor: R$ ${price}\n\nPode confirmar disponibilidade?`
  }
  return `${base}Pode confirmar disponibilidade?`
}

// ─── TransferCard ─────────────────────────────────────────────────────────────

interface TransferCardProps {
  transfer: Transfer
  selectedRoute: string
  onOpen: () => void
}

function TransferCard({ transfer, selectedRoute, onOpen }: TransferCardProps) {
  const { t } = useTranslation()

  const matchedRoute =
    selectedRoute && transfer.routes
      ? transfer.routes.find(r => routeKey(r) === selectedRoute) ?? null
      : null

  const routeCount = transfer.routes ? transfer.routes.length : 0

  return (
    <button
      onClick={onOpen}
      className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden flex flex-col text-left w-full hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      <div className="relative h-36 bg-gradient-to-br from-teal/20 to-teal/5 flex items-center justify-center flex-shrink-0">
        {transfer.photo_url ? (
          <img src={transfer.photo_url} alt={transfer.provider_name} className="w-full h-full object-cover" />
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
                  <span key={lang} className="bg-[#F5F2EE] text-[#737373] text-xs px-2 py-0.5 rounded-full">
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
              <span className="text-xs text-[#737373]">{matchedRoute.from} → {matchedRoute.to}</span>
              <span className="font-display font-bold text-teal text-base">
                R${matchedRoute.price_brl.toLocaleString('pt-BR')}
              </span>
            </div>
          ) : (
            <div className="mb-3">
              <span className="text-xs text-[#737373]">
                {t('transfer.rotas_disponiveis', { n: routeCount, s: routeCount !== 1 ? 's' : '' })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 w-full bg-[#F5F2EE] text-teal px-4 py-2.5 rounded-xl text-sm font-semibold group-hover:bg-teal group-hover:text-white transition-colors">
            {t('transfer.ver_detalhes')}
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── TransferDetailModal ───────────────────────────────────────────────────────

interface TransferDetailModalProps {
  transfer: Transfer
  initialRoute: string
  onClose: () => void
}

function TransferDetailModal({ transfer, initialRoute, onClose }: TransferDetailModalProps) {
  const { t } = useTranslation()
  const [selectedRouteKey, setSelectedRouteKey] = useState(initialRoute)

  const selectedRoute = transfer.routes?.find(r => routeKey(r) === selectedRouteKey) ?? null
  const waUrl = `https://wa.me/${transfer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(buildWaMessage(transfer, selectedRoute))}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DF] sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="font-display font-bold text-lg text-[#1A1A1A]">{transfer.provider_name}</h2>
            {transfer.vehicle_type && (
              <p className="text-xs text-[#737373] mt-0.5">
                {transfer.vehicle_type} · {transfer.max_passengers} {t('transfer.detail_passageiros')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {transfer.photo_url && (
            <div className="h-48 w-full flex-shrink-0">
              <img src={transfer.photo_url} alt={transfer.provider_name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="px-6 py-5 space-y-6">

            {/* Rotas e valores */}
            {transfer.routes && transfer.routes.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-3">
                  {t('transfer.detail_rotas')}
                </h3>
                <div className="space-y-2">
                  {transfer.routes.map(r => {
                    const key = routeKey(r)
                    const isSelected = key === selectedRouteKey
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedRouteKey(isSelected ? '' : key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-teal bg-teal/5'
                            : 'border-[#E8E4DF] hover:border-teal/40'
                        }`}
                      >
                        <span className={`text-sm font-medium ${isSelected ? 'text-teal' : 'text-[#1A1A1A]'}`}>
                          {r.from} → {r.to}
                        </span>
                        <span className={`font-display font-bold text-base ${isSelected ? 'text-teal' : 'text-[#1A1A1A]'}`}>
                          R$ {r.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {selectedRoute && (
                  <p className="text-xs text-teal mt-2 font-medium">{t('transfer.detail_rota_selecionada')}</p>
                )}
              </section>
            )}

            {/* Detalhes */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-3">
                {t('transfer.detail_detalhes')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {transfer.available_hours && (
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_horario')}</p>
                      <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.available_hours}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_capacidade')}</p>
                    <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.max_passengers} {t('transfer.detail_passageiros')}</p>
                  </div>
                </div>
                {transfer.languages && transfer.languages.length > 0 && (
                  <div className="flex items-start gap-2.5 col-span-2">
                    <Languages className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_idiomas')}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transfer.languages.map(l => (
                          <span key={l} className="bg-[#F5F2EE] text-[#737373] text-xs px-2 py-0.5 rounded-full">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Logística */}
            {(transfer.advance_notice || (transfer.payment_methods && transfer.payment_methods.length > 0) || transfer.meeting_point) && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-3">
                  {t('transfer.detail_logistica')}
                </h3>
                <div className="space-y-3">
                  {transfer.advance_notice && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_antecedencia')}</p>
                        <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.advance_notice}</p>
                      </div>
                    </div>
                  )}
                  {transfer.payment_methods && transfer.payment_methods.length > 0 && (
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_pagamentos')}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {transfer.payment_methods.map(m => (
                            <span key={m} className="bg-ocre/10 text-ocre text-xs px-2 py-0.5 rounded-full font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {transfer.meeting_point && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_encontro')}</p>
                        <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.meeting_point}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Descrição */}
            {transfer.description && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-2">
                  {t('transfer.detail_descricao')}
                </h3>
                <p className="text-sm text-[#3D3D3D] leading-relaxed">{transfer.description}</p>
              </section>
            )}

            {/* Observações */}
            {transfer.observations && (
              <section>
                <div className="flex items-start gap-2.5 bg-[#FFF9F0] border border-ocre/20 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-ocre uppercase tracking-wide font-bold mb-1">{t('transfer.detail_observacoes')}</p>
                    <p className="text-sm text-[#3D3D3D] leading-relaxed">{transfer.observations}</p>
                  </div>
                </div>
              </section>
            )}

            {/* spacing for sticky footer */}
            <div className="h-2" />
          </div>
        </div>

        {/* Sticky footer CTA */}
        <div className="px-6 py-4 border-t border-[#E8E4DF] bg-white">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-teal text-white px-4 py-3.5 rounded-xl text-sm font-semibold hover:bg-teal-dark transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('transfer.detail_entrar_contato')}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── RegistrationModal ────────────────────────────────────────────────────────

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
    advance_notice: '',
    payment_methods: [],
    meeting_point: '',
    observations: '',
  })

  function setField<K extends keyof TransferFormData>(k: K, v: TransferFormData[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function toggleList(field: 'languages' | 'payment_methods', item: string) {
    setForm(f => ({
      ...f,
      [field]: (f[field] as string[]).includes(item)
        ? (f[field] as string[]).filter(x => x !== item)
        : [...(f[field] as string[]), item],
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
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    await mutateAsync(form)
    setSent(true)
  }

  const fieldCls = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white ${
      errors.includes(field) ? 'border-red-400' : 'border-[#E8E4DF]'
    }`

  const chipBtn = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active ? 'bg-teal text-white border-teal' : 'bg-white text-[#737373] border-[#E8E4DF] hover:border-teal/40'
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
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="font-display font-bold text-xl mb-2">{t('transfer.modal_sucesso_titulo')}</h3>
            <p className="text-[#737373] text-sm leading-relaxed">{t('transfer.modal_sucesso_desc')}</p>
            <button onClick={onClose} className="mt-6 bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
              {t('transfer.modal_fechar')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_nome')}</label>
              <input type="text" value={form.provider_name} onChange={e => setField('provider_name', e.target.value)}
                placeholder="Ex: Transfer Gostoso" className={fieldCls('provider_name')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_whatsapp')}</label>
              <input type="tel" value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)}
                placeholder="84 99999-9999" className={fieldCls('whatsapp')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_veiculo')}</label>
              <select value={form.vehicle_type} onChange={e => setField('vehicle_type', e.target.value)} className={fieldCls('vehicle_type')}>
                <option value="">Selecione...</option>
                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_passageiros')}</label>
              <input type="number" min={1} max={20} value={form.max_passengers}
                onChange={e => setField('max_passengers', Number(e.target.value))} className={fieldCls('max_passengers')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_horario')}</label>
              <input type="text" value={form.available_hours} onChange={e => setField('available_hours', e.target.value)}
                placeholder="06:00 - 22:00" className={fieldCls('available_hours')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">{t('transfer.modal_idiomas')}</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_LIST.map(lang => (
                  <button key={lang} type="button" onClick={() => toggleList('languages', lang)}
                    className={chipBtn(form.languages.includes(lang))}>
                    {lang}
                  </button>
                ))}
              </div>
              {errors.includes('languages') && (
                <p className="text-xs text-red-500 mt-1.5">Selecione ao menos um idioma.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">{t('transfer.modal_pagamentos')}</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS_LIST.map(m => (
                  <button key={m} type="button" onClick={() => toggleList('payment_methods', m)}
                    className={chipBtn(form.payment_methods.includes(m))}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_antecedencia')}</label>
              <input type="text" value={form.advance_notice} onChange={e => setField('advance_notice', e.target.value)}
                placeholder="Ex: Mínimo 2 horas antes da viagem" className={fieldCls('advance_notice')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_encontro')}</label>
              <input type="text" value={form.meeting_point} onChange={e => setField('meeting_point', e.target.value)}
                placeholder="Ex: Saída do terminal, placa com o seu nome" className={fieldCls('meeting_point')} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_descricao')}</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                placeholder="Conta um pouco sobre o seu serviço, área de atuação, diferenciais..." rows={3}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{t('transfer.modal_observacoes')}</label>
              <textarea value={form.observations} onChange={e => setField('observations', e.target.value)}
                placeholder="Ex: Bagagem extra, pets, taxa adicional..." rows={2}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none" />
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-teal text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isPending ? t('transfer.modal_enviando') : t('transfer.modal_enviar')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Transfer() {
  const { t } = useTranslation()

  usePageMeta({
    title: 'Transfer São Miguel do Gostoso | Aeroporto Natal',
    description:
      'Transfer do aeroporto de Natal para São Miguel do Gostoso. 110 km, ~1h50. Prestadores verificados, preço fixo, direto no WhatsApp.',
  })

  const { data: transfers = [], isLoading } = useTransfers()
  const [selectedRoute, setSelectedRoute] = useState('')
  const [detailTransfer, setDetailTransfer] = useState<Transfer | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)

  const routes = uniqueRoutes(transfers)

  const filteredTransfers = selectedRoute
    ? transfers.filter(t => t.routes?.some(r => routeKey(r) === selectedRoute))
    : transfers

  return (
    <>
      <section className="bg-teal text-white px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-medium tracking-widest uppercase opacity-80 mb-3">{t('transfer.badge')}</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-none tracking-tight mb-4">
            {t('transfer.titulo')}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed">{t('transfer.desc')}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[{ label: '110 km' }, { label: '~1h50' }, { label: 'Aeroporto de Natal (NAT)' }].map(c => (
              <div key={c.label} className="bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold">{c.label}</div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <select
            value={selectedRoute}
            onChange={e => setSelectedRoute(e.target.value)}
            aria-label={t('transfer.filtro_rota')}
            className="border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          >
            <option value="">{t('transfer.filtro_todas')}</option>
            {routes.map(r => (
              <option key={routeKey(r)} value={routeKey(r)}>{r.from} → {r.to}</option>
            ))}
          </select>

          <button
            onClick={() => setShowRegistration(true)}
            className="flex items-center gap-2 bg-teal text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-dark transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('transfer.cadastre_btn')}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><LoadingSkeleton /></div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🚗</div>
            <h3 className="font-display font-bold text-xl mb-2">{t('transfer.sem_providers')}</h3>
            <p className="text-[#737373] text-sm max-w-xs mx-auto leading-relaxed mb-5">{t('transfer.sem_providers_sub')}</p>
            <button onClick={() => setShowRegistration(true)}
              className="bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
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
                onOpen={() => setDetailTransfer(transfer)}
              />
            ))}
          </div>
        )}
      </main>

      {detailTransfer && (
        <TransferDetailModal
          transfer={detailTransfer}
          initialRoute={selectedRoute}
          onClose={() => setDetailTransfer(null)}
        />
      )}

      {showRegistration && <RegistrationModal onClose={() => setShowRegistration(false)} />}
    </>
  )
}
