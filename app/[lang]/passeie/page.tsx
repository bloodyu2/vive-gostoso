import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Passeie from '@/views/Passeie'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'PASSEIE. -- Passeios e Esportes',
  description: 'Kitesurf, windsurf, buggy, tours e esportes nauticos em Sao Miguel do Gostoso, RN.',
  openGraph: {
    title: 'PASSEIE. -- Passeios e Esportes',
    description: 'Kitesurf, windsurf, buggy, tours e esportes nauticos em Sao Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br/passeie',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PASSEIE. -- Passeios e Esportes',
    description: 'Kitesurf, windsurf, buggy, tours e esportes nauticos em Sao Miguel do Gostoso, RN.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default async function PasseiePage() {
  const businesses = await getBusinessesByVerb('passeie')
  return <Passeie initialBusinesses={businesses} />
}
