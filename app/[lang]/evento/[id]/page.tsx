import { notFound } from 'next/navigation'
import { getEvent, getEventIds } from '@/lib/supabase/queries'
import Evento from '@/pages/Evento'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateStaticParams() {
  try {
    const ids = await getEventIds()
    const langs = ['pt', 'en', 'es']
    return langs.flatMap((lang) => ids.map((id) => ({ lang, id })))
  } catch {
    return []
  }
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()
  return <Evento initialEvent={event} id={id} />
}
