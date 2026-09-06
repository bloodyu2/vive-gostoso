import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import Participe from '@/views/Participe'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('participe', lang as Locale)
}

export default function ParticipePage() {
  return <Participe />
}
