import type { Metadata } from 'next'
import Contrate from '@/views/Contrate'

export const metadata: Metadata = {
  title: 'CONTRATE. -- Profissionais e Empresas em São Miguel do Gostoso',
  description: 'Contrate profissionais e empresas de serviço em São Miguel do Gostoso, RN. Encontre autônomos, agências e vagas de emprego.',
}

export default function ContratePage() {
  return <Contrate />
}
