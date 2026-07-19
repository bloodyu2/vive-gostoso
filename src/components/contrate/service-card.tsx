import { Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ServiceListing } from '@/types/database'
import { SERVICE_CATEGORY_LABELS } from '@/types/database'
import { buildWhatsAppLink } from '@/lib/whatsapp'

interface Props { service: ServiceListing }

/**
 * A freelancer is a person, not a place — circular avatar rather than the
 * boxed/square photo pattern used for businesses. Sized to sit in the same
 * grid as ProfessionalCard (src/views/Contrate.tsx), which it's rendered
 * alongside.
 */
export function ServiceCard({ service }: Props) {
  const { t } = useTranslation()
  const wa = buildWhatsAppLink(
    service.whatsapp,
    `Olá ${service.name}, vi seu perfil no Vive Gostoso e gostaria de saber mais sobre: ${service.headline}`,
  )

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          {service.photo_url ? (
            <img
              src={service.photo_url}
              alt={service.name}
              loading="lazy"
              decoding="async"
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-teal/15 flex items-center justify-center">
              <span className="font-display font-bold text-sm text-teal">
                {service.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {service.is_featured && (
            <span
              title={t('filters.destaque')}
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-ocre text-white text-[9px] font-bold flex items-center justify-center border-2 border-white"
            >
              ★
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A1A] text-sm leading-snug truncate">{service.name}</h3>
          <p className="text-teal text-xs font-medium mt-0.5 truncate">{service.headline}</p>
        </div>
      </div>

      <span className="inline-block text-[10px] font-semibold text-[#555] bg-[#F5F2EE] px-2 py-0.5 rounded-full mb-2.5">
        {SERVICE_CATEGORY_LABELS[service.service_category]}
      </span>

      {service.description && (
        <p className="text-[#737373] text-xs leading-relaxed line-clamp-2 mb-3">{service.description}</p>
      )}

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full bg-teal text-white rounded-xl py-2 text-xs font-semibold hover:bg-teal/90 transition-colors"
      >
        <Phone className="w-3.5 h-3.5" />
        {t('contrate.chamar_whatsapp')}
      </a>
    </div>
  )
}
