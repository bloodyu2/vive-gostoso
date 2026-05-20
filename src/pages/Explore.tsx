'use client'
import dynamic from 'next/dynamic'
import { useBusinesses } from '@/hooks/useBusinesses'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { Business } from '@/types/database'

const ExploreMap = dynamic(
  () => import('@/components/map/explore-map').then((mod) => ({ default: mod.ExploreMap })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 'calc(100vh - 70px)' }}
        className="w-full bg-teal/10 animate-pulse flex items-center justify-center"
      >
        <span className="text-teal font-medium">Carregando mapa...</span>
      </div>
    ),
  }
)

type ExploreProps = {
  initialBusinesses?: Business[]
}

export default function Explore({ initialBusinesses = [] }: ExploreProps) {
  usePageMeta({
    title: 'Mapa de Gostoso',
    description: 'Explore o mapa interativo de São Miguel do Gostoso. Encontre restaurantes, pousadas, passeios e muito mais.',
  })
  const { data: businesses = initialBusinesses } = useBusinesses()
  return (
    <div style={{ height: 'calc(100vh - 70px)' }}>
      <ExploreMap businesses={businesses} />
    </div>
  )
}
