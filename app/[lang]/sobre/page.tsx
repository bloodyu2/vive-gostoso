// app/[lang]/sobre/page.tsx
import type { Metadata } from 'next'
import Sobre from '@/views/Sobre'

export const metadata: Metadata = {
  title: 'Sobre o Projeto',
  description: 'Conheca o projeto Vive Gostoso e sua missao para Sao Miguel do Gostoso.',
  alternates: {
    canonical: 'https://vivegostoso.com.br/sobre',
    languages: {
      'pt-BR': 'https://vivegostoso.com.br/sobre',
      'en': 'https://vivegostoso.com.br/en/sobre',
      'es': 'https://vivegostoso.com.br/es/sobre',
      'x-default': 'https://vivegostoso.com.br/sobre',
    },
  },
  openGraph: {
    title: 'Sobre o Projeto',
    description: 'Conheca o projeto Vive Gostoso e sua missao para Sao Miguel do Gostoso.',
    url: 'https://vivegostoso.com.br/sobre',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre o Projeto',
    description: 'Conheca o projeto Vive Gostoso e sua missao para Sao Miguel do Gostoso.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default function SobrePage() {
  return <Sobre />
}
