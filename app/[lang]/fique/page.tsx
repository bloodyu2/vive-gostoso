import type { Metadata } from 'next'
import { buildPageMetadata, urlDaRota, type Locale } from '@/lib/page-metadata'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema, localizedUrl } from '@/lib/seo'
import Fique from '@/views/Fique'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('fique', lang as Locale)
}

export default async function FiquePage(
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  const locale = lang as Locale
  const businesses = await getBusinessesByVerb('fique')
  const jsonLd = itemListSchema({
    name: 'Pousadas em Sao Miguel do Gostoso',
    description: 'As melhores pousadas e hospedagens em Sao Miguel do Gostoso, RN.',
    url: urlDaRota('fique', locale),
    items: businesses.map(b => ({ name: b.name, url: localizedUrl(`/negocio/${b.slug}`, locale) })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Fique initialBusinesses={businesses} />
    </>
  )
}
