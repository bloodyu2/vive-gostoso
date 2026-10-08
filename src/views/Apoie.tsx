'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocalePath } from '@/hooks/useLocalePath'
import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary } from '@/hooks/useFund'
import { useParametros } from '@/hooks/useParametros'
import type { Parametros } from '@/lib/parametros'
import { useGoals } from '@/hooks/useGoals'
import { startDonation } from '@/hooks/useCheckout'
import {
  CheckCircle, Clock, Globe, Mail, Database, Layers,
  Phone, Smartphone, Zap, Server, Heart, Target, Megaphone, Users,
} from 'lucide-react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { FatoTile } from '@/components/institucional/fato-tile'
import type { FundEntry, Goal } from '@/types/database'

// ─── Static data ────────────────────────────────────────────────────────────

// label/detalhe/valor vêm de apoie.custo_<key>_* — ver src/locales/*.json
const CUSTOS_ATIVOS = [
  { icon: Layers,   key: 'vercel_hobby', valor_mes: 0 },
  /* Sem valor: a assinatura Pro e da organizacao Balaio Digital, que hospeda
     quatro projetos. Nao existe fracao defensavel para atribuir a este site, e
     numero que nao se defende e a mesma familia de problema dos R$230. */
  { icon: Database, key: 'supabase',     valor_mes: 0 },
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
  infraestrutura:{ bg: 'bg-border-1',   text: 'text-fg-3-texto', bar: 'bg-fg-3-texto' },
}

// label vem de apoie.status_<status> — ver src/locales/*.json
const STATUS_CLS: Record<Goal['status'], string> = {
  aguardando_arrecadacao: 'bg-border-1 text-fg-3-texto',
  pendente:     'bg-border-1 text-fg-3-texto',
  em_andamento: 'bg-ocre/10 text-ocre',
  concluido:    'bg-teal/10 text-teal',
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CARTAO = 'rounded-2xl bg-white dark:bg-card border border-border-1'
const H2 = 'font-display font-semibold text-2xl md:text-3xl tracking-tight text-fg-1'

// ─── Component ───────────────────────────────────────────────────────────────

type ApoieProps = {
  initialEntries?: FundEntry[]
  initialParametros?: Parametros
}

export default function Apoie({ initialEntries = [], initialParametros }: ApoieProps) {
  /* Mesma fonte de rateio da /sobre e da /transparencia. */
  const { data: param } = useParametros(
    initialParametros ? { initialData: initialParametros } : undefined
  )
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()

  const searchParams = useSearchParams()
  const donationSuccess = searchParams?.get('doacao') === 'success'

  const { data: entries }      = useFundEntries({ initialData: initialEntries })
  const entriesList = entries ?? []
  const { data: summary }           = useFundSummary()
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
      {/* `temArrecadacao` decide entre o painel de lancamento e o de extrato.
          Antes o gatilho era "existe alguma entrada", e como entrada de CUSTO
          tambem conta, a pagina saia do modo lancamento sem ter recebido um
          real. O que decide e a arrecadacao, nao o numero de linhas. */}
      <FundHero
        parametros={param}
        totalCents={summary?.totalCents ?? 0}
        marketingCents={summary?.marketingCents ?? 0}
        operacaoCents={summary?.operacaoCents ?? 0}
        acumuladoCents={summary?.acumuladoCents ?? 0}
        temArrecadacao={(summary?.totalCents ?? 0) > 0}
      />

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">

        {/* ── Success banner ── */}
        {donationSuccess && (
          <div className="bg-teal/10 border border-teal/20 rounded-2xl p-5 flex items-center gap-4 mb-10">
            <Heart className="w-6 h-6 text-teal-dark dark:text-teal flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-teal-dark dark:text-teal">{t('apoie.sucesso_titulo')}</p>
              <p className="text-sm text-fg-3-texto mt-0.5">{t('apoie.sucesso_desc')}</p>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:items-start">

          {/* ── Donation widget: o formulario da acao principal. No celular vem
              antes do texto (o botao do topo leva ate aqui); no desktop fica
              fixo na lateral. ── */}
          <section id="doe" className={`${CARTAO} scroll-mt-24 overflow-hidden mb-12 lg:mb-0 lg:order-2 lg:sticky lg:top-24`}>
            <div className="px-6 pt-6 pb-5 border-b border-border-1">
              <h2 className="font-display font-semibold text-xl text-fg-1 mb-1">{t('apoie.doe_titulo')}</h2>
              <p className="text-sm text-fg-3-texto">{t('apoie.doe_desc')}</p>
            </div>

            <div className="px-6 py-5">
              {/* Preset grid */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {DONATION_PRESETS.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setSelectedPreset(val); setCustomAmount('') }}
                    aria-pressed={selectedPreset === val}
                    className={`min-h-11 rounded-xl text-sm font-semibold border transition-colors ${
                      selectedPreset === val
                        ? 'bg-coral-texto text-white border-coral-texto'
                        : 'text-fg-1 border-border-1 hover:border-coral-texto hover:text-coral-texto'
                    }`}
                  >
                    R${val}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreset(null)}
                aria-pressed={selectedPreset === null && !!customAmount}
                className={`w-full min-h-11 mb-4 rounded-xl text-sm font-semibold border transition-colors ${
                  selectedPreset === null && customAmount
                    ? 'bg-coral-texto text-white border-coral-texto'
                    : 'text-fg-1 border-border-1 hover:border-coral-texto hover:text-coral-texto'
                }`}
              >
                {t('apoie.valor_custom')}
              </button>

              {/* Custom amount */}
              {selectedPreset === null && (
                <div className="flex items-center gap-2 mb-4 bg-areia dark:bg-[#252525] rounded-xl px-4 min-h-12">
                  <span className="text-sm font-semibold text-fg-3-texto">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label={t('apoie.valor_placeholder')}
                    value={customAmount}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9,]/g, '')
                      setCustomAmount(v)
                    }}
                    placeholder={t('apoie.valor_placeholder')}
                    className="flex-1 bg-transparent text-base outline-none text-fg-1 placeholder:text-fg-3-texto"
                  />
                </div>
              )}

              {donationError && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">{donationError}</p>
              )}

              <button
                type="button"
                onClick={handleDonate}
                disabled={donationLoading || !amountBRL || (amountBRL ?? 0) < 5}
                className="w-full min-h-12 bg-coral-texto text-white font-semibold px-6 rounded-xl hover:bg-coral-texto/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                {donationLoading
                  ? t('apoie.redirecionando')
                  : amountBRL && amountBRL >= 5
                  ? `${t('apoie.doe_btn')} R$${amountBRL.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                  : t('apoie.escolha_valor')}
              </button>
              <p className="text-xs text-fg-3-texto mt-3 text-center">
                {t('apoie.pagamento_seguro')}
              </p>
            </div>
          </section>

          <div className="min-w-0 space-y-14 md:space-y-16 lg:order-1">

            {/* ── Custos operacionais ── */}
            <section>
              <h2 className={`${H2} mb-2`}>{t('apoie.custos_titulo')}</h2>
              <p className="text-base text-fg-3-texto leading-relaxed max-w-2xl mb-6">{t('apoie.custos_desc')}</p>

              <FatoTile
                tom="teal"
                valor={<>R$ <NumberTicker value={totalMes} decimais={2} /></>}
                rotulo={t('apoie.total_mes')}
                descricao={t('apoie.total_mes_nota')}
              />

              {/* Em operação */}
              <div className="flex items-center gap-2 mb-3 mt-8">
                <CheckCircle className="w-4 h-4 text-teal-dark dark:text-teal" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-fg-1">{t('apoie.em_operacao')}</h3>
              </div>

              <div className={`${CARTAO} overflow-hidden`}>
                {CUSTOS_ATIVOS.map((c, i) => {
                  const Icon = c.icon
                  const isLast = i === CUSTOS_ATIVOS.length - 1
                  return (
                    <div
                      key={c.key}
                      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-border-1' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-teal-dark dark:text-teal" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-fg-1 leading-snug">
                          {t(`apoie.custo_${c.key}_label`)}
                        </div>
                        <div className="text-xs text-fg-3-texto mt-0.5">{t(`apoie.custo_${c.key}_detalhe`)}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-display font-bold text-base text-teal-dark dark:text-teal tabular-nums">
                          {t(`apoie.custo_${c.key}_valor_display`)}
                        </div>
                        <div className="text-xs text-fg-3-texto mt-0.5 whitespace-nowrap">{t(`apoie.custo_${c.key}_valor_sub`)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Planejado */}
              <div className="flex items-center gap-2 mb-3 mt-8">
                <Clock className="w-4 h-4 text-ocre-dark dark:text-ocre" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-fg-1">{t('apoie.planejado_label')}</h3>
              </div>

              <div className="border border-dashed border-fg-3-texto/40 rounded-2xl overflow-hidden">
                {CUSTOS_PLANEJADOS.map((c, i) => {
                  const Icon = c.icon
                  const isLast = i === CUSTOS_PLANEJADOS.length - 1
                  return (
                    <div
                      key={c.key}
                      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-dashed border-fg-3-texto/30' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-ocre/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-ocre-dark dark:text-ocre" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-fg-1 leading-snug">
                          {t(`apoie.custo_${c.key}_label`)}
                        </div>
                        <div className="text-xs text-fg-3-texto mt-0.5 leading-relaxed">{t(`apoie.custo_${c.key}_detalhe`)}</div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-medium text-fg-1 bg-ocre-light dark:bg-ocre/20 px-3 py-1 rounded-full whitespace-nowrap">
                        {t('apoie.em_breve')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ── Metas / Goals ── */}
            {goals.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-teal-dark dark:text-teal" aria-hidden="true" />
                  <h2 className={H2}>{t('apoie.metas_titulo')}</h2>
                </div>
                <p className="text-base text-fg-3-texto mb-6">
                  {t('apoie.metas_desc')}
                </p>

                <div className="space-y-3">
                  {goals.map((goal, gi) => {
                    const Icon = GOAL_ICONS[goal.category]
                    const col = GOAL_COLORS[goal.category]
                    const statusCls = STATUS_CLS[goal.status]
                    const pct = goal.target_cents > 0
                      ? Math.min(100, Math.round((goal.raised_cents / goal.target_cents) * 100))
                      : 0

                    return (
                      <BlurFade key={goal.id} delay={(gi % 4) * 70}>
                        <MagicCard className={`${CARTAO} px-5 py-4`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Icon className={`w-4 h-4 ${col.text}`} aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-fg-1">
                                  {goal.title}
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCls}`}>
                                  {t(`apoie.status_${goal.status}`)}
                                </span>
                                {goal.target_date && (
                                  <span className="text-xs text-fg-3-texto">
                                    {t('apoie.meta_data_prefix')} {new Date(goal.target_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR', { month: 'long', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-xs text-fg-3-texto mb-3 leading-relaxed">{goal.description}</p>
                              )}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-border-1 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${col.bar}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-fg-3-texto flex-shrink-0 tabular-nums">
                                  {fmt(goal.raised_cents)} / {fmt(goal.target_cents)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </MagicCard>
                      </BlurFade>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ── Movimentações ── */}
            <section>
              <h2 className={`${H2} mb-1`}>{t('apoie.movimentacoes_titulo')}</h2>
              <p className="text-base text-fg-3-texto mb-5">{t('apoie.movimentacoes_desc')}</p>

              {entriesList.length > 0 ? (
                <div className={`${CARTAO} overflow-hidden`}>
                  {entriesList.map((e, i) => (
                    <FundEntryRow key={e.id} entry={e} last={i === entriesList.length - 1} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-fg-3-texto/40 px-6 py-10">
                  <p className="font-display font-semibold text-xl text-fg-1">
                    {t('apoie.movimentacoes_vazio_titulo')}
                  </p>
                  <p className="text-sm text-fg-3-texto mt-2 max-w-md leading-relaxed">
                    {t('apoie.movimentacoes_vazio_desc')}
                  </p>
                </div>
              )}
            </section>

            {/* ── APRENDE callout ── */}
            <BlurFade>
              <section className="rounded-2xl bg-[#1A1A1A] text-white p-6 md:p-8">
                <span className="inline-flex items-center bg-teal-dark text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {t('apoie.aprende_badge')}
                </span>
                <h2 className="font-display font-bold text-3xl text-white mb-3">{t('apoie.aprende_titulo')}</h2>
                <p className="text-white/75 text-base leading-relaxed max-w-xl mb-5">
                  {t('apoie.aprende_desc')}
                </p>
                <ul className="space-y-2 max-w-xl">
                  {[0, 1, 2].map(i => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/85">
                      <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {t(`apoie.aprende_item_${i}`)}
                    </li>
                  ))}
                </ul>
              </section>
            </BlurFade>

            {/* ── Links secundarios ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4">
              <Link
                href={lp('/cadastre')}
                className="inline-flex items-center justify-center min-h-11 border border-border-1 text-fg-1 font-semibold px-6 rounded-xl hover:border-teal transition-colors text-sm w-fit"
              >
                {t('apoie.associar_negocio_btn')}
              </Link>
              <Link
                href={lp('/transparencia')}
                className="inline-flex items-center min-h-11 text-teal-dark dark:text-teal text-sm font-semibold hover:underline w-fit"
              >
                {t('apoie.transparencia_link')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
