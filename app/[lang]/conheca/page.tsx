// app/[lang]/conheca/page.tsx
import type { Metadata } from 'next'
import { citySchema } from '@/lib/seo'
import Conheca from '@/views/Conheca'

const baseUrl = 'https://vivegostoso.com.br'

export const metadata: Metadata = {
  title: 'Conheca Sao Miguel do Gostoso: Praias, Como Chegar, Gastronomia e Mais',
  description: 'Guia completo de Sao Miguel do Gostoso, RN. 8 praias paradisiacas, como chegar, gastronomia, kitesurf, eventos e dicas de morador.',
  alternates: {
    canonical: `${baseUrl}/conheca`,
    languages: {
      'pt-BR': `${baseUrl}/conheca`,
      'en': `${baseUrl}/en/conheca`,
      'es': `${baseUrl}/es/conheca`,
      'x-default': `${baseUrl}/conheca`,
    },
  },
  openGraph: {
    title: 'Conheca Sao Miguel do Gostoso: Praias, Como Chegar, Gastronomia',
    description: 'Guia completo de Sao Miguel do Gostoso, RN. 8 praias paradisiacas, como chegar, gastronomia, kitesurf, eventos e dicas de morador.',
    url: 'https://vivegostoso.com.br/conheca',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conheca Sao Miguel do Gostoso',
    description: 'Guia completo de Sao Miguel do Gostoso, RN. 8 praias paradisiacas, como chegar, gastronomia e mais.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default function ConhecaPage() {
  const jsonLd = citySchema()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Conheca />
    </>
  )
}
