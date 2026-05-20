import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Explore from '@/pages/Explore'
import type { Business } from '@/types/database'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'EXPLORE. -- Mapa de São Miguel do Gostoso',
  description: 'Explore restaurantes, pousadas e passeios em São Miguel do Gostoso no mapa interativo.',
}

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: businesses } = await supabase
    .from('gostoso_businesses')
    .select('id, name, slug, lat, lng, cover_url, category_id, is_featured, active, is_published, category:gostoso_categories(*)')
    .eq('active', true)
    .eq('is_published', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  return <Explore initialBusinesses={(businesses ?? []) as unknown as Business[]} />
}
