import Link from 'next/link'
import { Phone, MapPin, Navigation, ExternalLink, Star, Wifi, Car, UserCheck, CalendarCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ManagedBadge } from '@/components/business/managed-badge'
import { isBusinessOpen } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useBusinessRatings } from '@/hooks/useReviews'
import type { Business } from '@/types/database'

/** Compact star + average + count chip. Single shared query feeds every card (no N+1). */
function RatingChip({ businessId }: { businessId: string }) {
  const { data: ratings } = useBusinessRatings()
  const rating = ratings?.get(businessId)
  if (!rating) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A1A] dark:text-white">
      <Star className="w-3.5 h-3.5 fill-ocre text-ocre" aria-hidden="true" />
      {rating.avg.toFixed(1)}
      <span className="text-fg-3 font-normal">({rating.count})</span>
    </span>
  )
}

/** Small teal amenity icon row — FIQUE (lodging) only, and only for amenities the record actually has. */
function AmenityIcons({ amenities }: { amenities: Business['amenities'] }) {
  if (!amenities) return null
  const items: { key: string; Icon: typeof Wifi; label: string }[] = []
  if (amenities.wifi) items.push({ key: 'wifi', Icon: Wifi, label: 'Wi-Fi' })
  if (amenities.parking) items.push({ key: 'parking', Icon: Car, label: 'Estacionamento' })
  if (amenities.accessible) items.push({ key: 'accessible', Icon: UserCheck, label: 'Acessível' })
  if (amenities.reservations) items.push({ key: 'reservations', Icon: CalendarCheck, label: 'Aceita reservas' })
  if (items.length === 0) return null
  return (
    <div className="flex items-center gap-2.5 mt-1.5">
      {items.map(({ key, Icon, label }) => (
        <span key={key} title={label} aria-label={label} className="text-teal">
          <Icon className="w-3.5 h-3.5" />
        </span>
      ))}
    </div>
  )
}

/** Faixa de preço — tratamento genérico (chip discreto) vs. FIQUE, onde o preço é o critério de decisão. */
function PriceChip({ priceRange, prominent }: { priceRange: NonNullable<Business['price_range']>; prominent: boolean }) {
  if (prominent) {
    return (
      <span className="inline-flex items-center text-xs font-bold text-teal bg-teal/10 dark:bg-white/10 px-2.5 py-1 rounded-full">
        {priceRange}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs font-semibold text-fg-3 bg-[#F0EDEA] dark:bg-white/10 px-2 py-0.5 rounded-full">
      {priceRange}
    </span>
  )
}

function mapsUrl(b: Business) {
  if (b.lat && b.lng) return `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' São Miguel do Gostoso RN')}`
}

function wazeUrl(b: Business) {
  if (b.lat && b.lng) return `https://waze.com/ul?ll=${b.lat},${b.lng}&navigate=yes`
  return `https://waze.com/ul?q=${encodeURIComponent(b.name + ' São Miguel do Gostoso RN')}`
}

/** WhatsApp / Maps / Waze / "ver mais" — shared by list and grid/gallery cards (was duplicated verbatim before). */
function LocationActions({ business: b, size = 'md' }: { business: Business; size?: 'sm' | 'md' }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const py = size === 'sm' ? 'py-1.5' : 'py-2'

  return (
    <>
      {b.whatsapp && (
        <a
          href={buildWhatsAppLink(b.whatsapp)}
          target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C4A] text-xs font-semibold px-3 ${py} rounded-full transition-colors`}
        >
          <Phone className="w-3 h-3" />WhatsApp
        </a>
      )}
      <a
        href={mapsUrl(b)}
        target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-1.5 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] text-xs font-semibold px-3 ${py} rounded-full transition-colors`}
      >
        <Navigation className="w-3 h-3" />Maps
      </a>
      <a
        href={wazeUrl(b)}
        target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-1.5 bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 text-[#0099CC] text-xs font-semibold px-3 ${py} rounded-full transition-colors`}
      >
        <Navigation className="w-3 h-3" />Waze
      </a>
      <Link
        href={lp(`/negocio/${b.slug}`)}
        className="ml-auto flex items-center gap-1 text-teal text-xs font-semibold hover:underline"
      >
        {t('filters.ver_mais')} <ExternalLink className="w-3 h-3" />
      </Link>
    </>
  )
}

interface Props {
  business: Business
  view?: 'grid' | 'list' | 'gallery'
}

export function BusinessCard({ business: b, view = 'grid' }: Props) {
  const { t } = useTranslation()
  const open = isBusinessOpen(b.opening_hours)
  const lp = useLocalePath()
  const verb = b.category?.verb ?? 'come'
  const isFique = verb === 'fique'
  const isPasseie = verb === 'passeie'

  const stopProp = (e: React.MouseEvent) => e.stopPropagation()

  if (view === 'list') {
    return (
      <div className="group bg-white dark:bg-card rounded-2xl overflow-hidden border border-border-1 hover:border-teal hover:shadow-[0_8px_24px_rgba(13,124,124,0.12)] transition-all duration-200 flex">
        {/* Thumb */}
        <Link href={lp(`/negocio/${b.slug}`)} className="relative w-36 sm:w-48 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-teal to-teal-dark">
            {b.cover_url && <img src={b.cover_url} alt={b.name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />}
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
            <Link href={lp(`/negocio/${b.slug}`)}>
              <h3 className="font-display font-semibold text-lg tracking-tight hover:text-teal transition-colors">{b.name}</h3>
            </Link>
            <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
              <RatingChip businessId={b.id} />
              <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} size="sm" />
              {b.price_range && <PriceChip priceRange={b.price_range} prominent={isFique} />}
              {b.menu_url && (
                <span className="inline-flex items-center text-xs font-semibold text-ocre bg-ocre/10 px-2 py-0.5 rounded-full">
                  {t('filters.cardapio')}
                </span>
              )}
            </div>
            {isFique && <AmenityIcons amenities={b.amenities} />}
            {b.address && (
              <p className="flex items-center gap-1 text-xs text-fg-3 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />{b.address}
              </p>
            )}
            {b.description && (
              <p className="text-sm text-fg-3 mt-1.5 line-clamp-2">{b.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap" onClick={stopProp}>
            <LocationActions business={b} size="md" />
          </div>
        </div>
      </div>
    )
  }

  // grid / gallery
  return (
    <div className={cn(
      'group bg-white dark:bg-card rounded-2xl overflow-hidden border border-border-1 hover:border-teal hover:shadow-[0_8px_24px_rgba(13,124,124,0.12)] transition-all duration-200 hover:-translate-y-0.5 flex flex-col',
    )}>
      {/* Cover — PASSEIE gets a taller, more immersive image since tours sell on imagery over copy */}
      <Link href={lp(`/negocio/${b.slug}`)} className={cn(
        'relative overflow-hidden bg-gradient-to-br from-teal to-teal-dark flex-shrink-0',
        isPasseie ? 'aspect-[1/1]' : 'aspect-[4/3]',
      )}>
        {b.cover_url && <img src={b.cover_url} alt={b.name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />}
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

        <Link href={lp(`/negocio/${b.slug}`)}>
          <h3 className="font-display font-semibold text-xl tracking-tight hover:text-teal transition-colors">{b.name}</h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
          <RatingChip businessId={b.id} />
          <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} size="sm" />
          {b.price_range && <PriceChip priceRange={b.price_range} prominent={isFique} />}
          {b.menu_url && (
            <span className="inline-flex items-center text-xs font-semibold text-ocre bg-ocre/10 px-2 py-0.5 rounded-full">
              {t('filters.cardapio')}
            </span>
          )}
        </div>
        {isFique && <AmenityIcons amenities={b.amenities} />}

        {b.address && (
          <p className="flex items-center gap-1 text-xs text-fg-3 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{b.address}</span>
          </p>
        )}

        {b.description && !isPasseie ? (
          <p className="text-sm text-fg-3 mt-2 line-clamp-2 flex-1">{b.description}</p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F5F2EE] dark:border-[#2D2D2D] flex-wrap" onClick={stopProp}>
          <LocationActions business={b} size="sm" />
        </div>
      </div>
    </div>
  )
}
