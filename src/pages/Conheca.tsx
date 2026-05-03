import { usePageMeta } from '@/hooks/usePageMeta'
import { useTranslation } from 'react-i18next'

export default function Conheca() {
  const { t } = useTranslation()
  usePageMeta({
    title: 'Conheça Gostoso',
    description: 'A história, as praias, como chegar e a melhor época para visitar São Miguel do Gostoso.',
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
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.praias_titulo')}</h2>
        <div className="space-y-4 text-[#3D3D3D] leading-relaxed">
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
        </div>
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
