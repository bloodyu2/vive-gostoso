import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { FundEntry } from '@/types/database'

export function FundEntryRow({ entry: e, last }: { entry: FundEntry; last?: boolean }) {
  const date = new Date(e.entry_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return (
    <div className={`grid grid-cols-[32px_1fr_auto_auto] gap-4 items-center px-5 py-4 ${!last ? 'border-b border-[#F1ECE6]' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-ocre-light text-ocre flex items-center justify-center text-xs font-bold">
        R$
      </div>
      <div>
        <div className="font-semibold text-[15px]">{e.description}</div>
        <div className="text-xs text-[#737373]">{date}</div>
      </div>
      <div className="font-display font-bold text-xl text-teal">{formatCurrency(e.amount_cents)}</div>
      <div>
        {e.status === 'realizado'
          ? <Badge kind="open" dot>Realizado</Badge>
          : <Badge kind="cat">Programado</Badge>}
      </div>
    </div>
  )
}
