import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Phone, Globe, AtSign, Clock, ArrowLeft, CheckCircle, Share2, Check, BookOpen, Wifi, Car, UserCheck, CalendarCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useBusiness } from '@/hooks/useBusinesses'
import { isBusinessOpen } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { ManagedBadge } from '@/components/business/managed-badge'
import { ClaimCta } from '@/components/business/claim-cta'
import { Lightbox } from '@/components/ui/lightbox'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useReviews } from '@/hooks/useReviews'
import { StarRating } from '@/components/reviews/star-rating'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'

const DAY_ORDER = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

export default function Negocio() {
  const { slug } = useParams<{ slug: string }>()
  const { data: b, isLoading } = useBusiness(slug ?? '')
  const [copied, setCopied] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { data: reviews = [] } = useReviews(b?.id ?? '')
  const { t } = useTranslation()
  const lp = useLocalePath()

  const days: Record<string, string> = {
    seg: t('negocio.dia_seg'),
    ter: t('negocio.dia_ter'),
    qua: t('negocio.dia_qua'),
    qui: t('negocio.dia_qui'),
    sex: t('negocio.dia_sex'),
    sab: t('negocio.dia_sab'),
    dom: t('negocio.dia_dom'),
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  usePageMeta(b
    ? {
        title: b.name,
        description: b.description ?? `${b.name} em São Miguel do Gostoso. Encontre no Vive Gostoso.`,
        image: b.cover_url ?? undefined,
        url: `https://vivegostoso.com.br/negocio/${b.slug}`,
      }
    : { title: t('common.carregando') }
  )

  if (isLoading) return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-[#E8E4DF] rounded-2xl" />
        <div className="h-8 bg-[#E8E4DF] rounded w-1/2" />
        <div className="h-4 bg-[#E8E4DF] rounded w-full" />
      </div>
    </main>
  )

  if (!b) return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-16 text-center">
      <div className="text-6xl mb-4">🤔</div>
      <h2 className="font-display text-2xl font-semibold mb-2">{t('negocio.nao_encontrado')}</h2>
      <p className="text-[#737373] mb-6">{t('negocio.nao_encontrado_desc')}</p>
      <Link to={lp('/')} className="text-teal font-semibold">{t('not_found.voltar_inicio')}</Link>
    </main>
  )

  const open = isBusinessOpen(b.opening_hours)
  const verb = b.category?.verb ?? 'come'
  const backTo = verb === 'fique' ? '/fique' : verb === 'passeie' ? '/passeie' : '/come'
  const backLabel = verb === 'fique' ? t('nav.fique') : verb === 'passeie' ? t('nav.passeie') : t('nav.come')

  const business = b
  const shareUrl = `https://vivegostoso.com.br/negocio/${business.slug}`
  const shareText = `${business.name} — ${shareUrl}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text: shareText, url: shareUrl })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-10">
      <Link to={lp(backTo)} className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        {t('negocio.voltar_a')} {backLabel}
      </Link>

      {/* Cover */}
      <div
        className="aspect-[21/9] bg-gradient-to-br from-teal to-teal-dark rounded-2xl overflow-hidden mb-8 relative cursor-pointer"
        onClick={() => b.cover_url ? setLightboxIndex(0) : undefined}
      >
        {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
        {b.is_featured && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur text-teal text-xs font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('negocio.verificado')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-3 flex-wrap items-center">
            {b.category && <Badge kind="cat">{b.category.name}</Badge>}
            {open
              ? <Badge kind="open" dot>{t('negocio.aberto')}</Badge>
              : <Badge kind="closed" dot>{t('negocio.fechado')}</Badge>
            }
            {b.plan === 'associado' && <Badge kind="verif">✓ Associado</Badge>}
            {b.plan === 'destaque' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-ocre bg-ocre/10 border border-ocre/20 px-2.5 py-0.5 rounded-full">
                ★ Destaque
              </span>
            )}
            <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} />
          </div>

          <h1 className="font-display font-bold text-4xl tracking-tight mb-1">{b.name}</h1>
          {avgRating !== null && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
              <span className="text-sm font-semibold text-[#1A1A1A]">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-[#737373]">
                ({reviews.length} {reviews.length === 1 ? t('negocio.avaliacao_singular') : t('negocio.avaliacao_plural')})
              </span>
            </div>
          )}
          {b.price_range && (
            <span className="inline-block text-sm font-semibold text-[#737373] bg-[#F0EDEA] px-2 py-0.5 rounded-lg mb-4">
              {b.price_range}
            </span>
          )}
          {b.address && (
            <p className="flex items-center gap-1.5 text-sm text-[#737373] mb-6">
              <MapPin className="w-4 h-4 flex-shrink-0" /> {b.address}
            </p>
          )}

          {b.description && (
            <p className="text-[#3D3D3D] leading-relaxed text-base mb-8">{b.description}</p>
          )}

          {/* Fotos */}
          {b.photos && b.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {b.photos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-[#E8E4DF] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxIndex(b.cover_url ? i + 1 : i)}
                >
                  <img src={url} alt={`${b.name} foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Avaliações */}
          <div className="mt-8">
            <h2 className="font-display font-semibold text-2xl mb-5">{t('negocio.avaliacoes')}</h2>
            <ReviewList businessId={b.id} />
          </div>

          {/* Avaliar */}
          <div className="mt-6">
            <ReviewForm businessId={b.id} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* WhatsApp CTA */}
          {b.whatsapp && (
            <a
              href={buildWhatsAppLink(b.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-2xl px-5 py-4 text-sm font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t('negocio.falar_whatsapp')}
            </a>
          )}
          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-2xl px-5 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? t('negocio.link_copiado') : t('negocio.compartilhar')}
          </button>

          {/* Cardápio */}
          {b.menu_url && (
            <a
              href={b.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-ocre/10 text-ocre border border-ocre/30 rounded-2xl px-5 py-3.5 text-sm font-semibold hover:bg-ocre/20 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {t('negocio.ver_cardapio')}
            </a>
          )}

          {/* Claim */}
          {!b.profile_id && <ClaimCta businessSlug={b.slug} />}

          {/* Contatos */}
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide">{t('negocio.contato')}</h3>

            {b.whatsapp && (
              <a href={buildWhatsAppLink(b.whatsapp)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#25D366]" />
                </div>
                WhatsApp
              </a>
            )}

            {b.phone && !b.whatsapp && (
              <a href={`tel:${b.phone}`} className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-teal" />
                </div>
                {b.phone}
              </a>
            )}

            {b.instagram && (
              <a href={`https://instagram.com/${b.instagram}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <AtSign className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                @{b.instagram}
              </a>
            )}

            {b.website && (
              <a href={b.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[#3D3D3D] hover:text-teal transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                {t('common.site')}
              </a>
            )}
          </div>

          {/* Amenidades */}
          {b.amenities && Object.values(b.amenities).some(Boolean) && (
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide mb-3">{t('negocio.comodidades')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {b.amenities.wifi && (
                  <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
                    <Wifi className="w-4 h-4 text-teal flex-shrink-0" /> {t('negocio.wifi')}
                  </div>
                )}
                {b.amenities.parking && (
                  <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
                    <Car className="w-4 h-4 text-teal flex-shrink-0" /> {t('negocio.estacionamento')}
                  </div>
                )}
                {b.amenities.accessible && (
                  <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
                    <UserCheck className="w-4 h-4 text-teal flex-shrink-0" /> {t('negocio.acessivel')}
                  </div>
                )}
                {b.amenities.reservations && (
                  <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
                    <CalendarCheck className="w-4 h-4 text-teal flex-shrink-0" /> {t('negocio.reservas')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Horários */}
          {b.opening_hours && Object.keys(b.opening_hours).length > 0 && (
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> {t('negocio.horarios')}
              </h3>
              <div className="space-y-1.5">
                {DAY_ORDER.map(day => {
                  const h = (b.opening_hours as Record<string, { open: string; close: string; closed: boolean }>)[day]
                  if (!h) return null
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-[#737373]">{days[day]}</span>
                      <span className={h.closed ? 'text-coral' : 'text-[#1A1A1A] font-medium'}>
                        {h.closed ? t('negocio.fechado_dia') : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Fundo */}
          {b.plan === 'associado' && (
            <div className="bg-teal-light border border-teal/20 rounded-2xl p-5 text-sm text-teal leading-relaxed">
              <strong>{t('negocio.negocio_associado')}</strong> {t('negocio.negocio_associado_desc')}{' '}
              <Link to={lp('/apoie')} className="underline">{t('negocio.saiba_mais')}</Link>
            </div>
          )}
        </aside>
      </div>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={[b.cover_url, ...(b.photos ?? [])].filter((u): u is string => !!u)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  )
}
