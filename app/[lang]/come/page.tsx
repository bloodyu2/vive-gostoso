import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Come from '@/views/Come'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'COME. -- Restaurantes e Gastronomia',
  description: 'Restaurantes, bares e experiências gastronômicas em São Miguel do Gostoso, RN.',
}

export default async function ComePage() {
  const businesses = await getBusinessesByVerb('come')
  return <Come initialBusinesses={businesses} />
}
