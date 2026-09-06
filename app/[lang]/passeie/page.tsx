import type { Metadata } from 'next'
import { buildPageMetadata, urlDaRota, type Locale } from '@/lib/page-metadata'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema, localizedUrl } from '@/lib/seo'
import Passeie from '@/views/Passeie'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('passeie', lang as Locale)
}

export default async function PasseiePage(
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  const locale = lang as Locale
  const businesses = await getBusinessesByVerb('passeie')
  const jsonLd = itemListSchema({
    name: 'Passeios em Sao Miguel do Gostoso',
    description: 'Kitesurf, windsurf, buggy, tours e esportes nauticos em Sao Miguel do Gostoso, RN.',
    url: urlDaRota('passeie', locale),
    items: businesses.map(b => ({ name: b.name, url: localizedUrl(`/negocio/${b.slug}`, locale) })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Passeie initialBusinesses={businesses} />
    </>
  )
}
