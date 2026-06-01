import type { Metadata } from 'next'
import { getBusinessesForMap } from '@/lib/supabase/queries'
import Explore from '@/views/Explore'
import type { Business } from '@/types/database'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'EXPLORE. -- Mapa de Sao Miguel do Gostoso',
  description: 'Explore restaurantes, pousadas e passeios em Sao Miguel do Gostoso no mapa interativo.',
  openGraph: {
    title: 'EXPLORE. -- Mapa de Sao Miguel do Gostoso',
    description: 'Explore restaurantes, pousadas e passeios em Sao Miguel do Gostoso no mapa interativo.',
    url: 'https://vivegostoso.com.br/explore',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EXPLORE. -- Mapa de Sao Miguel do Gostoso',
    description: 'Explore restaurantes, pousadas e passeios em Sao Miguel do Gostoso no mapa interativo.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default async function ExplorePage() {
  const businesses = await getBusinessesForMap()
  return <Explore initialBusinesses={businesses as unknown as Business[]} />
}
