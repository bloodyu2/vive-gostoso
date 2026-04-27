import { formatCurrency } from '@/lib/utils'

interface FundHeroProps {
  totalCents: number
  marketingCents: number
  operacaoCents: number
  acumuladoCents: number
  associadosCount: number
}

export function FundHero({ totalCents, marketingCents, operacaoCents, acumuladoCents, associadosCount }: FundHeroProps) {
  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return (
    <section className="bg-teal text-white px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs font-medium tracking-widest uppercase opacity-80 mb-3">
          Fundo público transparente · {month}
        </div>
        <h1 className="font-display font-bold text-[80px] leading-none tracking-tight mb-4">APOIE.</h1>
        <p className="text-lg opacity-90 max-w-lg leading-relaxed">
          Todo real arrecadado aqui fica em Gostoso. Veja onde vai cada centavo.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <div className="font-display font-bold text-7xl leading-none tracking-tight">
              {formatCurrency(totalCents)}
            </div>
            <div className="text-sm opacity-85 mt-2">
              arrecadados esse mês · {associadosCount} prestadores associados
            </div>
          </div>
          <div className="self-end">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">80% destinado</span>
              <span className="opacity-80">20% operação</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-ocre rounded-full" />
            </div>
            <p className="text-sm opacity-80 mt-4 leading-relaxed">
              {formatCurrency(marketingCents)} já têm destino — eventos, festivais, divulgação.<br />
              {formatCurrency(operacaoCents)} cobrem domínio, servidor, manutenção. A gente não lucra.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-12">
          {[
            { label: 'Marketing da Cidade', amount: marketingCents, sub: 'Eventos, divulgação, festivais' },
            { label: 'Operação',            amount: operacaoCents,  sub: 'Domínio, servidor, dev' },
            { label: 'Acumulado',           amount: acumuladoCents, sub: 'Próximos projetos' },
          ].map((c, i) => (
            <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
              <div className="text-xs font-medium tracking-widest uppercase opacity-85">{c.label}</div>
              <div className="font-display font-bold text-3xl mt-2">{formatCurrency(c.amount)}</div>
              <div className="text-xs opacity-75 mt-1">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
