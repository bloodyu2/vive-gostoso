'use client'

import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParametros } from '@/hooks/useParametros'
import { CHAVES, parametro, precoEmReais, type Parametros } from '@/lib/parametros'
import { useLocalePath } from '@/hooks/useLocalePath'
import { FAQSection } from '@/components/blog'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'
import { BlurFade } from '@/components/magicui/blur-fade'
import { MagicCard } from '@/components/magicui/magic-card'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { Citacao } from '@/components/institucional/citacao'
import { SumarioPagina } from '@/components/institucional/sumario-pagina'

type TransparenciaProps = { initialParametros?: Parametros }

const H2 = 'font-display font-semibold text-3xl md:text-4xl tracking-tight text-fg-1'
const CARTAO = 'rounded-2xl bg-white dark:bg-card border border-border-1'

export default function Transparencia({ initialParametros }: TransparenciaProps) {
  const { t, i18n } = useTranslation()
  /* Mesma fonte da /sobre, da /parceiros e do painel. Ate 2026-09-07 esta
     pagina dizia "R$30 ou R$50" enquanto o painel cobrava R$39,90 e R$59,90. */
  const { data: param } = useParametros(
    initialParametros ? { initialData: initialParametros } : undefined
  )
  const preco = (chave: string) => {
    const c = parametro(param, chave)
    return c === undefined ? null : precoEmReais(c)
  }
  const lp = useLocalePath()

  const faqItems = (i18n.getResource(i18n.language, 'translation', 'transparencia.faq') ??
    i18n.getResource('pt', 'translation', 'transparencia.faq') ??
    []) as { question: string; answer: string }[]

  const CONTA = [CHAVES.gratuito, CHAVES.rateioCidade, CHAVES.rateioOperacao, CHAVES.lucro] as const

  const sumario = [
    { id: 'vendemos', rotulo: t('transparencia.toc_vendemos') },
    { id: 'selo', rotulo: t('transparencia.selo_eyebrow') },
    { id: 'fotos', rotulo: t('transparencia.fotos_eyebrow') },
    { id: 'cadastro', rotulo: t('transparencia.entrada_eyebrow') },
    { id: 'conta', rotulo: t('transparencia.conta_eyebrow') },
    { id: 'contato', rotulo: t('transparencia.quem_eyebrow') },
    { id: 'faq', rotulo: t('transparencia.faq_titulo') },
  ]

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-20">
      <header className="mb-12 md:mb-16">
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight text-fg-1 max-w-4xl mb-6">
          {t('transparencia.titulo')}
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-fg-3-texto max-w-3xl">{t('transparencia.desc')}</p>
      </header>

      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <SumarioPagina itens={sumario} titulo={t('institucional.nesta_pagina')} className="mb-10 lg:mb-0" />

        <div className="min-w-0 space-y-16 md:space-y-24">
          {/* 1. Nao vendemos nada do que recomendamos */}
          <section id="vendemos" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('transparencia.vendemos_h2')}</h2>
            <Citacao className="mb-5">{t('transparencia.vendemos_p1')}</Citacao>
            <p className="text-lg leading-relaxed text-fg-3-texto max-w-2xl">{t('transparencia.vendemos_p2')}</p>
          </section>

          {/* 2. O que significa verificado */}
          <section id="selo" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('transparencia.selo_h2')}</h2>
            <div className="grid lg:grid-cols-2 gap-4 md:gap-5 mb-8">
              <BlurFade className="h-full">
                <MagicCard className={`${CARTAO} h-full p-6 md:p-8`}>
                  <p className="font-display font-semibold text-xl text-fg-1 leading-snug mb-5">{t('transparencia.selo_intro')}</p>
                  <ul className="space-y-3 text-base text-fg-3-texto">
                    {(['a', 'b', 'c'] as const).map(l => (
                      <li key={l} className="flex items-start gap-3">
                        <span className="font-semibold text-teal-dark dark:text-teal w-5 shrink-0">{l})</span>
                        {t(`transparencia.selo_item_${l}`)}
                      </li>
                    ))}
                  </ul>
                </MagicCard>
              </BlurFade>
              <BlurFade delay={70} className="h-full">
                <MagicCard className={`${CARTAO} h-full p-6 md:p-8`}>
                  <p className="font-display font-semibold text-xl text-fg-1 leading-snug mb-5">{t('transparencia.selo_retirada_intro')}</p>
                  <ul className="space-y-3 text-base text-fg-3-texto mb-5">
                    {[0, 1, 2, 3].map(i => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-ocre-dark dark:text-ocre shrink-0" aria-hidden="true">•</span>
                        {t(`transparencia.selo_retirada_item_${i}`)}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-fg-3-texto leading-relaxed">{t('transparencia.selo_retirada_processo')}</p>
                </MagicCard>
              </BlurFade>
            </div>
            <BlurFade>
              <Citacao className="text-xl md:text-2xl">{t('transparencia.selo_aprovacao')}</Citacao>
            </BlurFade>
          </section>

          {/* 3. Sobre as fotos. Direitos de imagem ficam junto de proposito:
              e a mesma conversa, quem e dono da foto que voce esta vendo. */}
          <section id="fotos" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('transparencia.fotos_h2')}</h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <BlurFade className="h-full">
                <MagicCard className={`${CARTAO} h-full p-6 text-base text-fg-3-texto leading-relaxed space-y-3`}>
                  <p className="text-fg-1">{t('transparencia.fotos_p1')}</p>
                  <p>{t('transparencia.fotos_p2')}</p>
                </MagicCard>
              </BlurFade>
              <BlurFade delay={70} className="h-full">
                <MagicCard className={`${CARTAO} h-full p-6 text-base text-fg-3-texto leading-relaxed space-y-3`}>
                  <p className="text-fg-1">{t('transparencia.fotos_p3')}</p>
                  <p>{t('transparencia.fotos_p4')}</p>
                </MagicCard>
              </BlurFade>
            </div>
          </section>

          {/* 4. Como um negocio entra e como sai */}
          <section id="cadastro" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('transparencia.entrada_h2')}</h2>
            <Citacao className="mb-5">{t('transparencia.entrada_p1')}</Citacao>
            <p className="text-lg leading-relaxed text-fg-3-texto max-w-2xl">{t('transparencia.entrada_p2')}</p>
          </section>

          {/* 5. Quem paga a conta */}
          <section id="conta" className="scroll-mt-24">
            <BlurFade>
              <div className="rounded-2xl bg-teal-dark text-white p-6 md:p-10">
                <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-8">{t('transparencia.conta_h2')}</h2>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                  {CONTA.map((chave, i) => {
                    const v = parametro(param, chave)
                    return (
                      <div key={chave} className="flex flex-col-reverse justify-end">
                        <dt className="text-white/80 text-sm leading-snug mt-3">{t(`transparencia.conta_stat_${i}_label`)}</dt>
                        <dd className="font-display font-bold text-5xl leading-none tabular-nums">
                          {v === undefined ? null : <>{v > 0 ? <NumberTicker value={v} decimais={0} /> : '0'}%</>}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/20">
                  <p className="text-white/85 text-sm leading-relaxed max-w-md">
                    {preco(CHAVES.planoAssociado) && preco(CHAVES.planoDestaque)
                      ? t('transparencia.conta_desc', {
                          precoAssociado: preco(CHAVES.planoAssociado),
                          precoDestaque: preco(CHAVES.planoDestaque),
                        })
                      : t('transparencia.conta_desc_sem_preco')}
                  </p>
                  <Link href={lp('/apoie')} className="shrink-0 inline-flex items-center justify-center gap-2 min-h-11 bg-white text-teal-dark font-semibold px-5 rounded-full hover:bg-areia transition-colors text-sm text-center">
                    {t('transparencia.conta_link_texto')} <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </BlurFade>
          </section>

          {/* 6. Quem faz */}
          <section id="contato" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('transparencia.quem_h2')}</h2>
            <BlurFade>
              <MagicCard className={`${CARTAO} p-6 md:p-8 max-w-xl`}>
                <p className="font-display font-semibold text-2xl text-fg-1">Balaio</p>
                <p className="text-sm text-fg-3-texto mb-4">{t('transparencia.quem_cnpj')}</p>
                <p className="text-base text-fg-3-texto leading-relaxed mb-2">{t('transparencia.quem_desc')}</p>
                <p className="text-sm text-fg-3-texto mb-6">{t('transparencia.quem_horario')}</p>
                <div className="flex flex-col gap-2">
                  <ShimmerButton
                    href={buildWhatsAppLink(OFFICIAL_WHATSAPP, undefined, t)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-teal-dark hover:bg-teal-dark/90 min-h-12 px-6 rounded-xl text-sm"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    {t('transparencia.quem_whatsapp_btn')}
                  </ShimmerButton>
                  <a
                    href={`mailto:${t('transparencia.quem_email')}`}
                    className="inline-flex items-center justify-center gap-2 min-h-11 text-teal-dark dark:text-teal text-sm hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('transparencia.quem_email')}
                  </a>
                </div>
              </MagicCard>
            </BlurFade>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24">
            <FAQSection items={faqItems} heading={t('transparencia.faq_titulo')} />
          </section>
        </div>
      </div>
    </main>
  )
}
