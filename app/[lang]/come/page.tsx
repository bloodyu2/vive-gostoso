import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema } from '@/lib/seo'
import Come from '@/views/Come'

const baseUrl = 'https://vivegostoso.com.br'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'COME. -- Restaurantes e Gastronomia',
  description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
  alternates: {
    canonical: `${baseUrl}/come`,
    languages: {
      'pt-BR': `${baseUrl}/come`,
      'en': `${baseUrl}/en/come`,
      'es': `${baseUrl}/es/come`,
      'x-default': `${baseUrl}/come`,
    },
  },
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
  const jsonLd = itemListSchema({
    name: 'Restaurantes em Sao Miguel do Gostoso',
    description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
    url: `${baseUrl}/come`,
    items: businesses.map(b => ({ name: b.name, url: `${baseUrl}/negocio/${b.slug}` })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Come initialBusinesses={businesses} />
    </>
  )
}
