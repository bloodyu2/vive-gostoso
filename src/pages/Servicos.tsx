import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VerbPill } from '@/components/brand/verb-pill'
import { BusinessFilters } from '@/components/business/business-filters'
import { BusinessGrid, type ViewMode } from '@/components/business/business-grid'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useCategories } from '@/hooks/useCategories'
import { isBusinessOpen } from '@/lib/utils'

export default function Servicos() {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [openOnly, setOpenOnly] = useState(false)
  const { data: categories = [] } = useCategories('resolva')
  const { data: businesses = [], isLoading } = useBusinesses('resolva')

  const filtered = businesses
    .filter(b => !activeCat || b.category?.slug === activeCat)
    .filter(b => !openOnly || isBusinessOpen(b.opening_hours))

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
        <div>
          <VerbPill verb="resolva" />
          <p className="mt-3 text-lg text-[#3D3D3D] max-w-xl leading-relaxed">
            Farmácia, lavanderia, mercado, barbearia.<br />Tudo que resolve o seu dia em Gostoso.
          </p>
        </div>
        <Link to="/explore" className="text-teal border-2 border-teal rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-teal-light transition-colors">
          Abrir no mapa
        </Link>
      </div>
      <BusinessFilters
        categories={categories} active={activeCat} onSelect={setActiveCat}
        view={view} onView={setView}
        total={filtered.length}
        openOnly={openOnly} onOpenOnly={setOpenOnly}
      />
      <BusinessGrid businesses={filtered} loading={isLoading} view={view} />
    </main>
  )
}
