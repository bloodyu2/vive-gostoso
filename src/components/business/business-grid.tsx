import { BusinessCard } from './business-card'
import type { Business } from '@/types/database'

export type ViewMode = 'grid' | 'list' | 'gallery'

interface BusinessGridProps {
  businesses: Business[]
  loading?: boolean
  view?: ViewMode
}

export function BusinessGrid({ businesses, loading, view = 'grid' }: BusinessGridProps) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E8E4DF] animate-pulse">
          <div className="aspect-[4/3] bg-[#E8E4DF]" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-[#E8E4DF] rounded w-1/2" />
            <div className="h-5 bg-[#E8E4DF] rounded w-3/4" />
            <div className="h-3 bg-[#E8E4DF] rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )

  if (!businesses.length) return (
    <div className="text-center py-20 text-[#737373]">
      <p className="text-lg">Nenhum negócio encontrado.</p>
    </div>
  )

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {businesses.map(b => <BusinessCard key={b.id} business={b} view="list" />)}
      </div>
    )
  }

  if (view === 'gallery') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {businesses.map(b => <BusinessCard key={b.id} business={b} view="gallery" />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map(b => <BusinessCard key={b.id} business={b} view="grid" />)}
    </div>
  )
}
