import { Link } from 'react-router-dom'
import { Phone, MapPin, Navigation, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ManagedBadge } from '@/components/business/managed-badge'
import { isBusinessOpen } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { useLocalePath } from '@/hooks/useLocalePath'
import type { Business } from '@/types/database'

function mapsUrl(b: Business) {
  if (b.lat && b.lng) return `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' São Miguel do Gostoso RN')}`
}

function wazeUrl(b: Business) {
  if (b.lat && b.lng) return `https://waze.com/ul?ll=${b.lat},${b.lng}&navigate=yes`
  return `https://waze.com/ul?q=${encodeURIComponent(b.name + ' São Miguel do Gostoso RN')}`
}

interface Props {
  business: Business
  view?: 'grid' | 'list' | 'gallery'
}

export function BusinessCard({ business: b, view = 'grid' }: Props) {
  const { t } = useTranslation()
  const open = isBusinessOpen(b.opening_hours)
  const lp = useLocalePath()

  const stopProp = (e: React.MouseEvent) => e.stopPropagation()

  if (view === 'list') {
    return (
      <div className="group bg-white dark:bg-[#1C1C1C] rounded-2xl overflow-hidden border border-[#E8E4DF] dark:border-[#2D2D2D] hover:border-ocre hover:shadow-lg transition-all duration-200 flex">
        {/* Thumb */}
        <Link to={lp(`/negocio/${b.slug}`)} className="relative w-36 sm:w-48 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-teal to-teal-dark">
            {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
          </div>
          {b.is_featured && (
            <div className="absolute top-2 left-2">
              <Badge kind="verif">✓</Badge>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
          <div>
            <div className="flex gap-1.5 mb-1.5 flex-wrap">
              {b.category && <Badge kind="cat">{b.category.name}</Badge>}
              {open ? <Badge kind="open" dot>{t('common.aberto')}</Badge> : <Badge kind="closed" dot>{t('common.fechado')}</Badge>}
            </div>
            <Link to={lp(`/negocio/${b.slug}`)}>
              <h3 className="font-display font-semibold text-lg tracking-tight hover:text-teal transition-colors">{b.name}</h3>
            </Link>
            <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
              <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} size="sm" />
              {b.price_range && (
                <span className="inline-flex items-center text-xs font-semibold text-[#737373] bg-[#F0EDEA] px-2 py-0.5 rounded-full">
                  {b.price_range}
                </span>
              )}
              {b.menu_url && (
                <span className="inline-flex items-center text-xs font-semibold text-ocre bg-ocre/10 px-2 py-0.5 rounded-full">
                  {t('filters.cardapio')}
                </span>
              )}
            </div>
            {b.address && (
              <p className="flex items-center gap-1 text-xs text-[#737373] mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />{b.address}
              </p>
            )}
            {b.description && (
              <p className="text-sm text-[#737373] mt-1.5 line-clamp-2">{b.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap" onClick={stopProp}>
            {b.whatsapp && (
              <a
                href={buildWhatsAppLink(b.whatsapp)}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C4A] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <Phone className="w-3 h-3" />WhatsApp
              </a>
            )}
            <a
              href={mapsUrl(b)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <Navigation className="w-3 h-3" />Maps
            </a>
            <a
              href={wazeUrl(b)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 text-[#0099CC] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <Navigation className="w-3 h-3" />Waze
            </a>
            <Link
              to={lp(`/negocio/${b.slug}`)}
              className="ml-auto flex items-center gap-1 text-teal text-xs font-semibold hover:underline"
            >
              {t('filters.ver_mais')} <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // grid / gallery
  return (
    <div className={cn(
      'group bg-white dark:bg-[#1C1C1C] rounded-2xl overflow-hidden border border-[#E8E4DF] dark:border-[#2D2D2D] hover:border-ocre hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col',
    )}>
      {/* Cover */}
      <Link to={lp(`/negocio/${b.slug}`)} className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-teal to-teal-dark flex-shrink-0">
        {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
        {b.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge kind="verif">✓ {t('filters.verificado')}</Badge>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {b.category && <Badge kind="cat">{b.category.name}</Badge>}
          {open ? <Badge kind="open" dot>{t('common.aberto')}</Badge> : <Badge kind="closed" dot>{t('common.fechado')}</Badge>}
          {b.plan === 'associado' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
              ✓ {t('filters.associado')}
            </span>
          )}
          {b.plan === 'destaque' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-ocre bg-ocre/10 px-2 py-0.5 rounded-full">
              ★ {t('filters.destaque')}
            </span>
          )}
        </div>

        <Link to={lp(`/negocio/${b.slug}`)}>
          <h3 className="font-display font-semibold text-xl tracking-tight hover:text-teal transition-colors">{b.name}</h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
          <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} size="sm" />
          {b.price_range && (
            <span className="inline-flex items-center text-xs font-semibold text-[#737373] bg-[#F0EDEA] px-2 py-0.5 rounded-full">
              {b.price_range}
            </span>
          )}
          {b.menu_url && (
            <span className="inline-flex items-center text-xs font-semibold text-ocre bg-ocre/10 px-2 py-0.5 rounded-full">
              {t('filters.cardapio')}
            </span>
          )}
        </div>

        {b.address && (
          <p className="flex items-center gap-1 text-xs text-[#737373] mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{b.address}</span>
          </p>
        )}

        {b.description && (
          <p className="text-sm text-[#737373] mt-2 line-clamp-2 flex-1">{b.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F5F2EE] dark:border-[#2D2D2D] flex-wrap" onClick={stopProp}>
          {b.whatsapp && (
            <a
              href={buildWhatsAppLink(b.whatsapp)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C4A] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <Phone className="w-3 h-3" />WhatsApp
            </a>
          )}
          <a
            href={mapsUrl(b)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <Navigation className="w-3 h-3" />Maps
          </a>
          <a
            href={wazeUrl(b)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 text-[#0099CC] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <Navigation className="w-3 h-3" />Waze
          </a>
          <Link
            to={lp(`/negocio/${b.slug}`)}
            className="ml-auto flex items-center gap-1 text-teal text-xs font-semibold hover:underline"
          >
            {t('filters.ver_mais')} <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
