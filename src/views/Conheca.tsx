'use client'

import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { BlurFade } from '@/components/magicui/blur-fade'
import { FatoTile } from '@/components/institucional/fato-tile'
import { Citacao } from '@/components/institucional/citacao'
import { SumarioPagina } from '@/components/institucional/sumario-pagina'

/* Praias com pagina de mares em /explore/mares/[slug]. A Praia do Marco ainda
   nao tem pagina, por isso fica sem link. O primeiro item e o destaque do Bento. */
const PRAIAS = [
  { chave: 'xepa', slug: 'xepa' },
  { chave: 'minhoto', slug: 'minhoto' },
  { chave: 'maceio', slug: 'maceio' },
  { chave: 'tourinhos', slug: 'tourinhos' },
  { chave: 'santo_cristo', slug: 'santo-cristo' },
  { chave: 'marco', slug: null },
  { chave: 'cardeiro', slug: 'cardeiro' },
  { chave: 'ze_martins', slug: 'ze-martins' },
] as const

const semDoisPontos = (s: string) => s.replace(/:\s*$/, '')

export default function Conheca() {
  const { t } = useTranslation()
  const lp = useLocalePath()

  const sumario = [
    { id: 'historia', rotulo: t('conheca.historia_titulo') },
    { id: 'praias', rotulo: t('conheca.praias_titulo') },
    { id: 'fazer', rotulo: t('conheca.fazer_titulo') },
    { id: 'chegar', rotulo: t('conheca.chegar_titulo') },
    { id: 'epoca', rotulo: t('conheca.epoca_titulo') },
    { id: 'reveillon', rotulo: t('conheca.reveillon_titulo') },
  ]

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-20">
      {/* Abertura: o titulo grande e a frase que resume a cidade */}
      <header className="mb-10 md:mb-14">
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-8xl leading-none tracking-tight text-fg-1 mb-6">
          {t('conheca.badge')}
        </h1>
        <p className="font-display text-2xl md:text-3xl leading-snug text-fg-1 max-w-3xl mb-3">
          {t('conheca.titulo')}
        </p>
        <p className="text-lg md:text-xl leading-relaxed text-fg-3-texto max-w-3xl">{t('conheca.desc')}</p>
      </header>

      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <SumarioPagina itens={sumario} titulo={t('institucional.nesta_pagina')} className="mb-10 lg:mb-0" />

        <div className="min-w-0 space-y-16 md:space-y-20">
          {/* Historia */}
          <section id="historia" className="scroll-mt-24">
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-5">{t('conheca.historia_titulo')}</h2>
            <p className="text-lg leading-relaxed text-fg-3-texto max-w-2xl mb-8">{t('conheca.historia_desc')}</p>
            <BlurFade>
              <Citacao>{t('conheca.historia_destaque')}</Citacao>
            </BlurFade>
          </section>

          {/* Praias: a Xepa em destaque, as outras em tamanho menor */}
          <section id="praias" className="scroll-mt-24">
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-6">{t('conheca.praias_titulo')}</h2>
            <BentoGrid>
              {PRAIAS.map((p, i) => (
                <BentoCard
                  key={p.chave}
                  titulo={t(`conheca.praias_${p.chave}_nome`)}
                  descricao={t(`conheca.praias_${p.chave}_desc`)}
                  href={p.slug ? lp(`/explore/mares/${p.slug}`) : undefined}
                  acao={p.slug ? t('conheca.ver_mares') : undefined}
                  tom={i === 0 ? 'teal' : 'papel'}
                  atraso={(i % 4) * 70}
                  className={i === 0 ? 'lg:col-span-2 lg:row-span-2' : undefined}
                />
              ))}
            </BentoGrid>
          </section>

          {/* O que fazer */}
          <section id="fazer" className="scroll-mt-24">
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-6">{t('conheca.fazer_titulo')}</h2>
            <BentoGrid>
              <BentoCard
                titulo={t('conheca.esportes_titulo')}
                descricao={t('conheca.esportes_desc')}
                href={lp('/passeie')}
                acao={t('conheca.cta_passeie')}
                tom="ocre"
                className="lg:col-span-2"
              />
              <BentoCard
                titulo={t('conheca.gastronomia_titulo')}
                descricao={t('conheca.gastronomia_desc')}
                href={lp('/come')}
                acao={t('conheca.cta_come')}
                atraso={70}
              />
              <BentoCard
                titulo={t('conheca.vida_noturna_titulo')}
                descricao={t('conheca.vida_noturna_desc')}
                href={lp('/participe')}
                acao={t('conheca.cta_participe')}
                atraso={140}
              />
              <BentoCard
                titulo={t('conheca.infra_titulo')}
                descricao={t('conheca.infra_desc')}
                tom="coral"
                atraso={210}
                className="lg:col-span-2"
              />
            </BentoGrid>
          </section>

          {/* Como chegar */}
          <section id="chegar" className="scroll-mt-24">
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-6">{t('conheca.chegar_titulo')}</h2>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              <FatoTile
                tom="teal"
                valor={t('conheca.fato_distancia_valor')}
                rotulo={semDoisPontos(t('conheca.chegar_carro_label'))}
                descricao={t('conheca.chegar_carro_desc')}
              />
              <FatoTile
                valor={t('conheca.fato_onibus_valor')}
                rotulo={semDoisPontos(t('conheca.chegar_onibus_label'))}
                descricao={t('conheca.chegar_onibus_desc')}
                atraso={70}
              />
            </div>
            <BlurFade delay={140}>
              <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <Citacao className="text-xl md:text-2xl">
                  {semDoisPontos(t('conheca.chegar_dica_label'))}: {t('conheca.chegar_dica_desc')}
                </Citacao>
                <div className="flex flex-col gap-1">
                  <a href={lp('/transfer')} className="inline-flex items-center min-h-11 text-teal-dark dark:text-teal font-semibold hover:underline">
                    {t('conheca.cta_transfer')} &rarr;
                  </a>
                  <a href={lp('/blog/como-chegar-sao-miguel-do-gostoso')} className="inline-flex items-center min-h-11 text-teal-dark dark:text-teal font-semibold hover:underline">
                    {t('conheca.cta_blog_chegar')} &rarr;
                  </a>
                </div>
              </div>
            </BlurFade>
          </section>

          {/* Melhor epoca */}
          <section id="epoca" className="scroll-mt-24">
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-6">{t('conheca.epoca_titulo')}</h2>
            <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
              <FatoTile
                tom="teal"
                valor={t('conheca.fato_vento_valor')}
                rotulo={semDoisPontos(t('conheca.epoca_vento_label'))}
                descricao={t('conheca.epoca_vento_desc')}
              />
              <FatoTile
                valor={t('conheca.fato_chuvas_valor')}
                rotulo={semDoisPontos(t('conheca.epoca_chuvas_label'))}
                descricao={t('conheca.epoca_chuvas_desc')}
                atraso={70}
              />
              <FatoTile
                tom="ocre"
                valor={t('conheca.fato_reveillon_valor')}
                rotulo={semDoisPontos(t('conheca.epoca_reveillon_label'))}
                descricao={t('conheca.epoca_reveillon_desc')}
                atraso={140}
              />
            </div>
          </section>

          {/* Reveillon */}
          <section id="reveillon" className="scroll-mt-24">
            <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-5">{t('conheca.reveillon_titulo')}</h2>
            <p className="text-lg leading-relaxed text-fg-3-texto max-w-2xl mb-8">{t('conheca.reveillon_desc')}</p>
            <BlurFade>
              <Citacao>{t('conheca.reveillon_destaque')}</Citacao>
            </BlurFade>
          </section>
        </div>
      </div>
    </main>
  )
}
