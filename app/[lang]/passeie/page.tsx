import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Passeie from '@/views/Passeie'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'PASSEIE. -- Passeios e Esportes',
  description: 'Kitesurf, windsurf, buggy, tours e esportes náuticos em São Miguel do Gostoso, RN.',
}

export default async function PasseiePage() {
  const businesses = await getBusinessesByVerb('passeie')
  return <Passeie initialBusinesses={businesses} />
}
