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
      <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-[72px] leading-none text-[#1A1A1A] mb-8">{t('conheca.badge')}</h1>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">{t('conheca.titulo')}</h2>
        <p className="text-lg leading-relaxed text-[#3D3D3D]">
          {t('conheca.desc')}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">Praias</h2>
        <div className="space-y-4 text-[#3D3D3D] leading-relaxed">
          <div><strong className="text-[#1A1A1A]">Praia do Minhoto:</strong> a principal, com restaurantes, bares e kite na beira d'água.</div>
          <div><strong className="text-[#1A1A1A]">Praia do Maceió:</strong> mais tranquila, boa para famílias, águas rasas e quentes.</div>
          <div><strong className="text-[#1A1A1A]">Praia de Tourinhos:</strong> ponto favorito dos kitesurfistas avançados, vento constante e ondas.</div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">Como chegar</h2>
        <p className="text-[#3D3D3D] leading-relaxed">
          <strong>De carro:</strong> BR-101 Norte até Natal, depois RN-221 e RN-021 em direção a Touros. Gostoso fica a ~100 km da capital.<br /><br />
          <strong>De ônibus:</strong> saem ônibus de Natal (Rodoviária) até São Miguel do Gostoso. ~2h30 de viagem.<br /><br />
          <strong>Dica:</strong> chegando em Natal, o transfer de van é a opção mais cômoda.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold mb-3">Melhor época</h2>
        <p className="text-[#3D3D3D] leading-relaxed">
          <strong>Temporada de vento:</strong> agosto a janeiro, ideal para kite e windsurf.<br />
          <strong>Temporada de chuvas:</strong> fevereiro a julho, mais tranquilo, preços menores, menos turistas.<br />
          <strong>Réveillon:</strong> um dos mais famosos do Brasil, cerca de 2.500 pessoas por noite, 5 a 6 dias.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mb-3">O Réveillon do Gostoso</h2>
        <p className="text-[#3D3D3D] leading-relaxed">
          Todo ano, entre 28 de dezembro e 2 de janeiro, Gostoso recebe turistas de todo o Brasil.
          Música ao vivo na beira da praia, fogos sobre o mar, gastronomia local em plena forma.
          Reserve pousada com antecedência: lota desde outubro.
        </p>
      </section>
    </main>
  )
}
