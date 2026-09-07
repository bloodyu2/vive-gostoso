'use client'

import Link from 'next/link'
import { Building2, Camera, Coins, ImageOff, LogIn, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParametros } from '@/hooks/useParametros'
import { CHAVES, parametro, precoEmReais, type Parametros } from '@/lib/parametros'
import { useLocalePath } from '@/hooks/useLocalePath'
import { FAQSection } from '@/components/blog'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'

type TransparenciaProps = { initialParametros?: Parametros }

export default function Transparencia({ initialParametros }: TransparenciaProps) {
  const { t, i18n } = useTranslation()
  /* Mesma fonte da /sobre, da /parceiros e do painel. Ate 2026-09-07 esta
     pagina dizia "R$30 ou R$50" enquanto o painel cobrava R$39,90 e R$59,90. */
  const { data: param } = useParametros(
    initialParametros ? { initialData: initialParametros } : undefined
  )
  const pct = (chave: string) => {
    const v = parametro(param, chave)
    return v === undefined ? null : `${v}%`
  }
  const preco = (chave: string) => {
    const c = parametro(param, chave)
    return c === undefined ? null : precoEmReais(c)
  }
  const lp = useLocalePath()

  const faqItems = (i18n.getResource(i18n.language, 'translation', 'transparencia.faq') ??
    i18n.getResource('pt', 'translation', 'transparencia.faq') ??
    []) as { question: string; answer: string }[]

  const CONTA_STATS = [0, 1, 2, 3] as const

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-4xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 bg-teal/20 text-teal-light text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" />
            {t('transparencia.badge')}
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6">
            {t('transparencia.titulo')}
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
            {t('transparencia.desc')}
          </p>
        </div>
      </section>

      {/* 1. Não vendemos nada do que recomendamos */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-6">
          {t('transparencia.vendemos_h2')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed">
          <p>{t('transparencia.vendemos_p1')}</p>
          <p>{t('transparencia.vendemos_p2')}</p>
        </div>
      </section>

      {/* 2. O que significa verificado */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('transparencia.selo_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
            {t('transparencia.selo_h2')}
          </h2>

          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed pt-2">
                {t('transparencia.selo_intro')}
              </p>
            </div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] pl-14">
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">a)</span> {t('transparencia.selo_item_a')}</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">b)</span> {t('transparencia.selo_item_b')}</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">c)</span> {t('transparencia.selo_item_c')}</li>
            </ul>
          </div>

          <p className="text-[#737373] text-base leading-relaxed mb-8 max-w-2xl">
            {t('transparencia.selo_aprovacao')}
          </p>

          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6 md:p-8">
            <p className="font-semibold text-[#1A1A1A] dark:text-white text-base mb-4">
              {t('transparencia.selo_retirada_intro')}
            </p>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] mb-5">
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">•</span> {t('transparencia.selo_retirada_item_0')}</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">•</span> {t('transparencia.selo_retirada_item_1')}</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">•</span> {t('transparencia.selo_retirada_item_2')}</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">•</span> {t('transparencia.selo_retirada_item_3')}</li>
            </ul>
            <p className="text-sm text-[#737373] leading-relaxed">
              {t('transparencia.selo_retirada_processo')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sobre as fotos */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('transparencia.fotos_eyebrow')}</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
          {t('transparencia.fotos_h2')}
        </h2>
        <div className="p-5 bg-areia dark:bg-[#161616] rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] flex items-start gap-4">
          <ImageOff className="w-5 h-5 text-ocre flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#737373] leading-relaxed space-y-2">
            <p>{t('transparencia.fotos_p1')}</p>
            <p>{t('transparencia.fotos_p2')}</p>
          </div>
        </div>

        {/* Direitos de imagem. Fica junto de "sobre as fotos" de proposito: e a
            mesma conversa, quem e dono da foto que voce esta vendo. */}
        <div className="mt-4 p-5 bg-areia dark:bg-[#161616] rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] flex items-start gap-4">
          <Camera className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#737373] leading-relaxed space-y-2">
            <p>{t('transparencia.fotos_p3')}</p>
            <p>{t('transparencia.fotos_p4')}</p>
          </div>
        </div>
      </section>

      {/* 4. Como um negócio entra e como sai */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('transparencia.entrada_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
            {t('transparencia.entrada_h2')}
          </h2>
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6 md:p-8 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center flex-shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <p className="text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed pt-2">
                {t('transparencia.entrada_p1')}
              </p>
            </div>
            <p className="text-[#737373] text-sm leading-relaxed pl-14">
              {t('transparencia.entrada_p2')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Quem paga a conta */}
      <section className="bg-teal text-white px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-light/70 mb-3">{t('transparencia.conta_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10 text-white">
            {t('transparencia.conta_h2')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {CONTA_STATS.map(i => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 text-center">
                <div className="text-4xl font-display font-bold mb-2">{pct([CHAVES.gratuito, CHAVES.rateioCidade, CHAVES.rateioOperacao, CHAVES.lucro][i])}</div>
                <div className="text-teal-light text-sm font-medium leading-snug">{t(`transparencia.conta_stat_${i}_label`)}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              {preco(CHAVES.planoAssociado) && preco(CHAVES.planoDestaque)
                ? t('transparencia.conta_desc', {
                    precoAssociado: preco(CHAVES.planoAssociado),
                    precoDestaque: preco(CHAVES.planoDestaque),
                  })
                : t('transparencia.conta_desc_sem_preco')}
            </p>
            <Link href={lp('/apoie')} className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-teal font-semibold px-5 py-2.5 rounded-full hover:bg-teal-light transition-colors text-sm text-center">
              <Coins className="w-4 h-4" />
              {t('transparencia.conta_link_texto')}
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Quem faz */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('transparencia.quem_eyebrow')}</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
          {t('transparencia.quem_h2')}
        </h2>
        <div className="max-w-md">
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">Balaio</div>
                <div className="text-xs text-[#737373]">{t('transparencia.quem_cnpj')}</div>
              </div>
            </div>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">{t('transparencia.quem_desc')}</p>
            <p className="text-xs text-[#737373] mb-4">{t('transparencia.quem_horario')}</p>
            <div className="flex flex-col gap-2.5">
              <a
                href={buildWhatsAppLink(OFFICIAL_WHATSAPP, undefined, t)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-teal-dark transition-colors justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                {t('transparencia.quem_whatsapp_btn')}
              </a>
              <a
                href={`mailto:${t('transparencia.quem_email')}`}
                className="inline-flex items-center gap-2 text-teal text-sm hover:underline justify-center"
              >
                <Mail className="w-3.5 h-3.5" />
                {t('transparencia.quem_email')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <FAQSection items={faqItems} heading={t('transparencia.faq_titulo')} />
        </div>
      </section>
    </main>
  )
}
