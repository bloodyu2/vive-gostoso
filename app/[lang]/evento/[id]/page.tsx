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

export default async function EventoPage({ params }: Props) {
  const { id } = await params
  const event = await getEventForPage(id)
  if (!event) notFound()
  return <Evento initialEvent={event} id={id} />
}
