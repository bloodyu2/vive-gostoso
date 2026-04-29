import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VerbPill } from '@/components/brand/verb-pill'
import { BusinessFilters } from '@/components/business/business-filters'
import { BusinessGrid, type ViewMode } from '@/components/business/business-grid'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useCategories } from '@/hooks/useCategories'
import { usePageMeta } from '@/hooks/usePageMeta'
import { isBusinessOpen } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function Servicos() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  usePageMeta({
    title: 'Comércio e Serviços em Gostoso',
    description: 'Farmácia, lavanderia, mercado, barbearia e tudo que resolve o seu dia em São Miguel do Gostoso.',
  })
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [openOnly, setOpenOnly] = useState(false)
  const [search, setSearch] = useState('')
  const { data: categories = [] } = useCategories('resolva')
  const { data: businesses = [], isLoading } = useBusinesses('resolva')

  const filtered = businesses
    .filter(b => !activeCat || b.category?.slug === activeCat)
    .filter(b => !openOnly || isBusinessOpen(b.opening_hours))
    .filter(b => {
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return (
        b.name?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q)
      )
    })

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
        <div>
          <VerbPill verb="resolva" />
          <p className="mt-3 text-lg text-[#3D3D3D] max-w-xl leading-relaxed">
            {t('resolva.desc')}
          </p>
        </div>
        <Link to={lp('/explore')} className="text-teal border-2 border-teal rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-teal-light transition-colors">
          {t('resolva.abrir_mapa')}
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
