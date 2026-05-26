import type { Metadata } from 'next'
import Parceiros from '@/views/Parceiros'

export const metadata: Metadata = {
  title: 'Cadastre seu negócio — Vive Gostoso',
  description: 'Apareça no maior diretório digital de São Miguel do Gostoso. Cadastro gratuito para negócios locais. Pousadas, restaurantes, kitesurf e muito mais.',
  openGraph: {
    title: 'Seu negócio no Vive Gostoso',
    description: 'Cadastre seu negócio grátis e seja encontrado pelos turistas de São Miguel do Gostoso.',
    type: 'website',
  },
}

export default function ParceirosPage() {
  return <Parceiros />
}
