import type { Metadata } from 'next'
import { buildPageMetadata, urlDaRota, type Locale } from '@/lib/page-metadata'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema, localizedUrl } from '@/lib/seo'
import Come from '@/views/Come'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('come', lang as Locale)
}

export default async function ComePage(
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  const locale = lang as Locale
  const businesses = await getBusinessesByVerb('come')
  const jsonLd = itemListSchema({
    name: 'Restaurantes em Sao Miguel do Gostoso',
    description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
    url: urlDaRota('come', locale),
    items: businesses.map(b => ({ name: b.name, url: localizedUrl(`/negocio/${b.slug}`, locale) })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Come initialBusinesses={businesses} />
    </>
  )
}
