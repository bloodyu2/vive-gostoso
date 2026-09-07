import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { getBusinessesForMap } from '@/lib/supabase/queries'
import Explore from '@/views/Explore'
import type { Business } from '@/types/database'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('explore', lang as Locale)
}

export default async function ExplorePage() {
  const businesses = await getBusinessesForMap()
  return <Explore initialBusinesses={businesses as unknown as Business[]} />
}
