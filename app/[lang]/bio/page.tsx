// app/[lang]/bio/page.tsx
import type { Metadata } from 'next'
import Bio from '@/views/Bio'

export const metadata: Metadata = {
  title: 'Bio -- Vive Gostoso',
  description: 'Links e recursos oficiais do Vive Gostoso no Instagram e redes sociais.',
  openGraph: {
    title: 'Bio -- Vive Gostoso',
    description: 'Links e recursos oficiais do Vive Gostoso no Instagram e redes sociais.',
    url: 'https://vivegostoso.com.br/bio',
    siteName: 'Vive Gostoso',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://vivegostoso.com.br/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bio -- Vive Gostoso',
    description: 'Links e recursos oficiais do Vive Gostoso no Instagram e redes sociais.',
    images: ['https://vivegostoso.com.br/og-image.png'],
  },
}

export default function BioPage() {
  return <Bio />
}
