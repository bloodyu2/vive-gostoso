import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Fique from '@/views/Fique'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'FIQUE. -- Pousadas e Hospedagem',
  description: 'As melhores pousadas e hospedagens em Sao Miguel do Gostoso, RN.',
  openGraph: {
    title: 'FIQUE. -- Pousadas e Hospedagem',
    description: 'As melhores pousadas e hospedagens em Sao Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br/fique',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIQUE. -- Pousadas e Hospedagem',
    description: 'As melhores pousadas e hospedagens em Sao Miguel do Gostoso, RN.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default async function FiquePage() {
  const businesses = await getBusinessesByVerb('fique')
  return <Fique initialBusinesses={businesses} />
}
