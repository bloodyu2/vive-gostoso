// app/[lang]/sobre/page.tsx
import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import Sobre from '@/views/Sobre'

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('sobre', lang as Locale)
}

export default function SobrePage() {
  return <Sobre />
}
