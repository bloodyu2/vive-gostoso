import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema } from '@/lib/seo'
import Fique from '@/views/Fique'

const baseUrl = 'https://vivegostoso.com.br'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'FIQUE. -- Pousadas e Hospedagem',
  description: 'As melhores pousadas e hospedagens em Sao Miguel do Gostoso, RN.',
  alternates: {
    canonical: `${baseUrl}/fique`,
    languages: {
      'pt-BR': `${baseUrl}/fique`,
      'en': `${baseUrl}/en/fique`,
      'es': `${baseUrl}/es/fique`,
      'x-default': `${baseUrl}/fique`,
    },
  },
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
  const jsonLd = itemListSchema({
    name: 'Pousadas em Sao Miguel do Gostoso',
    description: 'As melhores pousadas e hospedagens em Sao Miguel do Gostoso, RN.',
    url: `${baseUrl}/fique`,
    items: businesses.map(b => ({ name: b.name, url: `${baseUrl}/negocio/${b.slug}` })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Fique initialBusinesses={businesses} />
    </>
  )
}
