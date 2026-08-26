'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, Car, Clock, Users, Languages, CreditCard,
  AlertCircle, MapPin, MessageCircle, Share2, CheckCircle,
} from 'lucide-react'
import type { Transfer, TransferRoute } from '@/types/database'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { useLocalePath } from '@/hooks/useLocalePath'

function routeKey(r: TransferRoute) { return `${r.from}|||${r.to}` }

function buildWaMessage(transfer: Transfer, route: TransferRoute | null): string {
  const base = `Olá! Vi o serviço da *${transfer.provider_name}* no Vive Gostoso.\n\n`
  if (route) {
    const price = route.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
    return `${base}Rota: ${route.from} → ${route.to}\nValor: R$ ${price}\n\nPode confirmar disponibilidade?`
  }
  return `${base}Pode confirmar disponibilidade?`
}

export default function TransferDetailPage({ transfer }: { transfer: Transfer }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const [selectedRouteKey, setSelectedRouteKey] = useState('')
  const [shareCopied, setShareCopied] = useState(false)

  const selectedRoute = transfer.routes?.find(r => routeKey(r) === selectedRouteKey) ?? null
  const waUrl = buildWhatsAppLink(transfer.whatsapp, buildWaMessage(transfer, selectedRoute))

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: transfer.provider_name, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }
    } catch { /* user cancelled */ }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-3">
          <Link
            href={lp('/transfer')}
            className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Transfer
          </Link>
          <button
            onClick={handleShare}
            title={t('transfer.modal_compartilhar')}
            aria-label={t('transfer.modal_compartilhar')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] transition-colors text-[#737373] hover:text-teal"
          >
            {shareCopied ? <CheckCircle className="w-5 h-5 text-teal" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {transfer.photo_url && (
        <div className="w-full h-56 md:h-72">
          <img src={transfer.photo_url} alt={transfer.provider_name} className="w-full h-full object-cover" />
        </div>
      )}

      <main className="max-w-2xl mx-auto px-5 md:px-8 py-8 pb-28 space-y-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1A1A1A]">{transfer.provider_name}</h1>
          {transfer.vehicle_type && (
            <p className="text-sm text-[#737373] mt-1 flex items-center gap-1.5">
              <Car className="w-4 h-4 flex-shrink-0" />
              {transfer.vehicle_type} · {transfer.max_passengers} {t('transfer.detail_passageiros')}
            </p>
          )}
        </div>

        {/* Rotas e valores */}
        {transfer.routes && transfer.routes.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-3">
              {t('transfer.detail_rotas')}
            </h2>
            <div className="space-y-2">
              {transfer.routes.map(r => {
                const key = routeKey(r)
                const isSelected = key === selectedRouteKey
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRouteKey(isSelected ? '' : key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      isSelected ? 'border-teal bg-teal/5' : 'border-[#E8E4DF] hover:border-teal/40'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-teal' : 'text-[#1A1A1A]'}`}>
                      {r.from} → {r.to}
                    </span>
                    <span className={`font-display font-bold text-base ${isSelected ? 'text-teal' : 'text-[#1A1A1A]'}`}>
                      R$ {r.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </button>
                )
              })}
            </div>
            {selectedRoute && (
              <p className="text-xs text-teal mt-2 font-medium">{t('transfer.detail_rota_selecionada')}</p>
            )}
          </section>
        )}

        {/* Detalhes */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-3">
            {t('transfer.detail_detalhes')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {transfer.available_hours && (
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_horario')}</p>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.available_hours}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_capacidade')}</p>
                <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.max_passengers} {t('transfer.detail_passageiros')}</p>
              </div>
            </div>
            {transfer.languages && transfer.languages.length > 0 && (
              <div className="flex items-start gap-2.5 col-span-2">
                <Languages className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_idiomas')}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {transfer.languages.map(l => (
                      <span key={l} className="bg-[#F5F2EE] text-[#737373] text-xs px-2 py-0.5 rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Logística */}
        {(transfer.advance_notice || (transfer.payment_methods && transfer.payment_methods.length > 0) || transfer.meeting_point) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-3">
              {t('transfer.detail_logistica')}
            </h2>
            <div className="space-y-3">
              {transfer.advance_notice && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_antecedencia')}</p>
                    <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.advance_notice}</p>
                  </div>
                </div>
              )}
              {transfer.payment_methods && transfer.payment_methods.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_pagamentos')}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {transfer.payment_methods.map(m => (
                        <span key={m} className="bg-ocre/10 text-ocre text-xs px-2 py-0.5 rounded-full font-medium">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {transfer.meeting_point && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase tracking-wide font-semibold">{t('transfer.detail_encontro')}</p>
                    <p className="text-sm text-[#1A1A1A] mt-0.5">{transfer.meeting_point}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {transfer.description && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-2">
              {t('transfer.detail_descricao')}
            </h2>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{transfer.description}</p>
          </section>
        )}

        {transfer.observations && (
          <section>
            <div className="flex items-start gap-2.5 bg-[#FFF9F0] border border-ocre/20 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-ocre uppercase tracking-wide font-bold mb-1">{t('transfer.detail_observacoes')}</p>
                <p className="text-sm text-[#3D3D3D] leading-relaxed">{transfer.observations}</p>
              </div>
            </div>
          </section>
        )}

        {/* Avaliações */}
        <section className="border-t border-[#E8E4DF] pt-6">
          <h2 className="font-display text-lg font-semibold mb-4">{t('negocio.avaliacoes')}</h2>
          <ReviewList
            targetType={transfer.business_id ? 'business' : 'transfer'}
            targetId={transfer.business_id ?? transfer.id}
          />
          <div className="mt-6">
            <ReviewForm
              targetType={transfer.business_id ? 'business' : 'transfer'}
              targetId={transfer.business_id ?? transfer.id}
            />
          </div>
        </section>
      </main>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E8E4DF] px-5 py-4">
        <div className="max-w-2xl mx-auto">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-teal text-white px-4 py-3.5 rounded-xl text-sm font-semibold hover:bg-teal/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('transfer.detail_entrar_contato')}
          </a>
        </div>
      </div>
    </div>
  )
}
