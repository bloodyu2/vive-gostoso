import { SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BusinessCard } from './business-card'
import { BlurFade } from '@/components/magicui/blur-fade'
import type { Business } from '@/types/database'

export type ViewMode = 'grid' | 'list' | 'gallery'

interface BusinessGridProps {
  businesses: Business[]
  loading?: boolean
  view?: ViewMode
  /** Clears whatever combination of category/search/"aberto agora" filters produced zero results. */
  onResetFilters?: () => void
}

export function BusinessGrid({ businesses, loading, view = 'grid', onResetFilters }: BusinessGridProps) {
  const { t } = useTranslation()

  if (loading) return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-busy="true"
      aria-label={t('filters.carregando')}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-[#E8E4DF] dark:border-border-1 animate-pulse">
          <div className="aspect-[4/3] bg-[#E8E4DF] dark:bg-[#2D2D2D]" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-[#E8E4DF] dark:bg-[#2D2D2D] rounded w-1/2" />
            <div className="h-5 bg-[#E8E4DF] dark:bg-[#2D2D2D] rounded w-3/4" />
            <div className="h-3 bg-[#E8E4DF] dark:bg-[#2D2D2D] rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )

  if (!businesses.length) return (
    <div className="text-center py-20" role="status">
      <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-6 h-6 text-teal" aria-hidden="true" />
      </div>
      <h3 className="font-display font-semibold text-lg text-fg-1 mb-1.5">{t('filters.nenhum_negocio')}</h3>
      <p className="text-sm text-fg-3-texto max-w-xs mx-auto leading-relaxed">
        Tente remover algum filtro ou buscar por outro termo.
      </p>
      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-5 bg-teal text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {businesses.map((b, i) => (
          <BlurFade key={b.id}>
            <BusinessCard business={b} view="list" acimaDaDobra={i < 2} />
          </BlurFade>
        ))}
      </div>
    )
  }

  if (view === 'gallery') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {businesses.map((b, i) => (
          <BlurFade key={b.id} delay={(i % 4) * 60} className="h-full">
            <BusinessCard business={b} view="gallery" acimaDaDobra={i < 4} />
          </BlurFade>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((b, i) => (
        <BlurFade key={b.id} delay={(i % 3) * 70} className="h-full">
          <BusinessCard business={b} view="grid" acimaDaDobra={i < 3} />
        </BlurFade>
      ))}
    </div>
  )
}
