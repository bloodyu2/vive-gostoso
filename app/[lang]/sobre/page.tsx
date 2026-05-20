// app/[lang]/sobre/page.tsx
import type { Metadata } from 'next'
import Sobre from '@/pages/Sobre'

export const metadata: Metadata = {
  title: 'Sobre o Projeto',
  description: 'Conheça o projeto Vive Gostoso e sua missão para São Miguel do Gostoso.',
}

export default function SobrePage() {
  return <Sobre />
}
