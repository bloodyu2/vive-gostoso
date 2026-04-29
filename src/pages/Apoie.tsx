import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary, useAssociadosCount } from '@/hooks/useFund'
import { useGoals } from '@/hooks/useGoals'
import { startDonation } from '@/hooks/useCheckout'
import {
  CheckCircle, Clock, Globe, Mail, Database, Layers,
  Phone, Smartphone, Zap, Server, Heart, Target, Megaphone, Users,
} from 'lucide-react'
import type { Goal } from '@/types/database'

// ─── Static data ────────────────────────────────────────────────────────────

const CUSTOS_ATIVOS = [
  {
    icon: Layers,
    label: 'Vercel Pro',
    detalhe: 'Hospedagem, CDN global, deploys automáticos',
    valor_display: '~R$118/mês',
    valor_sub: 'USD 20 · cobrado em dólar',
    valor_mes: 118.00,
  },
  {
    icon: Database,
    label: 'Supabase Pro',
    detalhe: 'Banco de dados, autenticação, storage e Edge Functions',
    valor_display: '~R$148/mês',
    valor_sub: 'USD 25 · cobrado em dólar',
    valor_mes: 148.00,
  },
  {
    icon: Mail,
    label: 'E-mail dedicado',
    detalhe: 'contato@vivegostoso.com.br',
    valor_display: 'R$9,90/mês',
    valor_sub: 'Plano anual',
    valor_mes: 9.90,
  },
  {
    icon: Globe,
    label: 'Domínio vivegostoso.com.br',
    detalhe: 'Registro.br · renovação anual',
    valor_display: 'R$40/ano',
    valor_sub: '≈ R$3,33/mês',
    valor_mes: 3.33,
  },
]

const CUSTOS_PLANEJADOS = [
  {
    icon: Phone,
    label: 'Número de telefone dedicado',
    detalhe: 'Atendimento à comunidade e negócios',
  },
  {
    icon: Smartphone,
    label: 'WhatsApp Business verificado',
    detalhe: 'Canal oficial de suporte e anúncios',
  },
  {
    icon: Zap,
    label: 'Marketing digital',
    detalhe: 'E-mail marketing, anúncios locais — quando a arrecadação justificar',
  },
  {
    icon: Server,
    label: 'Produção de conteúdo',
    detalhe: 'Fotos e vídeos dos negócios da cidade',
  },
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
  infraestrutura:{ bg: 'bg-[#E8E4DF]',  text: 'text-[#737373]', bar: 'bg-[#A0A0A0]' },
}

const STATUS_LABEL: Record<Goal['status'], { label: string; cls: string }> = {
  pendente:     { label: 'Pendente',      cls: 'bg-[#E8E4DF] text-[#737373]' },
  em_andamento: { label: 'Em andamento',  cls: 'bg-ocre/10 text-ocre' },
  concluido:    { label: 'Concluído',     cls: 'bg-teal/10 text-teal' },
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Apoie() {
  const { t } = useTranslation()
  usePageMeta({
    title: 'Apoie Gostoso',
    description: 'Fundo público transparente para promover São Miguel do Gostoso. Veja como o dinheiro é usado.',
  })

  const [searchParams] = useSearchParams()
  const donationSuccess = searchParams.get('doacao') === 'success'

  const { data: entries = [] }      = useFundEntries()
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
      setDonationError('Valor mínimo de R$5,00.')
      return
    }
    setDonationLoading(true)
    setDonationError(null)
    try {
      await startDonation(Math.round(amountBRL * 100))
    } catch (err) {
      setDonationError(err instanceof Error ? err.message : 'Erro ao processar. Tente novamente.')
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
        hasEntries={entries.length > 0}
      />

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-14 space-y-14">

        {/* ── Success banner ── */}
        {donationSuccess && (
          <div className="bg-teal/10 border border-teal/20 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-2xl">💚</span>
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
                  type="number"
                  min={5}
                  step={1}
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  placeholder="Quanto você quer apoiar?"
                  className="flex-1 bg-transparent text-sm outline-none text-[#1A1A1A] dark:text-white placeholder:text-[#B0A89E]"
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
                ? 'Redirecionando...'
                : amountBRL && amountBRL >= 5
                ? `${t('apoie.doe_btn')} R$${amountBRL.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                : 'Escolha um valor'}
            </button>
            <p className="text-xs text-[#B0A89E] mt-3 text-center">
              Pagamento seguro via Stripe · sem vínculo de mensalidade
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
            <span className="text-xs font-semibold uppercase tracking-widest text-[#737373]">Em operação</span>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden mb-4">
            {CUSTOS_ATIVOS.map((c, i) => {
              const Icon = c.icon
              const isLast = i === CUSTOS_ATIVOS.length - 1
              return (
                <div
                  key={c.label}
                  className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-[#F5F2EE] dark:border-[#2D2D2D]' : ''}`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-teal" />
                  </div>

                  {/* Label + detail */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A] dark:text-white leading-snug">
                      {c.label}
                    </div>
                    <div className="text-xs text-[#A0A0A0] mt-0.5 truncate">{c.detalhe}</div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-display font-bold text-base text-teal tabular-nums">
                      {c.valor_display}
                    </div>
                    <div className="text-xs text-[#A0A0A0] mt-0.5 whitespace-nowrap">{c.valor_sub}</div>
                  </div>
                </div>
              )
            })}

            {/* Total row */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#F5F2EE] dark:bg-[#222]">
              <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Total/mês</span>
              <span className="font-display font-bold text-xl text-teal tabular-nums">
                R${totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Planejado */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Clock className="w-3.5 h-3.5 text-ocre" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#737373]">Planejado — quando a arrecadação permitir</span>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] border border-dashed border-[#D4CFCA] dark:border-[#333] rounded-2xl overflow-hidden opacity-75">
            {CUSTOS_PLANEJADOS.map((c, i) => {
              const Icon = c.icon
              const isLast = i === CUSTOS_PLANEJADOS.length - 1
              return (
                <div
                  key={c.label}
                  className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-[#F5F2EE] dark:border-[#2D2D2D]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-ocre/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-ocre" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A] dark:text-white leading-snug">
                      {c.label}
                    </div>
                    <div className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">{c.detalhe}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-ocre bg-ocre/10 px-3 py-1 rounded-full whitespace-nowrap">
                      Em breve
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
              <h2 className="font-display font-semibold text-2xl">Para onde vai o dinheiro</h2>
            </div>
            <p className="text-sm text-[#737373] mb-6">
              Metas concretas que a arrecadação financia. Sem promessas vazias.
            </p>

            <div className="space-y-3">
              {goals.map(goal => {
                const Icon = GOAL_ICONS[goal.category]
                const col = GOAL_COLORS[goal.category]
                const status = STATUS_LABEL[goal.status]
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
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
                            {status.label}
                          </span>
                          {goal.target_date && (
                            <span className="text-xs text-[#A0A0A0]">
                              Meta: {new Date(goal.target_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
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
          <h2 className="font-display font-semibold text-2xl mb-1">Movimentações</h2>
          <p className="text-sm text-[#737373] mb-5">Cada real que entra ou sai. Auditável. Público.</p>

          {entries.length > 0 ? (
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden">
              {entries.map((e, i) => (
                <FundEntryRow key={e.id} entry={e} last={i === entries.length - 1} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                Nenhuma movimentação ainda
              </p>
              <p className="text-xs text-[#A0A0A0] mt-1">
                Quando os primeiros associados confirmarem, o extrato aparece aqui em tempo real.
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
                Objetivo 1º semestre
              </span>
              <h3 className="font-display font-bold text-3xl text-white mb-3">Programa APRENDE</h3>
              <p className="text-white/70 text-sm leading-relaxed max-w-xl mb-6">
                Capacitação digital para os negócios da plataforma: fotografia com celular, redes sociais,
                atendimento ao turista e gestão básica. O dinheiro que entra no fundo financia esse programa antes de qualquer outra coisa.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: '1º sem.', label: 'Meta de entrega' },
                  { value: '100%',    label: 'Gratuito p/ associados' },
                  { value: 'Gostoso', label: 'Feito por quem é da cidade', teal: true },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
                    <div className={`font-display font-bold text-lg ${s.teal ? 'text-teal' : 'text-white'}`}>
                      {s.value}
                    </div>
                    <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="flex gap-3 pb-4">
          <Link
            to="/cadastre"
            className="inline-flex items-center gap-2 bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-dark transition-colors text-sm"
          >
            Associar meu negócio
          </Link>
        </div>

      </div>
    </main>
  )
}
