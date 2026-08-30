// app/[lang]/sobre/page.tsx
import type { Metadata } from 'next'
import Sobre from '@/views/Sobre'

export const metadata: Metadata = {
  title: 'Sobre o Projeto',
  description: 'Conheca o projeto Vive Gostoso e sua missao para Sao Miguel do Gostoso.',
  alternates: {
    canonical: 'https://www.vivegostoso.com.br/sobre',
    languages: {
      'pt-BR': 'https://www.vivegostoso.com.br/sobre',
      'en': 'https://www.vivegostoso.com.br/en/sobre',
      'es': 'https://www.vivegostoso.com.br/es/sobre',
      'x-default': 'https://www.vivegostoso.com.br/sobre',
    },
  },
  openGraph: {
    title: 'Sobre o Projeto',
    description: 'Conheca o projeto Vive Gostoso e sua missao para Sao Miguel do Gostoso.',
    url: 'https://www.vivegostoso.com.br/sobre',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://www.vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre o Projeto',
    description: 'Conheca o projeto Vive Gostoso e sua missao para Sao Miguel do Gostoso.',
    images: ['https://www.vivegostoso.com.br/og-image.png'],
  },
}

export default function SobrePage() {
  return <Sobre />
}
