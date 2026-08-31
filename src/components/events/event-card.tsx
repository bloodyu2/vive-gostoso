import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { Badge } from '@/components/ui/badge'
import type { GostosoEvent } from '@/types/database'

const typeKindMap: Record<string, 'cat' | 'pous' | 'pass' | 'fest'> = {
  festival: 'fest',
  esporte: 'pass',
  cultural: 'cat',
  gastronomia: 'cat',
}

function CardContent({ event: e, t }: { event: GostosoEvent; t: (key: string) => string }) {
  const type = e.event_type ? typeKindMap[e.event_type] : null
  const start = new Date(e.starts_at)
  const dateStr = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return (
    <>
      <div className="aspect-[16/7] bg-gradient-to-br from-teal to-teal-dark relative overflow-hidden">
        {e.cover_url && <img src={e.cover_url} alt={e.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />}
        {e.is_featured && <div className="absolute top-3 left-3"><Badge kind="verif">{t('badge_destaque')}</Badge></div>}
      </div>
      <div className="p-5">
        <div className="flex gap-1.5 mb-2 flex-wrap items-center">
          {type && <Badge kind={type}>{t('type_' + e.event_type)}</Badge>}
          <span className="text-xs text-[#737373] font-medium">{dateStr}</span>
        </div>
        <h3 className="font-display font-semibold text-xl">{e.name}</h3>
        {e.location && <p className="text-xs text-[#737373] mt-1">{e.location}</p>}
        {e.description && <p className="text-sm text-[#3D3D3D] mt-2 line-clamp-2">{e.description}</p>}
      </div>
    </>
  )
}

export function EventCard({ event: e }: { event: GostosoEvent }) {
  const { t } = useTranslation('event_card')
  const lp = useLocalePath()
  const baseClass = "bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 block"

  // O <div> externo carrega o visual do card; o <Link> cobre so o conteudo e o
  // "Fonte" fica como IRMAO dele, nunca dentro. <a> dentro de <a> e HTML
  // invalido -- o navegador fecha a primeira ancora e o clique fica
  // imprevisivel -- e era o que acontecia com o link da fonte aninhado.
  // Antes, quando havia source_url, o card inteiro era um <a> externo; agora
  // ele aponta sempre para /evento/[id], que voltou a ser alcancavel.
  return (
    <div className={baseClass}>
      <Link href={lp(`/evento/${e.id}`)} className="block">
        <CardContent event={e} t={t} />
      </Link>
      {e.source_url && (
        <div className="px-5 pb-5">
          <a
            href={e.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-[#737373] underline underline-offset-2 hover:text-teal transition-colors"
          >
            {t('fonte')} ↗
          </a>
        </div>
      )}
    </div>
  )
}
