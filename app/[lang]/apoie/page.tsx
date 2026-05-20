import type { Metadata } from 'next'
import { getFundEntries } from '@/lib/supabase/queries'
import Apoie from '@/pages/Apoie'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'APOIE. -- Fundo Público de São Miguel do Gostoso',
  description: 'Apoie o fundo público transparente de São Miguel do Gostoso. Cada real arrecadado vai para o marketing da cidade.',
}

export default async function ApoiePage() {
  const entries = await getFundEntries()
  return <Apoie initialEntries={entries} />
}
