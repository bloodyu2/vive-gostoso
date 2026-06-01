// app/[lang]/conheca/page.tsx
import type { Metadata } from 'next'
import Conheca from '@/views/Conheca'

export const metadata: Metadata = {
  title: 'Conheca Sao Miguel do Gostoso',
  description: 'Descubra a historia, praias, como chegar e o melhor de Sao Miguel do Gostoso, RN.',
  openGraph: {
    title: 'Conheca Sao Miguel do Gostoso',
    description: 'Descubra a historia, praias, como chegar e o melhor de Sao Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br/conheca',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conheca Sao Miguel do Gostoso',
    description: 'Descubra a historia, praias, como chegar e o melhor de Sao Miguel do Gostoso, RN.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default function ConhecaPage() {
  return <Conheca />
}
