import type { Metadata } from 'next'
import Participe from '@/views/Participe'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'PARTICIPE. -- Eventos em Sao Miguel do Gostoso',
  description: 'Festivais, eventos culturais e agenda completa de Sao Miguel do Gostoso, RN.',
  openGraph: {
    title: 'PARTICIPE. -- Eventos em Sao Miguel do Gostoso',
    description: 'Festivais, eventos culturais e agenda completa de Sao Miguel do Gostoso, RN.',
    url: 'https://vivegostoso.com.br/participe',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PARTICIPE. -- Eventos em Sao Miguel do Gostoso',
    description: 'Festivais, eventos culturais e agenda completa de Sao Miguel do Gostoso, RN.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default function ParticipePage() {
  return <Participe />
}
