'use client'
import Link from 'next/link'
import { CalendarDays, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEvent } from '@/hooks/useEvents'
import { useLocalePath } from '@/hooks/useLocalePath'
import { Badge } from '@/components/ui/badge'
import { SeloEstadoEvento, estadoDoEvento } from '@/components/events/event-card'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { safeExternalUrl } from '@/lib/utils'
import type { GostosoEvent } from '@/types/database'

const typeMap: Record<string, string> = {
  festival: 'Festival', esporte: 'Esporte', cultural: 'Cultural', gastronomia: 'Gastronomia',
}

type EventoProps = {
  initialEvent?: GostosoEvent | null
  id?: string
}

export default function Evento({ initialEvent, id: idProp }: EventoProps) {
  const id = idProp
  const { data: event, isLoading } = useEvent(id ?? '', initialEvent !== undefined ? { initialData: initialEvent } : undefined)
  const { t, i18n } = useTranslation()
  const lp = useLocalePath()

  if (isLoading) return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12 animate-pulse">
      <div className="h-64 bg-[#E8E4DF] rounded-2xl mb-6" />
      <div className="h-8 bg-[#E8E4DF] rounded w-2/3 mb-3" />
      <div className="h-4 bg-[#E8E4DF] rounded w-1/3" />
    </main>
  )

  if (!event) return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-12 text-center">
      <h2 className="font-display text-2xl font-semibold mb-2">{t('evento.nao_encontrado')}</h2>
      <Link href={lp('/participe')} className="text-teal text-sm font-semibold">{t('evento.ver_todos')}</Link>
    </main>
  )

  const start = new Date(event.starts_at)
  const end = event.ends_at ? new Date(event.ends_at) : null
  const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR'
  const dateStr = start.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const endStr = end ? end.toLocaleDateString(locale, { day: 'numeric', month: 'long' }) : null

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-10">
      <Link href={lp('/participe')} className="inline-flex items-center gap-1.5 text-sm text-fg-3-texto hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('evento.todos_eventos')}
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <SeloEstadoEvento estado={estadoDoEvento(event)} />
        {event.event_type && typeMap[event.event_type] && (
          <Badge kind="cat">{typeMap[event.event_type]}</Badge>
        )}
        {event.is_featured && <Badge kind="verif">{t('evento.destaque')}</Badge>}
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-5">{event.name}</h1>

      {/* Data e local primeiro */}
      <div className="rounded-2xl border border-border-1 bg-card p-5 flex flex-col gap-3 text-fg-1">
        <div className="flex items-start gap-3">
          <CalendarDays className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold capitalize">{dateStr}</p>
            <p className="text-sm text-fg-3-texto">
              {timeStr !== '00:00' ? `${t('evento.as')} ${timeStr}` : ''}
              {endStr ? `${timeStr !== '00:00' ? ' ' : ''}${t('evento.ate')} ${endStr}` : ''}
            </p>
          </div>
        </div>
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="font-semibold">{event.location}</p>
          </div>
        )}
        {safeExternalUrl(event.source_url) && (
          <a href={safeExternalUrl(event.source_url)} target="_blank" rel="noopener noreferrer"
             className="mt-1 inline-flex items-center justify-center gap-2 min-h-11 bg-teal text-white font-semibold px-6 rounded-full hover:bg-teal-dark transition-colors sm:self-start">
            {t('evento.saiba_mais')} <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {event.cover_url && (
        <div className="aspect-[16/7] rounded-2xl overflow-hidden bg-teal mt-6">
          <SafeCoverImage
            src={event.cover_url}
            alt={`${event.name} em São Miguel do Gostoso`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {event.description && (
        <p className="text-base text-fg-1 leading-relaxed whitespace-pre-line mt-6">{event.description}</p>
      )}
    </main>
  )
}
