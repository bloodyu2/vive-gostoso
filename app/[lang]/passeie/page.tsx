import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema } from '@/lib/seo'
import Passeie from '@/views/Passeie'

const baseUrl = 'https://vivegostoso.com.br'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'PASSEIE. -- Passeios e Esportes',
  description: 'Kitesurf, windsurf, buggy, tours e esportes nauticos em Sao Miguel do Gostoso, RN.',
  alternates: {
    canonical: `${baseUrl}/passeie`,
    languages: {
      'pt-BR': `${baseUrl}/passeie`,
      'en': `${baseUrl}/en/passeie`,
      'es': `${baseUrl}/es/passeie`,
      'x-default': `${baseUrl}/passeie`,
    },
  },
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
  const jsonLd = itemListSchema({
    name: 'Passeios em Sao Miguel do Gostoso',
    description: 'Kitesurf, windsurf, buggy, tours e esportes nauticos em Sao Miguel do Gostoso, RN.',
    url: `${baseUrl}/passeie`,
    items: businesses.map(b => ({ name: b.name, url: `${baseUrl}/negocio/${b.slug}` })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Passeie initialBusinesses={businesses} />
    </>
  )
}
