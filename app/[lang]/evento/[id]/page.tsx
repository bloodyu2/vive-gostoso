import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventIdsForBuild, getEventForPage } from '@/lib/supabase/build-queries'
import Evento from '@/views/Evento'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateStaticParams() {
  const ids = await getEventIdsForBuild()
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => ids.map((id) => ({ lang, id })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lang } = await params
  const event = await getEventForPage(id)
  if (!event) return { title: 'Evento nao encontrado' }

  const baseUrl = 'https://vivegostoso.com.br'
  const canonical = `${baseUrl}/${lang === 'pt' ? '' : lang + '/'}evento/${id}`
  const description = event.description ?? `${event.name} em Sao Miguel do Gostoso.`
  const image = event.cover_url ?? `${baseUrl}/og-image.png`

  return {
    title: event.name,
    description,
    alternates: {
      canonical,
      languages: {
        'pt-BR': `${baseUrl}/evento/${id}`,
        'en': `${baseUrl}/en/evento/${id}`,
        'es': `${baseUrl}/es/evento/${id}`,
        'x-default': `${baseUrl}/evento/${id}`,
      },
    },
    openGraph: {
      title: event.name,
      description,
      url: canonical,
      siteName: 'Vive Gostoso',
      locale: lang === 'pt' ? 'pt_BR' : lang === 'en' ? 'en_US' : 'es_ES',
      type: 'article',
      images: event.cover_url ? [{ url: event.cover_url, width: 1200, height: 630 }] : [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description,
      images: [image],
    },
  }
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params
  const event = await getEventForPage(id)
  if (!event) notFound()
  return <Evento initialEvent={event} id={id} />
}
