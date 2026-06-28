'use client'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { useBusinesses } from '@/hooks/useBusinesses'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { Business } from '@/types/database'

function ExploreMapLoading() {
  const { t } = useTranslation()
  return (
    <div
      className="w-full h-[calc(100dvh-69px)] md:h-[calc(100dvh-77px)] bg-teal/10 animate-pulse flex items-center justify-center"
    >
      <span className="text-teal font-medium">{t('common.carregando')}</span>
    </div>
  )
}

const ExploreMap = dynamic(
  () => import('@/components/map/explore-map').then((mod) => ({ default: mod.ExploreMap })),
  {
    ssr: false,
    loading: () => <ExploreMapLoading />,
  }
)

type ExploreProps = {
  initialBusinesses?: Business[]
}

export default function Explore({ initialBusinesses = [] }: ExploreProps) {
  const { t } = useTranslation()
  usePageMeta({
    title: t('explore.titulo'),
    description: t('explore.desc'),
  })
  const { data: businesses = initialBusinesses } = useBusinesses(undefined, { initialData: initialBusinesses })
  return (
    <div className="h-[calc(100dvh-69px)] md:h-[calc(100dvh-77px)]">
      <ExploreMap businesses={businesses} />
    </div>
  )
}
