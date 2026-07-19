'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useLocalePath } from '@/hooks/useLocalePath'
import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary, useAssociadosCount } from '@/hooks/useFund'
import { useGoals } from '@/hooks/useGoals'
import { startDonation } from '@/hooks/useCheckout'
import {
  CheckCircle, Clock, Globe, Mail, Database, Layers,
  Phone, Smartphone, Zap, Server, Heart, Target, Megaphone, Users,
} from 'lucide-react'
import type { FundEntry, Goal } from '@/types/database'

// ─── Static data ────────────────────────────────────────────────────────────

// label/detalhe/valor vêm de apoie.custo_<key>_* — ver src/locales/*.json
const CUSTOS_ATIVOS = [
  { icon: Layers,   key: 'vercel_hobby', valor_mes: 0 },
  { icon: Database, key: 'supabase',     valor_mes: 58.00 },
  { icon: Mail,     key: 'email',        valor_mes: 9.90 },
  { icon: Globe,    key: 'dominio',      valor_mes: 3.33 },
]

const CUSTOS_PLANEJADOS = [
  { icon: Layers,     key: 'vercel_pro' },
  { icon: Phone,      key: 'telefone' },
  { icon: Smartphone, key: 'whatsapp_biz' },
  { icon: Zap,        key: 'marketing' },
  { icon: Server,     key: 'conteudo' },
]

const DONATION_PRESETS = [25, 50, 100, 250]

const GOAL_ICONS: Record<Goal['category'], React.ElementType> = {
  comunidade:    Users,
  operacao:      Phone,
  marketing:     Megaphone,
  infraestrutura: Server,
}

const GOAL_COLORS: Record<Goal['category'], { bg: string; text: string; bar: string }> = {
  comunidade:    { bg: 'bg-teal/10',    text: 'text-teal',  bar: 'bg-teal' },
  operacao:      { bg: 'bg-ocre/10',    text: 'text-ocre',  bar: 'bg-ocre' },
  marketing:     { bg: 'bg-coral/10',   text: 'text-coral', bar: 'bg-coral' },
  infraestrutura:{ bg: 'bg-[#E8E4DF]',  text: 'text-[#737373]', bar: 'bg-[#737373]' },
}

// label vem de apoie.status_<status> — ver src/locales/*.json
const STATUS_CLS: Record<Goal['status'], string> = {
  pendente:     'bg-[#E8E4DF] text-[#737373]',
  em_andamento: 'bg-ocre/10 text-ocre',
  concluido:    'bg-teal/10 text-teal',
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Component ───────────────────────────────────────────────────────────────

type ApoieProps = {
  initialEntries?: FundEntry[]
}

export default function Apoie({ initialEntries = [] }: ApoieProps) {
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()
  usePageMeta({
    title: t('apoie.meta_title'),
    description: t('apoie.meta_desc'),
  })

  const searchParams = useSearchParams()
  const donationSuccess = searchParams?.get('doacao') === 'success'

  const { data: entries }      = useFundEntries({ initialData: initialEntries })
  const entriesList = entries ?? []
  const { data: summary }           = useFundSummary()
  const { data: associadosCount = 0 } = useAssociadosCount()
  const { data: goals = [] }        = useGoals()

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customAmount, setCustomAmount]     = useState('')
  const [donationLoading, setDonationLoading] = useState(false)
  const [donationError, setDonationError]   = useState<string | null>(null)

  const amountBRL =
    selectedPreset ?? (customAmount ? parseFloat(customAmount.replace(',', '.')) : null)

  async function handleDonate() {
    if (!amountBRL || amountBRL < 5) {
      setDonationError(t('apoie.erro_valor_minimo'))
      return
    }
    setDonationLoading(true)
    setDonationError(null)
    try {
      await startDonation(Math.round(amountBRL * 100), lp('/apoie'))
    } catch (err) {
      setDonationError(err instanceof Error ? err.message : t('apoie.erro_generico'))
      setDonationLoading(false)
    }
  }

  const totalMes = CUSTOS_ATIVOS.reduce((s, c) => s + c.valor_mes, 0)

  return (
    <main>
      <FundHero
        totalCents={summary?.totalCents ?? 0}
        marketingCents={summary?.marketingCents ?? 0}
        operacaoCents={summary?.operacaoCents ?? 0}
        acumuladoCents={summary?.acumuladoCents ?? 0}
        associadosCount={associadosCount}
        hasEntries={entriesList.length > 0}
      />

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-14 space-y-14">

        {/* ── Success banner ── */}
        {donationSuccess && (
          <div className="bg-teal/10 border border-teal/20 rounded-2xl p-5 flex items-center gap-4">
            <Heart className="w-6 h-6 text-teal flex-shrink-0" />
            <div>
              <p className="font-semibold text-teal">{t('apoie.sucesso_titulo')}</p>
              <p className="text-sm text-teal/80 mt-0.5">{t('apoie.sucesso_desc')}</p>
            </div>
          </div>
        )}

        {/* ── Donation widget ── */}
        <section className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-[#F5F2EE] dark:border-[#2D2D2D]">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-coral" />
              <h2 className="font-display font-semibold text-xl">{t('apoie.doe_titulo')}</h2>
            </div>
            <p className="text-sm text-[#737373]">{t('apoie.doe_desc')}</p>
          </div>

          <div className="px-6 py-5">
            {/* Preset grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
              {DONATION_PRESETS.map(val => (
                <button
                  key={val}
                  onClick={() => { setSelectedPreset(val); setCustomAmount('') }}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    selectedPreset === val
                      ? 'bg-coral text-white border-coral'
                      : 'text-[#3D3D3D] dark:text-white border-[#E8E4DF] dark:border-[#333] hover:border-coral hover:text-coral'
                  }`}
                >
                  R${val}
                </button>
              ))}
              <button
                onClick={() => setSelectedPreset(null)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all col-span-4 sm:col-span-1 ${
                  selectedPreset === null && customAmount
                    ? 'bg-coral text-white border-coral'
                    : 'text-[#3D3D3D] dark:text-white border-[#E8E4DF] dark:border-[#333] hover:border-coral hover:text-coral'
                }`}
              >
                {t('apoie.valor_custom')}
              </button>
            </div>

            {/* Custom amount */}
            {selectedPreset === null && (
              <div className="flex items-center gap-2 mb-4 bg-[#F5F2EE] dark:bg-[#252525] rounded-xl px-4 py-2.5">
                <span className="text-sm font-semibold text-[#737373]">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9,]/g, '')
                    setCustomAmount(v)
                  }}
                  placeholder={t('apoie.valor_placeholder')}
                  className="flex-1 bg-transparent text-sm outline-none text-[#1A1A1A] dark:text-white placeholder:text-[#737373]"
                />
              </div>
            )}

            {donationError && (
              <p className="text-sm text-red-500 mb-3">{donationError}</p>
            )}

            <button
              onClick={handleDonate}
              disabled={donationLoading || !amountBRL || (amountBRL ?? 0) < 5}
              className="w-full bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              {donationLoading
                ? t('apoie.redirecionando')
                : amountBRL && amountBRL >= 5
                ? `${t('apoie.doe_btn')} R$${amountBRL.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                : t('apoie.escolha_valor')}
            </button>
            <p className="text-xs text-[#737373] mt-3 text-center">
              {t('apoie.pagamento_seguro')}
            </p>
          </div>
        </section>

        {/* ── Custos operacionais ── */}
        <section>
          <div className="mb-6">
            <h2 className="font-display font-semibold text-2xl mb-1">{t('apoie.custos_titulo')}</h2>
            <p className="text-sm text-[#737373]">{t('apoie.custos_desc')}</p>
          </div>

          {/* Em operação */}
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-teal" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#737373]">{t('apoie.em_operacao')}</span>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden mb-4">
            {CUSTOS_ATIVOS.map((c, i) => {
              const Icon = c.icon
              const isLast = i === CUSTOS_ATIVOS.length - 1
              return (
                <div
                  key={c.key}
                  className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-[#F5F2EE] dark:border-[#2D2D2D]' : ''}`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-teal" />
                  </div>

                  {/* Label + detail */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A] dark:text-white leading-snug">
                      {t(`apoie.custo_${c.key}_label`)}
                    </div>
                    <div className="text-xs text-[#737373] mt-0.5 truncate">{t(`apoie.custo_${c.key}_detalhe`)}</div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-display font-bold text-base text-teal tabular-nums">
                      {t(`apoie.custo_${c.key}_valor_display`)}
                    </div>
                    <div className="text-xs text-[#737373] mt-0.5 whitespace-nowrap">{t(`apoie.custo_${c.key}_valor_sub`)}</div>
                  </div>
                </div>
              )
            })}

            {/* Total row */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#F5F2EE] dark:bg-[#222]">
              <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{t('apoie.total_mes')}</span>
              <span className="font-display font-bold text-xl text-teal tabular-nums">
                R${totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Planejado */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Clock className="w-3.5 h-3.5 text-ocre" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#737373]">{t('apoie.planejado_label')}</span>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] border border-dashed border-[#D4CFCA] dark:border-[#333] rounded-2xl overflow-hidden opacity-75">
            {CUSTOS_PLANEJADOS.map((c, i) => {
              const Icon = c.icon
              const isLast = i === CUSTOS_PLANEJADOS.length - 1
              return (
                <div
                  key={c.key}
                  className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-[#F5F2EE] dark:border-[#2D2D2D]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-ocre/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-ocre" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A] dark:text-white leading-snug">
                      {t(`apoie.custo_${c.key}_label`)}
                    </div>
                    <div className="text-xs text-[#737373] mt-0.5 leading-relaxed">{t(`apoie.custo_${c.key}_detalhe`)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-ocre bg-ocre/10 px-3 py-1 rounded-full whitespace-nowrap">
                      {t('apoie.em_breve')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Metas / Goals ── */}
        {goals.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-teal" />
              <h2 className="font-display font-semibold text-2xl">{t('apoie.metas_titulo')}</h2>
            </div>
            <p className="text-sm text-[#737373] mb-6">
              {t('apoie.metas_desc')}
            </p>

            <div className="space-y-3">
              {goals.map(goal => {
                const Icon = GOAL_ICONS[goal.category]
                const col = GOAL_COLORS[goal.category]
                const statusCls = STATUS_CLS[goal.status]
                const pct = goal.target_cents > 0
                  ? Math.min(100, Math.round((goal.raised_cents / goal.target_cents) * 100))
                  : 0

                return (
                  <div
                    key={goal.id}
                    className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl px-5 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${col.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white">
                            {goal.title}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCls}`}>
                            {t(`apoie.status_${goal.status}`)}
                          </span>
                          {goal.target_date && (
                            <span className="text-xs text-[#737373]">
                              {t('apoie.meta_data_prefix')} {new Date(goal.target_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-xs text-[#737373] mb-3 leading-relaxed">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#E8E4DF] dark:bg-[#333] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${col.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#737373] flex-shrink-0 tabular-nums">
                            {fmt(goal.raised_cents)} / {fmt(goal.target_cents)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Movimentações ── */}
        <section>
          <h2 className="font-display font-semibold text-2xl mb-1">{t('apoie.movimentacoes_titulo')}</h2>
          <p className="text-sm text-[#737373] mb-5">{t('apoie.movimentacoes_desc')}</p>

          {entriesList.length > 0 ? (
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden">
              {entriesList.map((e, i) => (
                <FundEntryRow key={e.id} entry={e} last={i === entriesList.length - 1} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                {t('apoie.movimentacoes_vazio_titulo')}
              </p>
              <p className="text-xs text-[#737373] mt-1">
                {t('apoie.movimentacoes_vazio_desc')}
              </p>
            </div>
          )}
        </section>

        {/* ── APRENDE callout ── */}
        <section>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-2xl p-6 md:p-8">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 bg-teal text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {t('apoie.aprende_badge')}
              </span>
              <h3 className="font-display font-bold text-3xl text-white mb-3">{t('apoie.aprende_titulo')}</h3>
              <p className="text-white/70 text-sm leading-relaxed max-w-xl mb-5">
                {t('apoie.aprende_desc')}
              </p>
              <ul className="space-y-2 max-w-xl">
                {[0, 1, 2].map(i => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    {t(`apoie.aprende_item_${i}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="flex gap-3 pb-4">
          <Link
            href="/cadastre"
            className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-dark transition-colors text-sm"
          >
            {t('apoie.associar_negocio_btn')}
          </Link>
        </div>

      </div>
    </main>
  )
}
