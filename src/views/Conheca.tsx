'use client'

import { usePageMeta } from '@/hooks/usePageMeta'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'

export default function Conheca() {
  const { t } = useTranslation()
  const localePath = useLocalePath()

  usePageMeta({
    title: t('conheca.meta_title'),
    description: t('conheca.meta_desc'),
  })

  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-16">
      <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-[72px] leading-none text-[#1A1A1A] mb-8">
        {t('conheca.badge')}
      </h1>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.titulo')}</h2>
        <p className="text-lg leading-relaxed text-[#3D3D3D]">{t('conheca.desc')}</p>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.historia_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">{t('conheca.historia_desc')}</p>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.praias_titulo')}</h2>
        <div className="space-y-4 text-[#3D3D3D] leading-relaxed">
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_xepa_nome')}:</strong>{' '}
            {t('conheca.praias_xepa_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_minhoto_nome')}:</strong>{' '}
            {t('conheca.praias_minhoto_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_maceio_nome')}:</strong>{' '}
            {t('conheca.praias_maceio_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_tourinhos_nome')}:</strong>{' '}
            {t('conheca.praias_tourinhos_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_santo_cristo_nome')}:</strong>{' '}
            {t('conheca.praias_santo_cristo_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_marco_nome')}:</strong>{' '}
            {t('conheca.praias_marco_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_cardeiro_nome')}:</strong>{' '}
            {t('conheca.praias_cardeiro_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_ze_martins_nome')}:</strong>{' '}
            {t('conheca.praias_ze_martins_desc')}
          </div>
          <div>
            <strong className="text-[#1A1A1A]">{t('conheca.praias_amor_nome')}:</strong>{' '}
            {t('conheca.praias_amor_desc')}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.gastronomia_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">{t('conheca.gastronomia_desc')}</p>
        <a href={localePath('/come')} className="inline-block mt-4 text-teal font-semibold hover:underline">
          {t('conheca.cta_come')} &rarr;
        </a>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.esportes_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">{t('conheca.esportes_desc')}</p>
        <a href={localePath('/passeie')} className="inline-block mt-4 text-teal font-semibold hover:underline">
          {t('conheca.cta_passeie')} &rarr;
        </a>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.vida_noturna_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">{t('conheca.vida_noturna_desc')}</p>
        <a href={localePath('/participe')} className="inline-block mt-4 text-teal font-semibold hover:underline">
          {t('conheca.cta_participe')} &rarr;
        </a>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.infra_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">{t('conheca.infra_desc')}</p>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.chegar_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">
          <strong>{t('conheca.chegar_carro_label')}</strong> {t('conheca.chegar_carro_desc')}
          <br /><br />
          <strong>{t('conheca.chegar_onibus_label')}</strong> {t('conheca.chegar_onibus_desc')}
          <br /><br />
          <strong>{t('conheca.chegar_dica_label')}</strong> {t('conheca.chegar_dica_desc')}
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <a href={localePath('/transfer')} className="inline-block text-teal font-semibold hover:underline">
            {t('conheca.cta_transfer')} &rarr;
          </a>
          <a href="/blog/como-chegar-sao-miguel-do-gostoso" className="inline-block text-teal font-semibold hover:underline">
            {t('conheca.cta_blog_chegar')} &rarr;
          </a>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.epoca_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">
          <strong>{t('conheca.epoca_vento_label')}</strong> {t('conheca.epoca_vento_desc')}
          <br />
          <strong>{t('conheca.epoca_chuvas_label')}</strong> {t('conheca.epoca_chuvas_desc')}
          <br />
          <strong>{t('conheca.epoca_reveillon_label')}</strong> {t('conheca.epoca_reveillon_desc')}
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.reveillon_titulo')}</h2>
        <p className="text-[#3D3D3D] leading-relaxed">{t('conheca.reveillon_desc')}</p>
      </section>
    </main>
  )
}
