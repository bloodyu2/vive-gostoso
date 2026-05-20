import type { Metadata } from 'next'
import { getBusinessesForMap } from '@/lib/supabase/queries'
import Explore from '@/pages/Explore'
import type { Business } from '@/types/database'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'EXPLORE. -- Mapa de São Miguel do Gostoso',
  description: 'Explore restaurantes, pousadas e passeios em São Miguel do Gostoso no mapa interativo.',
}

export default async function ExplorePage() {
  const businesses = await getBusinessesForMap()
  return <Explore initialBusinesses={businesses as unknown as Business[]} />
}
