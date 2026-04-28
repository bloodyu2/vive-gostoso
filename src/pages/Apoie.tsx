import { FundHero } from '@/components/fund/fund-hero'
import { FundEntryRow } from '@/components/fund/fund-entry-row'
import { useFundEntries, useFundSummary, useAssociadosCount } from '@/hooks/useFund'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

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
        <div className="flex gap-3 mt-8">
          <Link to="/cadastre">
            <Button variant="primary">Associar meu negócio</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
