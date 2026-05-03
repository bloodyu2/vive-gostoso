import { ExploreMap } from '@/components/map/explore-map'
import { useBusinesses } from '@/hooks/useBusinesses'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Explore() {
  usePageMeta({
    title: 'Mapa de Gostoso',
    description: 'Explore o mapa interativo de São Miguel do Gostoso. Encontre restaurantes, pousadas, passeios e muito mais.',
  })
  const { data: businesses = [] } = useBusinesses()
  return (
    <div style={{ height: 'calc(100vh - 70px)' }}>
      <ExploreMap businesses={businesses} />
    </div>
  )
}
