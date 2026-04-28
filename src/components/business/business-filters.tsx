import { LayoutGrid, List, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'
import type { ViewMode } from './business-grid'

interface BusinessFiltersProps {
  categories: Category[]
  active: string | null
  onSelect: (slug: string | null) => void
  view: ViewMode
  onView: (v: ViewMode) => void
  total: number
  openOnly: boolean
  onOpenOnly: (v: boolean) => void
}

const VIEW_OPTIONS: { v: ViewMode; Icon: React.ElementType; label: string }[] = [
  { v: 'grid',    Icon: LayoutGrid, label: 'Grade' },
  { v: 'list',    Icon: List,       label: 'Lista' },
  { v: 'gallery', Icon: Images,     label: 'Galeria' },
]

export function BusinessFilters({
  categories, active, onSelect,
  view, onView,
  total, openOnly, onOpenOnly,
}: BusinessFiltersProps) {
  return (
    <div className="mb-8 space-y-3">
      {/* Row 1: category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-150 flex-shrink-0',
            active === null
              ? 'bg-teal text-white border-teal'
              : 'bg-white dark:bg-[#1C1C1C] text-[#3D3D3D] dark:text-[#C0BCB8] border-[#E8E4DF] dark:border-[#2D2D2D] hover:bg-areia dark:hover:bg-[#2D2D2D]'
          )}
        >Todos</button>

        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-150 flex-shrink-0',
              active === cat.slug
                ? 'bg-teal text-white border-teal'
                : 'bg-white dark:bg-[#1C1C1C] text-[#3D3D3D] dark:text-[#C0BCB8] border-[#E8E4DF] dark:border-[#2D2D2D] hover:bg-areia dark:hover:bg-[#2D2D2D]'
            )}
          >{cat.name}</button>
        ))}
      </div>

      {/* Row 2: result count + aberto agora + view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#737373]">
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </span>

          <button
            onClick={() => onOpenOnly(!openOnly)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              openOnly
                ? 'bg-[#3D8B5A] text-white border-[#3D8B5A]'
                : 'bg-white dark:bg-[#1C1C1C] text-[#737373] border-[#E8E4DF] dark:border-[#2D2D2D] hover:bg-areia dark:hover:bg-[#2D2D2D]'
            )}
          >
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              openOnly ? 'bg-white' : 'bg-[#3D8B5A]'
            )} />
            Aberto agora
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-xl p-1">
          {VIEW_OPTIONS.map(({ v, Icon, label }) => (
            <button
              key={v}
              onClick={() => onView(v)}
              title={label}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                view === v
                  ? 'bg-teal text-white'
                  : 'text-[#737373] hover:bg-areia dark:hover:bg-[#2D2D2D]'
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
