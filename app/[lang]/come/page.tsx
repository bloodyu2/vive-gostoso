import type { Metadata } from 'next'
import { buildPageMetadata, type Locale } from '@/lib/page-metadata'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import { itemListSchema } from '@/lib/seo'
import Come from '@/views/Come'

const baseUrl = 'https://www.vivegostoso.com.br'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('come', lang as Locale)
}

export default async function ComePage() {
  const businesses = await getBusinessesByVerb('come')
  const jsonLd = itemListSchema({
    name: 'Restaurantes em Sao Miguel do Gostoso',
    description: 'Restaurantes, bares e experiencias gastronomicas em Sao Miguel do Gostoso, RN.',
    url: `${baseUrl}/come`,
    items: businesses.map(b => ({ name: b.name, url: `${baseUrl}/negocio/${b.slug}` })),
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
