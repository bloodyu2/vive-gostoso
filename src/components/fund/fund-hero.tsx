import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface FundHeroProps {
  totalCents: number
  marketingCents: number
  operacaoCents: number
  acumuladoCents: number
  associadosCount: number
  hasEntries: boolean
}

export function FundHero({
  totalCents, marketingCents, operacaoCents, acumuladoCents,
  associadosCount, hasEntries,
}: FundHeroProps) {
  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <section className="bg-teal text-white px-5 md:px-8 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs font-medium tracking-widest uppercase opacity-80 mb-3">
          Fundo público transparente · {month}
        </div>
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-[80px] leading-none tracking-tight mb-4">
          APOIE.
        </h1>
        <p className="text-base md:text-lg opacity-90 max-w-lg leading-relaxed">
          Todo real arrecadado aqui fica em Gostoso. Cada centavo é público e auditável.
        </p>

        {!hasEntries ? (
          // Honest launch state
          <div className="mt-10 md:mt-12 bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl">
            <div className="text-3xl font-display font-bold mb-3">Plataforma em lançamento</div>
            <p className="opacity-85 leading-relaxed mb-6">
              O fundo ainda não tem movimentações registradas. A plataforma está sendo apresentada
              aos primeiros negócios de Gostoso. Quando os primeiros associados confirmarem,
              tudo aparece aqui em tempo real.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="font-display font-bold text-2xl">{associadosCount}</div>
                <div className="text-xs opacity-75 mt-0.5">associados</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="font-display font-bold text-2xl">80%</div>
                <div className="text-xs opacity-75 mt-0.5">vai para a cidade</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <div className="font-display font-bold text-2xl">0%</div>
                <div className="text-xs opacity-75 mt-0.5">de lucro</div>
              </div>
            </div>
            <Link
              to="/cadastre"
              className="inline-block mt-6 bg-white text-teal font-semibold text-sm px-6 py-3 rounded-full hover:bg-teal-light transition-colors"
            >
              Associe seu negócio: seja o primeiro
            </Link>
          </div>
        ) : (
          // Normal state with real data
          <>
            <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <div>
                <div className="font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-none tracking-tight">
                  {formatCurrency(totalCents)}
                </div>
                <div className="text-sm opacity-85 mt-2">
                  arrecadados esse mês · {associadosCount} negócio{associadosCount !== 1 ? 's' : ''} associado{associadosCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="self-start md:self-end">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">80% destinado</span>
                  <span className="opacity-80">20% operação</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-ocre rounded-full" />
                </div>
                <p className="text-sm opacity-80 mt-4 leading-relaxed">
                  {formatCurrency(marketingCents)} já têm destino: eventos, festivais, divulgação.<br />
                  {formatCurrency(operacaoCents)} cobrem domínio, servidor, manutenção. A gente não lucra.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-10 md:mt-12">
              {[
                { label: 'Marketing da Cidade', amount: marketingCents, sub: 'Eventos, divulgação, festivais' },
                { label: 'Operação',            amount: operacaoCents,  sub: 'Domínio, servidor, dev' },
                { label: 'Acumulado',           amount: acumuladoCents, sub: 'Próximos projetos' },
              ].map((c, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                  <div className="text-xs font-medium tracking-widest uppercase opacity-85">{c.label}</div>
                  <div className="font-display font-bold text-2xl md:text-3xl mt-2">{formatCurrency(c.amount)}</div>
                  <div className="text-xs opacity-75 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
