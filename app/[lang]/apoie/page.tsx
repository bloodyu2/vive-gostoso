import type { Metadata } from 'next'
import { getFundEntries } from '@/lib/supabase/queries'
import Apoie from '@/views/Apoie'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'APOIE. -- Fundo Publico de Sao Miguel do Gostoso',
  description: 'Apoie o fundo publico transparente de Sao Miguel do Gostoso. Cada real arrecadado vai para o marketing da cidade.',
  alternates: {
    canonical: 'https://vivegostoso.com.br/apoie',
    languages: {
      'pt-BR': 'https://vivegostoso.com.br/apoie',
      'en': 'https://vivegostoso.com.br/en/apoie',
      'es': 'https://vivegostoso.com.br/es/apoie',
      'x-default': 'https://vivegostoso.com.br/apoie',
    },
  },
  openGraph: {
    title: 'APOIE. -- Fundo Publico de Sao Miguel do Gostoso',
    description: 'Apoie o fundo publico transparente de Sao Miguel do Gostoso. Cada real arrecadado vai para o marketing da cidade.',
    url: 'https://vivegostoso.com.br/apoie',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APOIE. -- Fundo Publico de Sao Miguel do Gostoso',
    description: 'Apoie o fundo publico transparente de Sao Miguel do Gostoso. Cada real arrecadado vai para o marketing da cidade.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default async function ApoiePage() {
  const entries = await getFundEntries()
  return <Apoie initialEntries={entries} />
}
