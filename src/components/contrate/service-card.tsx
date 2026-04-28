import { Phone } from 'lucide-react'
import type { ServiceListing } from '@/types/database'
import { SERVICE_CATEGORY_LABELS } from '@/types/database'

interface Props { service: ServiceListing }

export function ServiceCard({ service }: Props) {
  const wa = `https://wa.me/${service.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${service.name}, vi seu perfil no Vive Gostoso e gostaria de saber mais sobre: ${service.headline}`)}`

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden hover:shadow-md transition-shadow">
      {/* Avatar / foto */}
      <div className="aspect-[4/3] bg-gradient-to-br from-teal/20 to-teal-dark/30 relative overflow-hidden">
        {service.photo_url
          ? <img src={service.photo_url} alt={service.name} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center">
                <span className="font-display font-bold text-2xl text-teal">
                  {service.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )
        }
        {service.is_featured && (
          <div className="absolute top-3 right-3 bg-ocre text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Destaque
          </div>
        )}
        {/* Category pill */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-[#1A1A1A] text-xs font-semibold px-3 py-1 rounded-full">
          {SERVICE_CATEGORY_LABELS[service.service_category]}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-[#1A1A1A] text-base leading-snug">{service.name}</h3>
        <p className="text-teal text-sm font-medium mt-0.5">{service.headline}</p>
        {service.description && (
          <p className="text-[#737373] text-sm mt-2 leading-relaxed line-clamp-3">{service.description}</p>
        )}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
        >
          <Phone className="w-4 h-4" />
          Chamar no WhatsApp
        </a>
      </div>
    </div>
  )
}
