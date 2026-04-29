import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { VerbPill } from '@/components/brand/verb-pill'
import { BusinessFilters } from '@/components/business/business-filters'
import { BusinessGrid, type ViewMode } from '@/components/business/business-grid'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useCategories } from '@/hooks/useCategories'
import { isBusinessOpen } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Come() {
  usePageMeta({
    title: 'Restaurantes e Gastronomia',
    description: 'Os melhores restaurantes de São Miguel do Gostoso. Frutos do mar, comida regional e muito sol.',
  })
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [openOnly, setOpenOnly] = useState(false)
  const [search, setSearch] = useState('')
  const { data: categories = [] } = useCategories('come')
  const { data: businesses = [], isLoading } = useBusinesses('come')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return businesses
      .filter(b => !activeCat || b.category?.slug === activeCat)
      .filter(b => !openOnly || isBusinessOpen(b.opening_hours))
      .filter(b => !q || [b.name, b.description ?? '', b.address ?? ''].join(' ').toLowerCase().includes(q))
  }, [businesses, activeCat, openOnly, search])

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
        <div>
          <VerbPill verb="come" />
          <p className="mt-3 text-lg text-[#3D3D3D] max-w-xl leading-relaxed">
            Do peixe frito na praia ao jantar na pousada.<br />Tudo que Gostoso tem pra comer.
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
        search={search} onSearch={setSearch}
      />
      <BusinessGrid businesses={filtered} loading={isLoading} view={view} />
    </main>
  )
}
