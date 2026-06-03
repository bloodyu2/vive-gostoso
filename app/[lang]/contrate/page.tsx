import type { Metadata } from 'next'
import Contrate from '@/views/Contrate'

export const metadata: Metadata = {
  title: 'CONTRATE. -- Profissionais e Empresas em Sao Miguel do Gostoso',
  description: 'Contrate profissionais e empresas de servico em Sao Miguel do Gostoso, RN. Encontre autonomos, agencias e vagas de emprego.',
  alternates: {
    canonical: 'https://vivegostoso.com.br/contrate',
    languages: {
      'pt-BR': 'https://vivegostoso.com.br/contrate',
      'en': 'https://vivegostoso.com.br/en/contrate',
      'es': 'https://vivegostoso.com.br/es/contrate',
      'x-default': 'https://vivegostoso.com.br/contrate',
    },
  },
  openGraph: {
    title: 'CONTRATE. -- Profissionais e Empresas em Sao Miguel do Gostoso',
    description: 'Contrate profissionais e empresas de servico em Sao Miguel do Gostoso, RN. Encontre autonomos, agencias e vagas de emprego.',
    url: 'https://vivegostoso.com.br/contrate',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CONTRATE. -- Profissionais e Empresas em Sao Miguel do Gostoso',
    description: 'Contrate profissionais e empresas de servico em Sao Miguel do Gostoso, RN. Encontre autonomos, agencias e vagas de emprego.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default function ContratePage() {
  return <Contrate />
}
