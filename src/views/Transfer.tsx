'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  X, Car, Plus, CheckCircle, Star, MessageCircle,
} from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { useTransfers, useSubmitTransfer } from '@/hooks/useTransfers'
import type { TransferFormData } from '@/hooks/useTransfers'
import type { Transfer, TransferRoute } from '@/types/database'
import { useTransferRatings } from '@/hooks/useReviews'
import { useLocalePath } from '@/hooks/useLocalePath'

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

// ─── TransferCard ─────────────────────────────────────────────────────────────

const AIRPORT_RE = /aeroporto|natal|\bnat\b/i

function airportRoute(t: Transfer): TransferRoute | null {
  return t.routes?.find(r => AIRPORT_RE.test(r.from) || AIRPORT_RE.test(r.to)) ?? null
}

function formatBrl(n: number) {
  return `R$ ${n.toLocaleString('pt-BR')}`
}

function buildCardMessage(transfer: Transfer, route: TransferRoute | null): string {
  const base = `Olá! Vi o serviço da *${transfer.provider_name}* no Vive Gostoso.\n\n`
  if (route) {
    return `${base}Rota: ${route.from} → ${route.to}\nValor: ${formatBrl(route.price_brl)}\n\nPode confirmar disponibilidade?`
  }
  return `${base}Pode confirmar disponibilidade?`
}

interface TransferCardProps {
  transfer: Transfer
  selectedRoute: string
  ratings: Map<string, { avg: number; count: number }>
  destaque?: boolean
  atraso?: number
}

function TransferCard({ transfer, selectedRoute, ratings, destaque = false, atraso = 0 }: TransferCardProps) {
  const { t } = useTranslation()
  const lp = useLocalePath()

  const routes = transfer.routes ?? []
  const matchedRoute = selectedRoute ? routes.find(r => routeKey(r) === selectedRoute) ?? null : null
  const route = matchedRoute ?? airportRoute(transfer) ?? routes[0] ?? null
  const outras = route ? routes.length - 1 : 0
  const rating = ratings.get(transfer.id)
  const href = transfer.slug ? lp(`/transfer/${transfer.slug}`) : undefined
  const waUrl = buildWhatsAppLink(transfer.whatsapp, buildCardMessage(transfer, route))

  const escuro = destaque
  const muted = escuro ? 'text-white/80' : 'text-fg-3-texto'

  const titulo = route ? (
    <span className={cn('block font-display font-bold leading-[1.1] tracking-tight', destaque ? 'text-3xl md:text-4xl' : 'text-2xl')}>
      {route.from}
      <span className="block text-base font-medium opacity-80 my-0.5" aria-hidden="true">↓</span>
      <span className="sr-only"> {t('transfer.para')} </span>
      {route.to}
    </span>
  ) : (
    <span className="block font-display font-bold text-2xl leading-tight">{transfer.provider_name}</span>
  )

  return (
    <BlurFade delay={atraso} className={cn('h-full', destaque && 'md:col-span-2')}>
      <MagicCard
        className={cn(
          'h-full rounded-2xl overflow-hidden flex flex-col border transition-shadow hover:shadow-card-hover',
          escuro ? 'bg-teal-dark text-white border-teal-dark' : 'bg-white dark:bg-card text-fg-1 border-border-1',
          destaque && transfer.photo_url && 'md:flex-row',
        )}
      >
        {transfer.photo_url && (
          <div className={cn('relative shrink-0', destaque ? 'h-44 md:h-auto md:w-2/5' : 'h-32')}>
            <img src={transfer.photo_url} alt={transfer.provider_name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}

        <div className="relative flex flex-col flex-1 gap-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {transfer.vehicle_type && (
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', escuro ? 'bg-white/15 text-white' : 'bg-teal/10 text-teal-dark dark:text-teal-100')}>
                {transfer.vehicle_type}
              </span>
            )}
            {rating && rating.count > 0 && (
              <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', muted)}>
                <Star className={cn('w-3.5 h-3.5', escuro ? 'fill-white text-white' : 'fill-ocre text-ocre')} />
                {rating.avg.toFixed(1)} ({rating.count})
              </span>
            )}
          </div>

          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded-md">
              {titulo}
            </Link>
          ) : titulo}

          {route ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={cn('font-display font-bold tracking-tight', destaque ? 'text-5xl' : 'text-4xl', escuro ? 'text-white' : 'text-teal-dark dark:text-teal-100')}>
                {formatBrl(route.price_brl)}
              </span>
              {outras > 0 && <span className={cn('text-sm', muted)}>{t('transfer.mais_rotas', { n: outras })}</span>}
            </div>
          ) : null}

          <p className={cn('text-sm', muted)}>
            {transfer.provider_name}
            <span aria-hidden="true"> · </span>
            {transfer.max_passengers} {t('transfer.detail_passageiros')}
            {transfer.available_hours && (<><span aria-hidden="true"> · </span>{transfer.available_hours}</>)}
          </p>

          {transfer.languages && transfer.languages.length > 0 && (
            <p className={cn('text-xs', muted)}>{transfer.languages.join(', ')}</p>
          )}

          <div className="mt-auto pt-1 flex flex-wrap items-center gap-3 relative z-10">
            <ShimmerButton
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 px-5 rounded-xl text-sm bg-ocre-dark hover:bg-ocre-700"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {t('transfer.chamar_whatsapp')}
            </ShimmerButton>
            {href && (
              <Link href={href} className={cn('relative z-10 inline-flex items-center min-h-11 text-sm font-semibold', escuro ? 'text-white' : 'text-teal')}>
                {t('transfer.ver_detalhes')} <span aria-hidden="true">&nbsp;→</span>
              </Link>
            )}
          </div>
        </div>
      </MagicCard>
    </BlurFade>
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
    routes: [{ from: '', to: '', price_brl: 0 }],
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
    if (form.routes.length === 0 || form.routes.some(r => !r.from.trim() || !r.to.trim() || !r.price_brl)) errs.push('routes')
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
      active ? 'bg-teal text-white border-teal' : 'bg-white text-fg-3-texto border-[#E8E4DF] hover:border-teal/40'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E4DF] sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-xl text-[#1A1A1A]">{t('transfer.modal_titulo')}</h2>
            <p className="text-xs text-fg-3-texto mt-0.5">{t('transfer.modal_sub')}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle className="w-10 h-10 mb-4 text-teal mx-auto" />
            <h3 className="font-display font-bold text-xl mb-2">{t('transfer.modal_sucesso_titulo')}</h3>
            <p className="text-fg-3-texto text-sm leading-relaxed">{t('transfer.modal_sucesso_desc')}</p>
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
                <option value="">{t('common.selecione')}</option>
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
                <p className="text-xs text-red-500 mt-1.5">{t('transfer.erro_idiomas')}</p>
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

            {/* Routes section */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#1A1A1A]">{t('transfer.routes_title')}</p>
              <p className="text-xs text-fg-3-texto">{t('transfer.routes_desc')}</p>
              {form.routes.map((route, i) => (
                <div key={i} className="flex gap-2 items-start bg-[#F5F2EE] rounded-xl p-3">
                  <div className="flex-1 space-y-2">
                    <input value={route.from} onChange={e => {
                      const r = [...form.routes]; r[i] = { ...r[i], from: e.target.value }; setForm(f => ({ ...f, routes: r }))
                    }} placeholder={t('transfer.route_from')} className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2 text-sm" />
                    <input value={route.to} onChange={e => {
                      const r = [...form.routes]; r[i] = { ...r[i], to: e.target.value }; setForm(f => ({ ...f, routes: r }))
                    }} placeholder={t('transfer.route_to')} className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2 text-sm" />
                    <input type="number" value={route.price_brl || ''} onChange={e => {
                      const r = [...form.routes]; r[i] = { ...r[i], price_brl: Number(e.target.value) }; setForm(f => ({ ...f, routes: r }))
                    }} placeholder={t('transfer.route_price')} className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, routes: f.routes.filter((_, j) => j !== i) }))}
                    className="text-xs text-red-500 mt-2 hover:text-red-700 shrink-0">{t('transfer.route_remove')}</button>
                </div>
              ))}
              {errors.includes('routes') && (
                <p className="text-xs text-red-500">{t('transfer.erro_rotas')}</p>
              )}
              <button type="button" onClick={() => setForm(f => ({ ...f, routes: [...f.routes, { from: '', to: '', price_brl: 0 }] }))}
                className="text-sm text-teal font-semibold hover:text-teal-dark transition-colors">
                {t('transfer.route_add')}
              </button>
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
        <div key={i} className="bg-white dark:bg-card border border-border-1 rounded-2xl overflow-hidden animate-pulse motion-reduce:animate-none">
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

  const { data: transfers = [], isLoading } = useTransfers()
  const { data: ratingsMap = new Map() } = useTransferRatings()
  const [selectedRoute, setSelectedRoute] = useState('')
  const [showRegistration, setShowRegistration] = useState(false)

  const routes = uniqueRoutes(transfers)

  const filteredTransfers = selectedRoute
    ? transfers.filter(t => t.routes?.some(r => routeKey(r) === selectedRoute))
    : transfers

  // A rota do aeroporto de Natal, quando existe nos dados, vira o bloco grande.
  const featured = filteredTransfers.find(tr => airportRoute(tr)) ?? null
  const featuredId = featured?.id ?? null
  const ordered = featured ? [featured, ...filteredTransfers.filter(tr => tr.id !== featured.id)] : filteredTransfers

  return (
    <>
      {/* Sky (#87CEEB) is reserved for Transfer so it reads as its own product, not a teal-tinted
          clone of FIQUE. Pale wash background + the same deepened #1E7A9E used in the header nav
          (raw #87CEEB fails text contrast, ~1.9:1). */}
      <section className="bg-sky/10 text-[#1E7A9E] dark:text-sky px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-sm font-semibold opacity-80 mb-3">{t('transfer.badge')}</div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-none tracking-tight mb-4 text-[#1E7A9E] dark:text-sky">
            {t('transfer.titulo')}
          </h1>
          <p className="text-[#1E7A9E]/80 dark:text-sky/80 text-base md:text-lg max-w-xl leading-relaxed">{t('transfer.desc')}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[{ label: '110 km' }, { label: '~1h50' }, { label: 'Aeroporto de Natal (NAT)' }].map(c => (
              <div key={c.label} className="bg-white dark:bg-card text-[#1E7A9E] dark:text-sky border border-[#1E7A9E]/15 rounded-xl px-4 py-2 text-sm font-semibold">{c.label}</div>
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
            className="border border-border-1 rounded-xl px-4 min-h-11 text-sm bg-white dark:bg-card focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          >
            <option value="">{t('transfer.filtro_todas')}</option>
            {routes.map(r => (
              <option key={routeKey(r)} value={routeKey(r)}>{r.from} → {r.to}</option>
            ))}
          </select>

          <button
            onClick={() => setShowRegistration(true)}
            className="flex items-center gap-2 bg-[#1E7A9E] text-white px-4 min-h-11 rounded-xl text-sm font-semibold hover:bg-[#175E7B] transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('transfer.cadastre_btn')}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><LoadingSkeleton /></div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-8 h-8 mx-auto mb-3 text-fg-3-texto" aria-hidden="true" />
            <h3 className="font-display font-bold text-xl mb-2">{t('transfer.sem_providers')}</h3>
            <p className="text-fg-3-texto text-sm max-w-xs mx-auto leading-relaxed mb-5">{t('transfer.sem_providers_sub')}</p>
            <button onClick={() => setShowRegistration(true)}
              className="bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors">
              {t('transfer.cadastre_btn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {ordered.map((transfer, i) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                selectedRoute={selectedRoute}
                ratings={ratingsMap}
                destaque={transfer.id === featuredId}
                atraso={(i % 4) * 70}
              />
            ))}
          </div>
        )}
      </main>

      {showRegistration && <RegistrationModal onClose={() => setShowRegistration(false)} />}
    </>
  )
}
