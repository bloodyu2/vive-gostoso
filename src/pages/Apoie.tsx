import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary, useAssociadosCount } from '@/hooks/useFund'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { CheckCircle, Clock, Globe, Mail, Phone, Smartphone, Zap } from 'lucide-react'

// Custos reais de operação — atualizar manualmente quando mudar
const CUSTOS_ATIVOS = [
  {
    icon: Globe,
    label: 'Domínio vivegostoso.com.br',
    detalhe: 'Registro.br — renovação anual',
    valor_mes: 3.33,    // R$40/ano ÷ 12
    valor_display: 'R$40/ano',
    status: 'ativo' as const,
  },
  {
    icon: Mail,
    label: 'E-mail dedicado',
    detalhe: 'contato@vivegostoso.com.br — GoDaddy',
    valor_mes: 9.90,
    valor_display: 'R$9,90/mês',
    status: 'ativo' as const,
  },
]

const CUSTOS_PLANEJADOS = [
  {
    icon: Phone,
    label: 'Número de telefone dedicado',
    detalhe: 'Atendimento à comunidade e negócios',
    status: 'planejado' as const,
  },
  {
    icon: Smartphone,
    label: 'WhatsApp Business verificado',
    detalhe: 'Canal oficial de suporte e anúncios',
    status: 'planejado' as const,
  },
  {
    icon: Zap,
    label: 'Servidor de produção dedicado',
    detalhe: 'Quando o volume de negócios justificar',
    status: 'planejado' as const,
  },
]

export default function Apoie() {
  const { data: entries = [] } = useFundEntries()
  const { data: summary } = useFundSummary()
  const { data: associadosCount = 0 } = useAssociadosCount()

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
