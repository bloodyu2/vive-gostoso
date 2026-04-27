import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VerbPill } from '@/components/brand/verb-pill'
import { BusinessFilters } from '@/components/business/business-filters'
import { BusinessGrid } from '@/components/business/business-grid'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useCategories } from '@/hooks/useCategories'

export default function Come() {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const { data: categories = [] } = useCategories('come')
  const { data: businesses = [], isLoading } = useBusinesses('come')
  const filtered = activeCat ? businesses.filter(b => b.category?.slug === activeCat) : businesses

  return (
    <main className="max-w-6xl mx-auto px-8 py-12">
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
      <BusinessFilters categories={categories} active={activeCat} onSelect={setActiveCat} />
      <BusinessGrid businesses={filtered} loading={isLoading} />
    </main>
  )
}
