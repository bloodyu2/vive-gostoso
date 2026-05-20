// app/[lang]/conheca/page.tsx
import type { Metadata } from 'next'
import Conheca from '@/pages/Conheca'

export const metadata: Metadata = {
  title: 'Conheça São Miguel do Gostoso',
  description: 'Descubra a história, praias, como chegar e o melhor de São Miguel do Gostoso, RN.',
}

export default function ConhecaPage() {
  return <Conheca />
}
