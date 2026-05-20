import { notFound } from 'next/navigation'
import { getEvent } from '@/lib/supabase/queries'
import { getEventIdsForBuild } from '@/lib/supabase/build-queries'
import Evento from '@/views/Evento'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateStaticParams() {
  const ids = await getEventIdsForBuild()
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => ids.map((id) => ({ lang, id })))
}

export default async function EventoPage({ params }: Props) {
  try {
    const { id } = await params
    const event = await getEvent(id)
    if (!event) notFound()
    return <Evento initialEvent={event} id={id} />
  } catch (e: unknown) {
    if ((e as { digest?: string })?.digest?.startsWith('NEXT_NOT_FOUND')) throw e
    console.error('[EventoPage] SSR error:', e)
    throw e
  }
}
