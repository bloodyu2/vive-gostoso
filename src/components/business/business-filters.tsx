import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface BusinessFiltersProps {
  categories: Category[]
  active: string | null
  onSelect: (slug: string | null) => void
}

export function BusinessFilters({ categories, active, onSelect }: BusinessFiltersProps) {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-150',
          active === null
            ? 'bg-teal text-white border-teal'
            : 'bg-white text-[#3D3D3D] border-[#E8E4DF] hover:bg-areia'
        )}
      >Todos</button>
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-150',
            active === cat.slug
              ? 'bg-teal text-white border-teal'
              : 'bg-white text-[#3D3D3D] border-[#E8E4DF] hover:bg-areia'
          )}
        >{cat.name}</button>
      ))}
    </div>
  )
}
