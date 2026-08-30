import type { Metadata } from 'next'
import Transfer from '@/views/Transfer'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Transfer Sao Miguel do Gostoso | Aeroporto Natal',
  description: 'Transfer do aeroporto de Natal para Sao Miguel do Gostoso. 110 km, ~1h50. Prestadores verificados, preco fixo, direto no WhatsApp.',
  alternates: {
    canonical: 'https://www.vivegostoso.com.br/transfer',
    languages: {
      'pt-BR': 'https://www.vivegostoso.com.br/transfer',
      'en': 'https://www.vivegostoso.com.br/en/transfer',
      'es': 'https://www.vivegostoso.com.br/es/transfer',
      'x-default': 'https://www.vivegostoso.com.br/transfer',
    },
  },
  openGraph: {
    title: 'Transfer Sao Miguel do Gostoso | Aeroporto Natal',
    description: 'Transfer do aeroporto de Natal para Sao Miguel do Gostoso. 110 km, ~1h50. Prestadores verificados, preco fixo, direto no WhatsApp.',
    url: 'https://www.vivegostoso.com.br/transfer',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://www.vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transfer Sao Miguel do Gostoso | Aeroporto Natal',
    description: 'Transfer do aeroporto de Natal para Sao Miguel do Gostoso. 110 km, ~1h50. Prestadores verificados, preco fixo, direto no WhatsApp.',
    images: ['https://www.vivegostoso.com.br/og-image.png'],
  },
}

// Transfer fetches data client-side via useTransfers hook (gostoso_transfers table)
export default function TransferPage() {
  return <Transfer />
}
