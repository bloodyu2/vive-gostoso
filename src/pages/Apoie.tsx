import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary } from '@/hooks/useFund'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Apoie() {
  const { data: entries = [] } = useFundEntries()
  const { data: summary } = useFundSummary()

  return (
    <main>
      <FundHero
        totalCents={summary?.totalCents ?? 0}
        marketingCents={summary?.marketingCents ?? 0}
        operacaoCents={summary?.operacaoCents ?? 0}
        acumuladoCents={summary?.acumuladoCents ?? 0}
        associadosCount={14}
      />
      <section className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="font-display font-semibold text-3xl mb-2">Movimentações</h2>
        <p className="text-[#737373] text-sm mb-8">Cada real que entra ou sai. Auditável. Público.</p>
        <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
          {entries.map((e, i) => (
            <FundEntryRow key={e.id} entry={e} last={i === entries.length - 1} />
          ))}
        </div>
        <div className="mt-8 p-6 bg-ocre-light border-l-4 border-ocre rounded-xl">
          <p className="m-0 italic text-[#3D3D3D] leading-relaxed">
            Cada real que entra aqui fica em Gostoso. Auditável. Público.
          </p>
        </div>
        <div className="flex gap-3 mt-8">
          <Link to="/cadastre">
            <Button variant="primary">Associar meu negócio</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
