import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { Badge } from '@/components/ui/badge'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { MagicCard } from '@/components/magicui/magic-card'
import { cn, safeExternalUrl } from '@/lib/utils'
import type { GostosoEvent } from '@/types/database'

const typeKindMap: Record<string, 'cat' | 'pous' | 'pass' | 'fest'> = {
  festival: 'fest',
  esporte: 'pass',
  cultural: 'cat',
  gastronomia: 'cat',
}

export type EstadoEvento = 'agora' | 'hoje' | 'futuro'

function fimDoEvento(e: GostosoEvent): number {
  if (e.ends_at) return new Date(e.ends_at).getTime()
  const fim = new Date(e.starts_at)
  fim.setHours(23, 59, 59, 999)
  return fim.getTime()
}

/** 'agora': comecou e ainda nao acabou. 'hoje': comeca hoje, mais tarde. */
export function estadoDoEvento(e: GostosoEvent, agora = Date.now()): EstadoEvento {
  const inicio = new Date(e.starts_at).getTime()
  if (inicio <= agora && fimDoEvento(e) >= agora) return 'agora'
  const hoje = new Date(agora)
  const dia = new Date(e.starts_at)
  if (
    dia.getFullYear() === hoje.getFullYear() &&
    dia.getMonth() === hoje.getMonth() &&
    dia.getDate() === hoje.getDate()
  ) return 'hoje'
  return 'futuro'
}

function localeDe(language: string | undefined): string {
  return language?.startsWith('en') ? 'en-US' : language?.startsWith('es') ? 'es' : 'pt-BR'
}

/** Selo de estado com o mesmo ponto pulsante da abertura dos negocios. */
export function SeloEstadoEvento({ estado, claro = false }: { estado: EstadoEvento; claro?: boolean }) {
  const { t } = useTranslation('event_card')
  if (estado === 'futuro') return null
  const agora = estado === 'agora'
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full',
        claro ? 'bg-white text-[#1F6B3E]' : 'bg-[#EAF5EF] text-[#2D7A4A]',
      )}
    >
      <span aria-hidden="true" className={cn('w-1.5 h-1.5 rounded-full bg-[#2D7A4A]', agora && 'vg-ping')} />
      {agora ? t('ao_vivo') : t('hoje')}
    </span>
  )
}

/** Tile grande do proximo evento: data enorme, titulo, local, link. */
export function EventoDestaque({ event: e }: { event: GostosoEvent }) {
  const { t, i18n } = useTranslation('event_card')
  const lp = useLocalePath()
  const locale = localeDe(i18n.language)
  const inicio = new Date(e.starts_at)
  const dia = inicio.toLocaleDateString(locale, { day: '2-digit' })
  const mes = inicio.toLocaleDateString(locale, { month: 'long' })
  const semana = inicio.toLocaleDateString(locale, { weekday: 'long' })
  const hora = inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const estado = estadoDoEvento(e)
  const fonte = safeExternalUrl(e.source_url)

  return (
    <MagicCard className="rounded-2xl overflow-hidden bg-teal-dark text-white grid md:grid-cols-5">
      <div className={cn('p-6 md:p-8 flex flex-col justify-between gap-8', e.cover_url ? 'md:col-span-3' : 'md:col-span-5')}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{t('proximo')}</span>
          <SeloEstadoEvento estado={estado} claro />
        </div>
        <div>
          <p className="flex items-baseline gap-3 font-display font-bold leading-none">
            <span className="text-7xl md:text-8xl">{dia}</span>
            <span className="text-2xl md:text-3xl capitalize">{mes}</span>
          </p>
          <p className="mt-2 text-sm capitalize">
            {semana}{hora !== '00:00' ? `, ${hora}` : ''}
          </p>
          <h2 className="mt-5 font-display font-bold text-2xl md:text-3xl leading-tight">
            <Link href={lp(`/evento/${e.id}`)} className="hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              {e.name}
            </Link>
          </h2>
          {e.location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {e.location}
            </p>
          )}
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <Link
            href={lp(`/evento/${e.id}`)}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full bg-white text-teal-dark font-semibold text-sm hover:bg-areia transition-colors"
          >
            {t('ver_evento')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          {fonte && (
            <a href={safeExternalUrl(e.source_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-11 text-sm underline underline-offset-2">
              {t('fonte')} ↗
            </a>
          )}
        </div>
      </div>
      {e.cover_url && (
        <div className="md:col-span-2 min-h-48 relative bg-teal">
          <SafeCoverImage src={e.cover_url} alt={e.name} className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}
    </MagicCard>
  )
}

/** Linha compacta da lista por mes. O Link cobre a linha; "Fonte" e irmao dele
 *  (nunca <a> dentro de <a>). */
export function EventCard({ event: e }: { event: GostosoEvent }) {
  const { t, i18n } = useTranslation('event_card')
  const lp = useLocalePath()
  const locale = localeDe(i18n.language)
  const inicio = new Date(e.starts_at)
  const dia = inicio.toLocaleDateString(locale, { day: '2-digit' })
  const mesCurto = inicio.toLocaleDateString(locale, { month: 'short' }).replace('.', '')
  const hora = inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const tipo = e.event_type ? typeKindMap[e.event_type] : null
  const estado = estadoDoEvento(e)
  const fonte = safeExternalUrl(e.source_url)

  return (
    <MagicCard className="rounded-2xl border border-border-1 bg-card overflow-hidden">
      <div className="flex items-stretch">
        <Link href={lp(`/evento/${e.id}`)} className="flex flex-1 min-w-0 items-center gap-4 p-4 hover:bg-areia/60 dark:hover:bg-white/5 transition-colors">
          <div className="w-14 flex-shrink-0 text-center">
            <p className="font-display font-bold text-3xl leading-none text-fg-1">{dia}</p>
            <p className="mt-1 text-xs font-semibold text-teal uppercase">{mesCurto}</p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex gap-1.5 mb-1 flex-wrap items-center">
              <SeloEstadoEvento estado={estado} />
              {tipo && <Badge kind={tipo}>{t('type_' + e.event_type)}</Badge>}
              {hora !== '00:00' && <span className="text-xs text-fg-3-texto">{hora}</span>}
            </div>
            <h3 className="font-display font-semibold text-lg leading-snug text-fg-1">{e.name}</h3>
            {e.location && <p className="text-sm text-fg-3-texto mt-0.5 truncate">{e.location}</p>}
          </div>
          <ArrowRight className="w-4 h-4 text-fg-3-texto flex-shrink-0 hidden sm:block" aria-hidden="true" />
        </Link>
        {fonte && (
          <a
            href={safeExternalUrl(e.source_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center min-h-11 px-4 text-xs text-fg-3-texto underline underline-offset-2 hover:text-teal border-l border-border-1"
          >
            {t('fonte')} ↗
          </a>
        )}
      </div>
    </MagicCard>
  )
}
