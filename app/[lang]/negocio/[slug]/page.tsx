import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBusinessSlugsForBuild, getBusinessForPage } from '@/lib/supabase/build-queries'
import Negocio from '@/views/Negocio'
import { localBusinessSchema } from '@/lib/seo'

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
  const { slug, lang } = await params
  const business = await getBusinessForPage(slug)
  if (!business) return { title: 'Negocio nao encontrado' }

  const baseUrl = 'https://vivegostoso.com.br'
  const canonical = `${baseUrl}/${lang === 'pt' ? '' : lang + '/'}negocio/${slug}`
  const description = business.description ?? `${business.name} em Sao Miguel do Gostoso.`
  const image = business.cover_url ?? `${baseUrl}/og-image.png`

  return {
    title: business.name,
    description,
    alternates: {
      canonical,
      languages: {
        'pt-BR': `${baseUrl}/negocio/${slug}`,
        'en': `${baseUrl}/en/negocio/${slug}`,
        'es': `${baseUrl}/es/negocio/${slug}`,
        'x-default': `${baseUrl}/negocio/${slug}`,
      },
    },
    openGraph: {
      title: business.name,
      description,
      url: canonical,
      siteName: 'Vive Gostoso',
      locale: lang === 'pt' ? 'pt_BR' : lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: business.cover_url ? [{ url: business.cover_url, width: 1200, height: 630 }] : [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: business.name,
      description,
      images: [image],
    },
  }
}

export default async function NegocioPage({ params }: Props) {
  const { slug, lang } = await params
  const business = await getBusinessForPage(slug)
  if (!business) notFound()

  const baseUrl = 'https://vivegostoso.com.br'
  const jsonLd = localBusinessSchema({
    name: business.name,
    description: business.description ?? `${business.name} em Sao Miguel do Gostoso.`,
    url: `${baseUrl}/${lang === 'pt' ? '' : lang + '/'}negocio/${slug}`,
    image: business.cover_url ?? undefined,
    telephone: business.phone ?? undefined,
    address: business.address ? {
      streetAddress: business.address,
      addressLocality: 'Sao Miguel do Gostoso',
      addressRegion: 'RN',
      addressCountry: 'BR',
    } : undefined,
    geo: business.lat && business.lng ? { latitude: business.lat, longitude: business.lng } : undefined,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Negocio initialBusiness={business} slug={slug} />
    </>
  )
}
