import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBusiness } from '@/lib/supabase/queries'
import { getBusinessSlugsForBuild } from '@/lib/supabase/build-queries'
import Negocio from '@/views/Negocio'

export const revalidate = 3600

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getBusinessSlugsForBuild(200)
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusiness(slug)
  if (!business) return { title: 'Negócio não encontrado' }
  return {
    title: business.name,
    description: business.description ?? `${business.name} em São Miguel do Gostoso.`,
    openGraph: {
      images: business.cover_url ? [{ url: business.cover_url }] : [],
    },
  }
}

export default async function NegocioPage({ params }: Props) {
  try {
    const { slug } = await params
    const business = await getBusiness(slug)
    if (!business) notFound()
    return <Negocio initialBusiness={business} slug={slug} />
  } catch (e: unknown) {
    if ((e as { digest?: string })?.digest?.startsWith('NEXT_NOT_FOUND')) throw e
    console.error('[NegocioPage] SSR error:', e)
    throw e
  }
}
