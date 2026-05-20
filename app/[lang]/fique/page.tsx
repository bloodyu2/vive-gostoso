import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Fique from '@/views/Fique'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'FIQUE. -- Pousadas e Hospedagem',
  description: 'As melhores pousadas e hospedagens em São Miguel do Gostoso, RN.',
}

export default async function FiquePage() {
  const businesses = await getBusinessesByVerb('fique')
  return <Fique initialBusinesses={businesses} />
}
