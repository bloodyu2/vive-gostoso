import type { Metadata } from 'next'
import Participe from '@/views/Participe'

export const metadata: Metadata = {
  title: 'PARTICIPE. -- Eventos em São Miguel do Gostoso',
  description: 'Festivais, eventos culturais e agenda completa de São Miguel do Gostoso, RN.',
}

export default function ParticipePage() {
  return <Participe />
}
