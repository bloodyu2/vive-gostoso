import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBusinessSlugsForBuild, getBusinessForPage } from '@/lib/supabase/build-queries'
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
  const business = await getBusinessForPage(slug)
  if (!business) return { title: 'Negocio nao encontrado' }
  return {
    title: business.name,
    description: business.description ?? `${business.name} em Sao Miguel do Gostoso.`,
    openGraph: {
      images: business.cover_url ? [{ url: business.cover_url }] : [],
    },
  }
}

export default async function NegocioPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusinessForPage(slug)
  if (!business) notFound()
  return <Negocio initialBusiness={business} slug={slug} />
}
