import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import Contrate from '@/views/Contrate'

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('contrate', lang as Locale)
}

export default function ContratePage() {
  return <Contrate />
}
