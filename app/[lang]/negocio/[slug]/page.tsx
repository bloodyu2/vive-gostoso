import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBusiness, getBusinessSlugs } from '@/lib/supabase/queries'
import Negocio from '@/pages/Negocio'

export const revalidate = 3600

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getBusinessSlugs(50)
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
  const { slug } = await params
  const business = await getBusiness(slug)
  if (!business) notFound()
  return <Negocio initialBusiness={business} slug={slug} />
}
