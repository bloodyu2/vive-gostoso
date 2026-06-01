import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Come from '@/views/Come'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'COME. -- Restaurantes e Gastronomia',
  description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
  openGraph: {
    title: 'COME. -- Restaurantes e Gastronomia',
    description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br/come',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COME. -- Restaurantes e Gastronomia',
    description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default async function ComePage() {
  const businesses = await getBusinessesByVerb('come')
  return <Come initialBusinesses={businesses} />
}
