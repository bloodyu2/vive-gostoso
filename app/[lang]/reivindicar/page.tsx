import type { Metadata } from 'next'
import Reivindicar from '@/views/Reivindicar'

export const metadata: Metadata = {
  title: 'Reivindique seu negócio — Vive Gostoso',
  description: 'Seu negócio pode já estar no Vive Gostoso. Encontre e reivindique gratuitamente em poucos minutos.',
  openGraph: {
    title: 'Seu negócio já pode estar no Vive Gostoso',
    description: 'Mais de 180 negócios listados. Encontre o seu e assuma o controle do perfil grátis.',
    type: 'website',
  },
}

export default function ReivindicarPage() {
  return <Reivindicar />
}
