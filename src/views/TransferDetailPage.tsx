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
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'
import { ShimmerButton } from '@/components/magicui/shimmer-button'

const AIRPORT_RE = /aeroporto|natal|\bnat\b/i

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

  const routes = transfer.routes ?? []
  const airport = routes.find(r => AIRPORT_RE.test(r.from) || AIRPORT_RE.test(r.to)) ?? null
  // A rota mostrada em destaque: a escolhida, senão a do aeroporto, senão a primeira.
  const selectedRoute = routes.find(r => routeKey(r) === selectedRouteKey) ?? airport ?? routes[0] ?? null
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

  const hasLogistics = Boolean(transfer.advance_notice || (transfer.payment_methods && transfer.payment_methods.length > 0) || transfer.meeting_point)
  const infoCard = 'rounded-2xl border border-border-1 bg-white dark:bg-card p-5'
  const infoLabel = 'text-xs text-fg-3-texto font-semibold'
  const h2Cls = 'font-display font-semibold text-xl text-fg-1 mb-3'

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-transparent">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-card border-b border-border-1">
        <div className="max-w-3xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-3">
          <Link
            href={lp('/transfer')}
            className="inline-flex items-center gap-1.5 min-h-11 text-sm text-fg-3-texto hover:text-teal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Transfer
          </Link>
          <button
            onClick={handleShare}
            title={t('transfer.modal_compartilhar')}
            aria-label={t('transfer.modal_compartilhar')}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#F5F2EE] dark:hover:bg-white/10 transition-colors text-fg-3-texto hover:text-teal"
          >
            {shareCopied ? <CheckCircle className="w-5 h-5 text-teal" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-8 pb-28 space-y-8">
        {/* Rota e valor primeiro */}
        <section aria-labelledby="transfer-titulo">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {transfer.vehicle_type && (
              <span className="inline-flex items-center gap-1.5 bg-teal/10 text-teal-dark dark:text-teal-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Car className="w-3.5 h-3.5" aria-hidden="true" />
                {transfer.vehicle_type}
              </span>
            )}
          </div>
          <h1 id="transfer-titulo" className="font-display font-bold text-2xl md:text-3xl text-fg-1 mb-4">{transfer.provider_name}</h1>

          {selectedRoute && (
            <div className="rounded-2xl bg-teal-dark text-white p-6 md:p-8">
              <p className="font-display font-bold text-3xl md:text-5xl leading-[1.1] tracking-tight">
                {selectedRoute.from}
                <span className="block text-xl md:text-2xl font-medium opacity-80 my-1" aria-hidden="true">↓</span>
                <span className="sr-only"> {t('transfer.para')} </span>
                {selectedRoute.to}
              </p>
              <p className="mt-5 font-display font-bold text-5xl md:text-6xl tracking-tight">
                R$ {selectedRoute.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
          )}
        </section>

        {transfer.photo_url && (
          <BlurFade>
            <img
              src={transfer.photo_url}
              alt={transfer.vehicle_type ? `${transfer.provider_name}, ${transfer.vehicle_type} em São Miguel do Gostoso` : `${transfer.provider_name} em São Miguel do Gostoso`}
              className="w-full h-56 md:h-72 object-cover rounded-2xl"
            />
          </BlurFade>
        )}

        {/* Outras rotas */}
        {routes.length > 1 && (
          <BlurFade>
            <section>
              <h2 className={h2Cls}>{t('transfer.detail_rotas')}</h2>
              <div className="space-y-2">
                {routes.map(r => {
                  const key = routeKey(r)
                  const isSelected = selectedRoute ? key === routeKey(selectedRoute) : false
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRouteKey(key)}
                      aria-pressed={isSelected}
                      className={`w-full flex items-center justify-between gap-3 px-4 min-h-12 py-2 rounded-xl border text-left transition-colors ${
                        isSelected ? 'border-teal bg-teal/5' : 'border-border-1 bg-white dark:bg-card hover:border-teal/40'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? 'text-teal' : 'text-fg-1'}`}>
                        {r.from} → {r.to}
                      </span>
                      <span className={`font-display font-bold text-base shrink-0 ${isSelected ? 'text-teal' : 'text-fg-1'}`}>
                        R$ {r.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-fg-3-texto mt-2">{t('transfer.detail_rota_selecionada')}</p>
            </section>
          </BlurFade>
        )}

        {/* Veículo e motorista */}
        <BlurFade>
          <section>
            <h2 className={h2Cls}>{t('transfer.detail_detalhes')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MagicCard className={infoCard}>
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className={infoLabel}>{t('transfer.detail_capacidade')}</p>
                    <p className="text-sm text-fg-1 mt-0.5">{transfer.max_passengers} {t('transfer.detail_passageiros')}</p>
                  </div>
                </div>
              </MagicCard>
              {transfer.available_hours && (
                <MagicCard className={infoCard}>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className={infoLabel}>{t('transfer.detail_horario')}</p>
                      <p className="text-sm text-fg-1 mt-0.5">{transfer.available_hours}</p>
                    </div>
                  </div>
                </MagicCard>
              )}
              {transfer.languages && transfer.languages.length > 0 && (
                <MagicCard className={`${infoCard} sm:col-span-2`}>
                  <div className="flex items-start gap-2.5">
                    <Languages className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className={infoLabel}>{t('transfer.detail_idiomas')}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transfer.languages.map(l => (
                          <span key={l} className="bg-[#F5F2EE] dark:bg-white/10 text-fg-3-texto text-xs px-2 py-0.5 rounded-full">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </MagicCard>
              )}
            </div>
          </section>
        </BlurFade>

        {/* Logística */}
        {hasLogistics && (
          <BlurFade>
            <section>
              <h2 className={h2Cls}>{t('transfer.detail_logistica')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {transfer.advance_notice && (
                  <MagicCard className={infoCard}>
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className={infoLabel}>{t('transfer.detail_antecedencia')}</p>
                        <p className="text-sm text-fg-1 mt-0.5">{transfer.advance_notice}</p>
                      </div>
                    </div>
                  </MagicCard>
                )}
                {transfer.meeting_point && (
                  <MagicCard className={infoCard}>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className={infoLabel}>{t('transfer.detail_encontro')}</p>
                        <p className="text-sm text-fg-1 mt-0.5">{transfer.meeting_point}</p>
                      </div>
                    </div>
                  </MagicCard>
                )}
                {transfer.payment_methods && transfer.payment_methods.length > 0 && (
                  <MagicCard className={`${infoCard} sm:col-span-2`}>
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className={infoLabel}>{t('transfer.detail_pagamentos')}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {transfer.payment_methods.map(m => (
                            <span key={m} className="bg-ocre/10 text-ocre-texto text-xs px-2 py-0.5 rounded-full font-medium">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                )}
              </div>
            </section>
          </BlurFade>
        )}

        {transfer.description && (
          <BlurFade>
            <section>
              <h2 className={h2Cls}>{t('transfer.detail_descricao')}</h2>
              <p className="text-sm text-fg-2 leading-relaxed">{transfer.description}</p>
            </section>
          </BlurFade>
        )}

        {transfer.observations && (
          <BlurFade>
            <section>
              <div className="flex items-start gap-2.5 bg-ocre-light border border-ocre/20 rounded-2xl p-4">
                <AlertCircle className="w-4 h-4 text-ocre flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-ocre-texto font-bold mb-1">{t('transfer.detail_observacoes')}</p>
                  <p className="text-sm text-fg-2 leading-relaxed">{transfer.observations}</p>
                </div>
              </div>
            </section>
          </BlurFade>
        )}

        {/* Avaliações */}
        <BlurFade>
          <section className="border-t border-border-1 pt-6">
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
        </BlurFade>
      </main>

      {/* Sticky footer CTA: a única ação primária */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-card border-t border-border-1 px-5 md:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <ShimmerButton
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-12 px-4 rounded-xl text-sm bg-ocre-dark hover:bg-ocre-700"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {t('transfer.detail_entrar_contato')}
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}
