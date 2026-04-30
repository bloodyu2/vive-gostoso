import { LayoutGrid, List, Images, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  search: string
  onSearch: (s: string) => void
}

const VIEW_OPTIONS: { v: ViewMode; Icon: React.ElementType; labelKey: string }[] = [
  { v: 'grid',    Icon: LayoutGrid, labelKey: 'filters.grade' },
  { v: 'list',    Icon: List,       labelKey: 'filters.lista' },
  { v: 'gallery', Icon: Images,     labelKey: 'filters.galeria' },
]

export function BusinessFilters({
  categories, active, onSelect,
  view, onView,
  total, openOnly, onOpenOnly,
  search, onSearch,
}: BusinessFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-8 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0A99F] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={t('filters.buscar_placeholder')}
          className="w-full bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl pl-11 pr-10 py-3 text-sm text-[#1A1A1A] dark:text-white placeholder-[#B0A99F] focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0A99F] hover:text-[#737373] transition-colors"
            aria-label={t('filters.limpar_busca')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
        >{t('filters.todos')}</button>

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
            {total} {t(total === 1 ? 'filters.resultado_um' : 'filters.resultado_outros')}
            {search && <span className="ml-1 text-teal font-medium">{t('filters.para_busca', { search })}</span>}
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
            {t('filters.aberto_agora')}
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-xl p-1">
          {VIEW_OPTIONS.map(({ v, Icon, labelKey }) => (
            <button
              key={v}
              onClick={() => onView(v)}
              title={t(labelKey)}
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
