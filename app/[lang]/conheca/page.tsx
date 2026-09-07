// app/[lang]/conheca/page.tsx
import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { citySchema } from '@/lib/seo'
import Conheca from '@/views/Conheca'

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('conheca', lang as Locale)
}

export default function ConhecaPage() {
  const jsonLd = citySchema()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Conheca />
    </>
  )
}
