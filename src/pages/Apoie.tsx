import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary, useAssociadosCount } from '@/hooks/useFund'
import { useGoals } from '@/hooks/useGoals'
import { startDonation } from '@/hooks/useCheckout'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Globe, Mail, Database, Layers, Phone, Smartphone, Zap, Target, Megaphone, Server, Users, Heart } from 'lucide-react'
import type { Goal } from '@/types/database'

// Custos reais de operacao -- atualizar manualmente quando mudar
const CUSTOS_ATIVOS = [
  {
    icon: Globe,
    label: 'Dominio vivegostoso.com.br',
    detalhe: 'Registro.br -- renovacao anual',
    valor_mes: 3.33,
    valor_display: 'R$40/ano',
    status: 'ativo' as const,
  },
  {
    icon: Layers,
    label: 'Hospedagem Vercel (Pro)',
    detalhe: 'Deploy, CDN global, previews e analytics',
    valor_mes: 118.00,
    valor_display: '~R$118/mês (USD 20)',
    status: 'ativo' as const,
  },
  {
    icon: Database,
    label: 'Banco de dados Supabase (Pro)',
    detalhe: 'PostgreSQL + Auth + Storage + Edge Functions',
    valor_mes: 148.00,
    valor_display: '~R$148/mês (USD 25)',
    status: 'ativo' as const,
  },
  {
    icon: Mail,
    label: 'E-mail dedicado',
    detalhe: 'contato@vivegostoso.com.br',
    valor_mes: 9.90,
    valor_display: 'R$9,90/mes',
    status: 'ativo' as const,
  },
]

const CUSTOS_PLANEJADOS = [
  {
    icon: Phone,
    label: 'Numero de telefone dedicado',
    detalhe: 'Atendimento a comunidade e negocios',
    status: 'planejado' as const,
  },
  {
    icon: Smartphone,
    label: 'WhatsApp Business verificado',
    detalhe: 'Canal oficial de suporte e anuncios',
    status: 'planejado' as const,
  },
  {
    icon: Zap,
    label: 'Ferramentas de marketing digital',
    detalhe: 'Quando a arrecadacao justificar -- email marketing, ads locais',
    status: 'planejado' as const,
  },
  {
    icon: Server,
    label: 'Midia social e conteudo',
    detalhe: 'Producao de fotos e videos dos negocios da cidade',
    status: 'planejado' as const,
  },
]

const DONATION_PRESETS = [25, 50, 100, 250]

const GOAL_ICONS: Record<Goal['category'], React.ElementType> = {
  comunidade: Users,
  operacao: Phone,
  marketing: Megaphone,
  infraestrutura: Server,
}

const GOAL_COLORS: Record<Goal['category'], { bg: string; text: string; border: string }> = {
  comunidade: { bg: 'bg-teal-light', text: 'text-teal', border: 'border-teal/20' },
  operacao:   { bg: 'bg-ocre/10',    text: 'text-ocre',  border: 'border-ocre/20' },
  marketing:  { bg: 'bg-coral/10',   text: 'text-coral', border: 'border-coral/20' },
  infraestrutura: { bg: 'bg-[#E8E4DF]', text: 'text-[#737373]', border: 'border-[#D4CFCA]' },
}

const STATUS_LABELS: Record<Goal['status'], string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Apoie() {
  usePageMeta({
    title: 'Apoie Gostoso',
    description: 'Fundo público transparente para promover São Miguel do Gostoso. Veja como o dinheiro é usado.',
  })
  const [searchParams] = useSearchParams()
  const donationSuccess = searchParams.get('doacao') === 'success'

  const { data: entries = [] } = useFundEntries()
  const { data: summary } = useFundSummary()
  const { data: associadosCount = 0 } = useAssociadosCount()
  const { data: goals = [] } = useGoals()

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donationLoading, setDonationLoading] = useState(false)
  const [donationError, setDonationError] = useState<string | null>(null)

  const effectiveAmountBRL = selectedPreset ?? (customAmount ? parseFloat(customAmount.replace(',', '.')) : null)

  async function handleDonate() {
    if (!effectiveAmountBRL || effectiveAmountBRL < 5) {
      setDonationError('Valor mínimo de R$5,00.')
      return
    }
    const amountCents = Math.round(effectiveAmountBRL * 100)
    setDonationLoading(true)
    setDonationError(null)
    try {
      await startDonation(amountCents)
    } catch (err) {
      setDonationError(err instanceof Error ? err.message : 'Erro ao processar doação. Tente novamente.')
      setDonationLoading(false)
    }
  }

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
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-16">

        {/* Donation success banner */}
        {donationSuccess && (
          <div className="mb-8 bg-teal/10 border border-teal/20 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">💚</span>
            <div>
              <p className="font-semibold text-teal">Doação confirmada — obrigado!</p>
              <p className="text-sm text-teal/80 mt-0.5">Cada real fica em Gostoso e vai direto para a plataforma.</p>
            </div>
          </div>
        )}

        {/* ── Donation widget ── */}
        <div className="mb-16 bg-white border border-[#E8E4DF] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Heart className="w-5 h-5 text-coral" />
            <h2 className="font-display font-semibold text-2xl">Doe para a plataforma</h2>
          </div>
          <p className="text-sm text-[#737373] mb-6">
            Qualquer valor, sem mensalidade. Cartão, PIX ou boleto — tudo fica em Gostoso.
          </p>

          {/* Preset amounts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DONATION_PRESETS.map(val => (
              <button
                key={val}
                onClick={() => { setSelectedPreset(val); setCustomAmount('') }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  selectedPreset === val
                    ? 'bg-coral text-white border-coral'
                    : 'bg-white text-[#3D3D3D] border-[#E8E4DF] hover:border-coral hover:text-coral'
                }`}
              >
                R${val}
              </button>
            ))}
            <button
              onClick={() => setSelectedPreset(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                selectedPreset === null && customAmount
                  ? 'bg-coral text-white border-coral'
                  : 'bg-white text-[#3D3D3D] border-[#E8E4DF] hover:border-coral hover:text-coral'
              }`}
            >
              Outro valor
            </button>
          </div>

          {/* Custom amount input */}
          {selectedPreset === null && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-[#737373]">R$</span>
              <input
                type="number"
                min={5}
                step={1}
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="Quanto você quer doar?"
                className="flex-1 border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-coral transition-colors"
              />
            </div>
          )}

          {donationError && (
            <p className="text-sm text-red-500 mb-4">{donationError}</p>
          )}

          <button
            onClick={handleDonate}
            disabled={donationLoading || !effectiveAmountBRL || (effectiveAmountBRL ?? 0) < 5}
            className="w-full sm:w-auto bg-coral text-white font-semibold px-8 py-3 rounded-xl hover:bg-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            {donationLoading
              ? 'Redirecionando...'
              : effectiveAmountBRL && effectiveAmountBRL >= 5
              ? `Doar R$${effectiveAmountBRL.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
              : 'Escolha um valor'}
          </button>
          <p className="text-xs text-[#A0A0A0] mt-3">Pagamento seguro via Stripe. Sem vínculo de mensalidade.</p>
        </div>

        {entries.length > 0 ? (
          <>
            <h2 className="font-display font-semibold text-3xl mb-2">Movimentações</h2>
            <p className="text-[#737373] text-sm mb-8">Cada real que entra ou sai. Auditável. Público.</p>
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl overflow-hidden">
              {entries.map((e, i) => (
                <FundEntryRow key={e.id} entry={e} last={i === entries.length - 1} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-[#737373]">
            <p className="text-base">Nenhuma movimentação registrada ainda.</p>
            <p className="text-sm mt-1">Quando os primeiros associados confirmarem, o extrato aparece aqui.</p>
          </div>
        )}

        <div className="mt-8 p-6 bg-ocre-light border-l-4 border-ocre rounded-xl">
          <p className="m-0 italic text-[#3D3D3D] leading-relaxed">
            Cada real que entra aqui fica em Gostoso. Auditável. Público.
          </p>
        </div>

        {/* APRENDE — destaque do primeiro semestre */}
        <div className="mt-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-2xl p-6 md:p-8">
            {/* Background dot pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-teal text-white text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Objetivo 1º semestre
                </span>
              </div>
              <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
                Programa APRENDE
              </h3>
              <p className="text-white/70 text-base leading-relaxed max-w-xl mb-6">
                Capacitação digital para todos os negócios da plataforma: fotografia com celular, redes sociais, atendimento ao turista e gestão básica.
                O dinheiro que entra no fundo financia esse programa antes de qualquer outra coisa.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
                  <div className="font-display font-bold text-white text-xl">1º sem.</div>
                  <div className="text-white/50 text-xs mt-0.5">Meta de entrega</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
                  <div className="font-display font-bold text-white text-xl">100%</div>
                  <div className="text-white/50 text-xs mt-0.5">Gratuito p/ associados</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
                  <div className="font-display font-bold text-teal text-xl">Gostoso</div>
                  <div className="text-white/50 text-xs mt-0.5">Feito por quem é da cidade</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos e metas */}
        {goals.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-teal" />
              <h2 className="font-display font-semibold text-3xl">Para onde vai o dinheiro</h2>
            </div>
            <p className="text-[#737373] text-sm mb-8 max-w-xl">
              Estas são as metas concretas que a arrecadação vai financiar. Sem devaneios, sem promessas vazias.
            </p>
            <div className="space-y-4">
              {goals.map((goal) => {
                const Icon = GOAL_ICONS[goal.category]
                const colors = GOAL_COLORS[goal.category]
                const pct = goal.target_cents > 0
                  ? Math.min(100, Math.round((goal.raised_cents / goal.target_cents) * 100))
                  : 0
                const isConcluido = goal.status === 'concluido'
                const isEmAndamento = goal.status === 'em_andamento'
                return (
                  <div
                    key={goal.id}
                    className={`bg-white dark:bg-[#1C1C1C] border ${colors.border} rounded-2xl px-5 py-5 ${isConcluido ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white leading-snug">{goal.title}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isConcluido
                              ? 'bg-teal-light text-teal'
                              : isEmAndamento
                              ? 'bg-ocre/10 text-ocre'
                              : 'bg-[#E8E4DF] text-[#737373]'
                          }`}>
                            {STATUS_LABELS[goal.status]}
                          </span>
                          {goal.target_date && (
                            <span className="text-xs text-[#A0A0A0]">
                              Meta: {new Date(goal.target_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-xs text-[#737373] leading-relaxed mb-3">{goal.description}</p>
                        )}
                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#E8E4DF] dark:bg-[#333] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isConcluido ? 'bg-teal' : isEmAndamento ? 'bg-ocre' : 'bg-[#D4CFCA]'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#737373] flex-shrink-0 tabular-nums">
                            {formatCurrency(goal.raised_cents)} / {formatCurrency(goal.target_cents)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Custos reais de operação */}
        <div className="mt-16">
          <h2 className="font-display font-semibold text-3xl mb-2">O que custa manter isso</h2>
          <p className="text-[#737373] text-sm mb-8 max-w-xl">
            Transparência total: estes são os custos reais de operação da plataforma. Nada oculto, nenhum centavo de lucro.
          </p>

          {/* Ativos */}
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#737373] mb-4 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-teal" /> Em operação
          </h3>
          <div className="space-y-3 mb-10">
            {CUSTOS_ATIVOS.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.label} className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A]">{c.label}</div>
                    <div className="text-xs text-[#737373] mt-0.5">{c.detalhe}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-sm text-teal">{c.valor_display}</div>
                    <div className="text-xs text-[#737373] mt-0.5">≈ R${c.valor_mes.toFixed(2).replace('.', ',')}/mês</div>
                  </div>
                </div>
              )
            })}

            {/* Total */}
            <div className="bg-[#F5F2EE] dark:bg-[#222] rounded-2xl px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1A]">Total atual/mês</span>
              <span className="font-display font-bold text-lg text-teal">
                R${CUSTOS_ATIVOS.reduce((s, c) => s + c.valor_mes, 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Planejados */}
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#737373] mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-ocre" /> Planejado — quando a arrecadação permitir
          </h3>
          <div className="space-y-3">
            {CUSTOS_PLANEJADOS.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.label} className="bg-white dark:bg-[#1C1C1C] border border-dashed border-[#D4CFCA] dark:border-[#333] rounded-2xl px-5 py-4 flex items-center gap-4 opacity-70">
                  <div className="w-10 h-10 rounded-xl bg-ocre/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-ocre" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A]">{c.label}</div>
                    <div className="text-xs text-[#737373] mt-0.5">{c.detalhe}</div>
                  </div>
                  <div className="text-xs font-medium text-ocre bg-ocre/10 px-3 py-1 rounded-full flex-shrink-0">
                    Em breve
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 mt-10">
          <Link to="/cadastre">
            <Button variant="primary">Associar meu negócio</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
