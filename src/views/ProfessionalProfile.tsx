// src/views/ProfessionalProfile.tsx
'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, AtSign, Globe, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProfessional } from '@/hooks/useProfessionals'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useLocalePath } from '@/hooks/useLocalePath'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { PROFESSIONAL_CATEGORY_LABELS } from '@/types/professional'
import type { PortfolioItem } from '@/types/professional'

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <span className="text-[#C2760C]">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

const AVATAR_COLORS = [
  'bg-teal', 'bg-[#C2760C]', 'bg-[#4A5568]', 'bg-[#6B46C1]',
  'bg-[#C05621]', 'bg-[#276749]',
]
function avatarColor(id: string): string {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}
function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function ProfessionalProfile({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { data: pro, isLoading } = useProfessional(slug)

  usePageMeta(
    pro
      ? {
          title: `${pro.display_name} — Vive Gostoso`,
          description: pro.headline,
          url: `https://vivegostoso.com.br/contrate/profissional/${pro.slug}`,
          image: pro.photo_url ?? undefined,
        }
      : { title: 'Profissional — Vive Gostoso' }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('professional.profile_not_found')}</p>
          <Link href={lp('/contrate')} className="text-teal text-sm hover:underline">
            {t('professional.back_to_contrate')}
          </Link>
        </div>
      </div>
    )
  }

  const waLink = pro.whatsapp
    ? buildWhatsAppLink(pro.whatsapp, {
        source: 'professional_profile',
        name: pro.display_name,
        specialty: pro.specialties[0],
      })
    : null

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Hero */}
      <section className="bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
          <Link
            href={lp('/contrate')}
            className="inline-flex items-center gap-1.5 text-[#888] text-sm hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('contrate.tab_profissionais')}
          </Link>

          <div className="flex items-start gap-5">
            {/* Avatar */}
            {pro.photo_url ? (
              <img
                src={pro.photo_url}
                alt={pro.display_name}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-2xl text-white ${avatarColor(pro.id)}`}>
                {initials(pro.display_name)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-white">
                  {pro.display_name}
                </h1>
                <span className="text-xs font-semibold bg-teal/20 text-teal px-2 py-0.5 rounded-full">
                  {PROFESSIONAL_CATEGORY_LABELS[pro.category]}
                </span>
              </div>
              <p className="text-[#888] text-sm mb-3">{pro.headline}</p>
              <div className="flex flex-wrap gap-1.5">
                {pro.specialties.map(s => (
                  <span key={s} className="bg-teal/10 text-teal text-xs font-medium px-2.5 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-8 space-y-8">

        {/* Sobre */}
        {pro.bio && (
          <div>
            <h2 className="text-xs font-bold text-[#737373] uppercase tracking-wide mb-3">{t('professional.sobre')}</h2>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{pro.bio}</p>
          </div>
        )}

        {/* Links */}
        {(pro.instagram || pro.website) && (
          <div className="flex flex-wrap gap-3">
            {pro.instagram && (
              <a
                href={`https://instagram.com/${pro.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#1A1A1A] transition-colors"
              >
                <AtSign className="w-4 h-4" />
                {pro.instagram}
              </a>
            )}
            {pro.website && (
              <a
                href={pro.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#1A1A1A] transition-colors"
              >
                <Globe className="w-4 h-4" />
                {t('professional.website')}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Portfólio */}
        {pro.portfolio_items.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#737373] uppercase tracking-wide mb-3">{t('professional.portfolio_label')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pro.portfolio_items.map((item: PortfolioItem) => (
                <div key={item.id} className="bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-[#1A1A1A] text-sm mb-1">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-[#737373] leading-relaxed">{item.description}</p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal mt-2 hover:underline"
                      >
                        {t('professional.ver_projeto')} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valor por hora */}
        {pro.hourly_rate && (
          <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5">
            <p className="text-xs font-bold text-[#737373] uppercase tracking-wide mb-1">
              {t('professional.hourly_rate_label')}
            </p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              R$ {(pro.hourly_rate / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Reviews */}
        <div className="border-t border-[#E8E4DF] pt-8 mt-8">
          <h3 className="font-display text-lg font-semibold mb-4">{t('negocio.avaliacoes')}</h3>
          <ReviewList targetType="professional" targetId={pro.id} />
          <div className="mt-6">
            <ReviewForm targetType="professional" targetId={pro.id} />
          </div>
        </div>

      </section>

      {/* Sticky WhatsApp CTA */}
      {waLink && (
        <div className="sticky bottom-0 bg-white border-t border-[#E8E4DF] px-5 py-4">
          <div className="max-w-3xl mx-auto">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-teal text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-teal/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t('professional.falar_whatsapp')}
              <span className="text-xs font-normal opacity-75">{t('professional.cta_whatsapp_hint')}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
