import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import Servicos from '@/views/Servicos'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('resolva', lang as Locale)
}

export default function ResolvaPage() {
  return <Servicos />
}
