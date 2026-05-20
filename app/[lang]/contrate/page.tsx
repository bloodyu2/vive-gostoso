import type { Metadata } from 'next'
import { getServices, getJobs } from '@/lib/supabase/queries'
import Contrate from '@/pages/Contrate'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'CONTRATE. -- Serviços e Vagas em São Miguel do Gostoso',
  description: 'Contrate serviços locais e encontre vagas de emprego em São Miguel do Gostoso, RN.',
}

export default async function ContratePage() {
  const [services, jobs] = await Promise.all([getServices(), getJobs()])
  return <Contrate initialServices={services} initialJobs={jobs} />
}
