import type { Metadata } from 'next'
import { buildPageMetadata, urlDaRota, type Locale } from '@/lib/page-metadata'
import { createClient } from '@/lib/supabase/server'
import { itemListSchema, localizedUrl } from '@/lib/seo'
import Contrate from '@/views/Contrate'

export const revalidate = 1800

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata('contrate', lang as Locale)
}

async function getPublishedProfessionals() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_professionals')
    .select('display_name, slug')
    .eq('is_published', true)
  return data ?? []
}

export default async function ContratePage(
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  const locale = lang as Locale
  const professionals = await getPublishedProfessionals()
  const jsonLd = itemListSchema({
    name: 'Profissionais e prestadores de servico em Sao Miguel do Gostoso',
    description: 'Profissionais autonomos e empresas de servico disponiveis para contratar em Sao Miguel do Gostoso, RN.',
    url: urlDaRota('contrate', locale),
    items: professionals.map(p => ({
      name: p.display_name,
      url: localizedUrl(`/contrate/profissional/${p.slug}`, locale),
    })),
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Contrate />
    </>
  )
}
