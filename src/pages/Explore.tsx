import { ExploreMap } from '@/components/map/explore-map'
import { useBusinesses } from '@/hooks/useBusinesses'

export default function Explore() {
  const { data: businesses = [] } = useBusinesses()
  return (
    <div style={{ height: 'calc(100vh - 70px)' }}>
      <ExploreMap businesses={businesses} />
    </div>
  )
}
