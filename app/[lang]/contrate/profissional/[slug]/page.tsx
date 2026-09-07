// app/[lang]/contrate/profissional/[slug]/page.tsx
import type { Metadata } from 'next'
import { getProfessionalForPage } from '@/lib/supabase/build-queries'
import ProfessionalProfile from '@/views/ProfessionalProfile'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params
  const professional = await getProfessionalForPage(slug)
  if (!professional) return { title: 'Profissional nao encontrado' }

  const baseUrl = 'https://www.vivegostoso.com.br'
  const canonical = `${baseUrl}/${lang === 'pt' ? '' : lang + '/'}contrate/profissional/${slug}`
  const description = professional.headline
  const image = professional.photo_url ?? `${baseUrl}/og-image.png`

  return {
    title: professional.display_name,
    description,
    alternates: {
      canonical,
      languages: {
        'pt-BR': `${baseUrl}/contrate/profissional/${slug}`,
        'en': `${baseUrl}/en/contrate/profissional/${slug}`,
        'es': `${baseUrl}/es/contrate/profissional/${slug}`,
        'x-default': `${baseUrl}/contrate/profissional/${slug}`,
      },
    },
    openGraph: {
      title: professional.display_name,
      description,
      url: canonical,
      siteName: 'Vive Gostoso',
      locale: lang === 'pt' ? 'pt_BR' : lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: professional.photo_url ? [{ url: professional.photo_url, width: 1200, height: 630 }] : [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: professional.display_name,
      description,
      images: [image],
    },
  }
}

export default async function ProfessionalProfilePage({ params }: Props) {
  const { slug } = await params
  return <ProfessionalProfile slug={slug} />
}
