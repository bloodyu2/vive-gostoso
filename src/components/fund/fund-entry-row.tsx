import { formatCurrency } from '@/lib/utils'
import type { FundEntry } from '@/types/database'

export function FundEntryRow({ entry: e, last }: { entry: FundEntry; last?: boolean }) {
  const date = new Date(e.entry_date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const isRealizado = e.status === 'realizado'

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${
        !last ? 'border-b border-[#F1ECE6] dark:border-[#2D2D2D]' : ''
      }`}
    >
      {/* Icon dot */}
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          isRealizado ? 'bg-teal' : 'bg-[#D4CFCA]'
        }`}
      />

      {/* Description + date */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-[#1A1A1A] dark:text-white truncate">
          {e.description}
        </div>
        <div className="text-xs text-[#A0A0A0] mt-0.5">{date}</div>
      </div>

      {/* Amount + status */}
      <div className="flex-shrink-0 text-right">
        <div
          className={`font-display font-bold text-base tabular-nums ${
            isRealizado ? 'text-teal' : 'text-[#A0A0A0]'
          }`}
        >
          {formatCurrency(e.amount_cents)}
        </div>
        <div
          className={`text-xs mt-0.5 font-medium ${
            isRealizado ? 'text-teal/70' : 'text-[#B0A89E]'
          }`}
        >
          {isRealizado ? 'Realizado' : 'Programado'}
        </div>
      </div>
    </div>
  )
}
