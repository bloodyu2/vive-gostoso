'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useParametros } from '@/hooks/useParametros'
import { CHAVES, parametro, precoEmReais, type Parametros } from '@/lib/parametros'
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { Citacao } from '@/components/institucional/citacao'
import { SumarioPagina } from '@/components/institucional/sumario-pagina'

type SobreProps = { initialParametros?: Parametros }

/** Percentual do banco: conta ate o valor quando ele e maior que zero; zero fica zero, sem contador. */
function Pct({ valor, className }: { valor: number | undefined; className?: string }) {
  if (valor === undefined) return null
  return (
    <span className={className}>
      {valor > 0 ? <NumberTicker value={valor} decimais={0} /> : '0'}%
    </span>
  )
}

const H2 = 'font-display font-semibold text-3xl md:text-4xl tracking-tight text-fg-1'
const CARTAO = 'rounded-2xl bg-white dark:bg-card border border-border-1'

export default function Sobre({ initialParametros }: SobreProps) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  /* Preco e percentual vem da tabela gostoso_parametros_produto. Ate 2026-09-07
     esta pagina publicava R$30 e R$50 em literal dentro do JSX, enquanto o
     painel onde a pessoa assina cobrava R$39,90 e R$59,90. */
  const { data: param } = useParametros(
    initialParametros ? { initialData: initialParametros } : undefined
  )
  const preco = (chave: string) => {
    const c = parametro(param, chave)
    return c === undefined ? null : precoEmReais(c)
  }
  const rateio = parametro(param, CHAVES.rateioCidade) ?? ''

  const sumario = [
    { id: 'oque', rotulo: t('sobre.toc_oque') },
    { id: 'modelo', rotulo: t('sobre.modelo_eyebrow') },
    { id: 'rede', rotulo: t('sobre.rede_eyebrow') },
    { id: 'modulos', rotulo: t('sobre.verbos_eyebrow') },
    { id: 'planos', rotulo: t('sobre.planos_eyebrow') },
    { id: 'contas', rotulo: t('sobre.transp_eyebrow') },
    { id: 'futuro', rotulo: t('sobre.futuro_eyebrow') },
    { id: 'quem', rotulo: t('sobre.quem_eyebrow') },
  ]

  const PASSOS = [
    { tag: t('sobre.step_0_tag'), titulo: t('sobre.step_0_title'), corpo: t('sobre.step_0_body') },
    { tag: t('sobre.step_1_tag'), titulo: t('sobre.step_1_title'), corpo: t('sobre.step_1_body') },
    { tag: t('sobre.step_2_tag'), titulo: t('sobre.step_2_title'), corpo: t('sobre.step_2_body') },
    { tag: t('sobre.step_3_tag'), titulo: t('sobre.step_3_title'), corpo: t('sobre.step_3_body', { pct: rateio }) },
    { tag: t('sobre.step_4_tag'), titulo: t('sobre.step_4_title'), corpo: t('sobre.step_4_body') },
  ]
  const CLASSE_PASSO = ['lg:col-span-2 lg:row-span-2', undefined, undefined, 'lg:col-span-2', undefined]
  const TOM_PASSO = ['teal', 'papel', 'papel', 'ocre', 'papel'] as const

  const FUTURO = [0, 1, 2, 3].map(i => t(`sobre.futuro_item_${i}`))

  const VERBOS = [
    { v: t('nav.come'),      href: lp('/come'),      desc: t('sobre.verbos_come_desc') },
    { v: t('nav.fique'),     href: lp('/fique'),     desc: t('sobre.verbos_fique_desc') },
    { v: t('nav.passeie'),   href: lp('/passeie'),   desc: t('sobre.verbos_passeie_desc') },
    { v: t('nav.explore'),   href: lp('/explore'),   desc: t('sobre.verbos_explore_desc') },
    { v: t('nav.participe'), href: lp('/participe'), desc: t('sobre.verbos_participe_desc') },
    { v: t('nav.conheca'),   href: lp('/conheca'),   desc: t('sobre.verbos_conheca_desc') },
    { v: t('nav.apoie'),     href: lp('/apoie'),     desc: t('sobre.verbos_apoie_desc') },
    { v: t('nav.contrate'),  href: lp('/contrate'),  desc: t('sobre.verbos_contrate_desc') },
  ]

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-20">
      {/* Abertura: titulo, frase e os tres percentuais do modelo */}
      <header className="mb-12 md:mb-16">
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight text-fg-1 max-w-4xl mb-6">
          {t('sobre.titulo')}
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-fg-3-texto max-w-3xl mb-8">{t('sobre.desc')}</p>

        <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-14">
          <dl className="grid grid-cols-3 gap-4 md:gap-10 lg:flex-1">
            {([CHAVES.gratuito, CHAVES.rateioCidade, CHAVES.lucro] as const).map((chave, i) => (
              <div key={chave} className="flex flex-col-reverse justify-end">
                <dt className="text-sm text-fg-3-texto mt-2 leading-snug">{t(`sobre.stat_${i}_label`)}</dt>
                <dd className="font-display font-bold text-4xl md:text-6xl leading-none text-teal-dark dark:text-teal tabular-nums">
                  <Pct valor={parametro(param, chave)} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="lg:max-w-sm">
            <p className="font-semibold text-fg-1">{t('sobre.banner_titulo')}</p>
            <p className="text-sm text-fg-3-texto mt-1 mb-4">{t('sobre.banner_sub')}</p>
            <ShimmerButton
              href={lp('/cadastre')}
              className="bg-teal-dark hover:bg-teal-dark/90 min-h-12 px-6 rounded-full text-base"
            >
              {t('sobre.banner_btn')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </ShimmerButton>
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <SumarioPagina itens={sumario} titulo={t('institucional.nesta_pagina')} className="mb-10 lg:mb-0" />

        <div className="min-w-0 space-y-16 md:space-y-24">
          {/* O que e */}
          <section id="oque" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>
              {t('sobre.oque_h2_1')}<br />{t('sobre.oque_h2_2')}
            </h2>
            <p className="text-xl leading-relaxed text-fg-1 max-w-2xl mb-5">{t('sobre.oque_p1')}</p>
            <p className="text-base leading-relaxed text-fg-3-texto max-w-2xl">{t('sobre.oque_p2')}</p>
          </section>

          {/* Como funciona */}
          <section id="modelo" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('sobre.modelo_h2')}</h2>
            <BentoGrid>
              {PASSOS.map((p, i) => (
                <BentoCard
                  key={p.titulo}
                  titulo={p.titulo}
                  descricao={p.corpo}
                  tom={TOM_PASSO[i]}
                  atraso={(i % 4) * 70}
                  className={CLASSE_PASSO[i]}
                >
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10">{p.tag}</span>
                </BentoCard>
              ))}
            </BentoGrid>
          </section>

          {/* Efeito rede */}
          <section id="rede" className="scroll-mt-24">
            <h2 className={`${H2} mb-4`}>{t('sobre.rede_h2')}</h2>
            <p className="text-lg text-fg-3-texto max-w-2xl mb-8">{t('sobre.rede_desc')}</p>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[0, 1, 2, 3].map(i => (
                <li key={i}>
                  <BlurFade delay={(i % 4) * 70} className="h-full">
                    <MagicCard className={`${CARTAO} h-full p-5 flex items-center justify-between gap-3`}>
                      <span className="font-medium text-fg-1 leading-snug">{t(`sobre.rede_node_${i}`)}</span>
                      {i < 3 && <ArrowRight className="w-4 h-4 text-teal shrink-0 hidden lg:block" aria-hidden="true" />}
                    </MagicCard>
                  </BlurFade>
                </li>
              ))}
            </ol>
            <BlurFade>
              <Citacao>{t('sobre.rede_ciclo_strong')}</Citacao>
              <p className="text-base text-fg-3-texto leading-relaxed max-w-2xl mt-3">{t('sobre.rede_ciclo_text')}</p>
            </BlurFade>
          </section>

          {/* Modulos */}
          <section id="modulos" className="scroll-mt-24">
            <h2 className={`${H2} mb-3`}>{t('sobre.verbos_h2')}</h2>
            <p className="text-lg text-fg-3-texto max-w-2xl mb-8">{t('sobre.verbos_desc')}</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {VERBOS.map(({ v, href, desc }, i) => (
                <li key={href}>
                  <BlurFade delay={(i % 4) * 70}>
                    <MagicCard className={`${CARTAO} hover:border-teal transition-colors`}>
                      <Link href={href} className="group flex items-center gap-4 px-5 min-h-16 py-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
                        <span className="font-display font-bold text-xl w-28 shrink-0 text-teal-dark dark:text-teal">{v}</span>
                        <span className="text-sm text-fg-3-texto leading-snug flex-1">{desc}</span>
                        <ArrowRight className="w-4 h-4 text-teal shrink-0" aria-hidden="true" />
                      </Link>
                    </MagicCard>
                  </BlurFade>
                </li>
              ))}
            </ul>
          </section>

          {/* Planos: o feixe so no que tem selo de destaque */}
          <section id="planos" className="scroll-mt-24">
            <h2 className={`${H2} mb-3`}>{t('sobre.planos_h2')}</h2>
            <p className="text-lg text-fg-3-texto max-w-2xl mb-8">{t('sobre.planos_desc')}</p>
            <div className="grid md:grid-cols-3 gap-4 md:gap-5 items-stretch">
              {/* Gratuito */}
              <BlurFade className="h-full">
                <MagicCard className={`${CARTAO} h-full p-6 flex flex-col`}>
                  <div className="font-display font-bold text-4xl text-fg-1 mb-1 tabular-nums">{preco(CHAVES.planoGratuito)}</div>
                  <h3 className="font-semibold text-fg-1 mb-5">{t('sobre.planos_free_label')}</h3>
                  <ul className="space-y-2.5 text-sm text-fg-3-texto flex-1">
                    {[0, 1, 2, 3].map(i => (
                      <li key={i} className="flex items-start gap-2"><span className="text-teal-dark dark:text-teal" aria-hidden="true">✓</span> {t(`sobre.planos_free_item_${i}`)}</li>
                    ))}
                  </ul>
                  <Link href={lp('/cadastre')} className="mt-6 flex items-center justify-center min-h-11 bg-areia dark:bg-[#2D2D2D] text-fg-1 font-semibold text-sm px-4 rounded-xl hover:bg-border-1 transition-colors">
                    {t('sobre.planos_free_btn')}
                  </Link>
                </MagicCard>
              </BlurFade>

              {/* Associado */}
              <BlurFade delay={70} className="h-full">
                <MagicCard className={`${CARTAO} h-full p-6 flex flex-col`}>
                  <div className="font-display font-bold text-4xl text-teal-dark dark:text-teal mb-1 tabular-nums">
                    {preco(CHAVES.planoAssociado)}<span className="text-sm font-normal text-fg-3-texto ml-1">/mês</span>
                  </div>
                  <h3 className="font-semibold text-fg-1 mb-5">{t('sobre.planos_assoc_label')}</h3>
                  <ul className="space-y-2.5 text-sm text-fg-3-texto flex-1">
                    <li className="flex items-start gap-2"><span className="text-teal-dark dark:text-teal" aria-hidden="true">✓</span> {t('sobre.planos_assoc_item_0')}</li>
                    <li className="flex items-start gap-2"><span className="text-teal-dark dark:text-teal" aria-hidden="true">✓</span> {t('sobre.planos_assoc_item_1')}</li>
                    <li className="flex items-start gap-2"><span className="text-teal-dark dark:text-teal" aria-hidden="true">✓</span> {t('sobre.planos_assoc_item_2')}</li>
                    <li className="flex items-start gap-2"><span className="text-teal-dark dark:text-teal" aria-hidden="true">✓</span>
                      <span><strong>{t('sobre.planos_assoc_item_3_label')}</strong> {t('sobre.planos_assoc_item_3_text')}</span>
                    </li>
                    <li className="flex items-start gap-2"><span className="text-teal-dark dark:text-teal" aria-hidden="true">✓</span> {t('sobre.planos_assoc_item_4', { pct: rateio })}</li>
                  </ul>
                  <Link href={lp('/cadastre')} className="mt-6 flex items-center justify-center min-h-11 bg-teal-dark text-white font-semibold text-sm px-4 rounded-xl hover:bg-teal-dark/90 transition-colors">
                    {t('sobre.planos_assoc_btn')}
                  </Link>
                </MagicCard>
              </BlurFade>

              {/* Associado Plus: destaque */}
              <BlurFade delay={140} className="h-full">
                <MagicCard className={`${CARTAO} relative overflow-hidden h-full p-6 flex flex-col`}>
                  <BorderBeam />
                  <span className="self-start mb-3 bg-ocre-light dark:bg-ocre/20 text-fg-1 text-xs font-semibold px-3 py-1 rounded-full">
                    {t('sobre.planos_plus_badge')}
                  </span>
                  <div className="font-display font-bold text-4xl text-fg-1 mb-1 tabular-nums">
                    {preco(CHAVES.planoDestaque)}<span className="text-sm font-normal text-fg-3-texto ml-1">/mês</span>
                  </div>
                  <h3 className="font-semibold text-fg-1 mb-5">{t('sobre.planos_plus_label')}</h3>
                  <ul className="space-y-2.5 text-sm text-fg-3-texto flex-1">
                    <li className="flex items-start gap-2"><span className="text-ocre-dark dark:text-ocre" aria-hidden="true">✓</span> {t('sobre.planos_plus_item_0')}</li>
                    <li className="flex items-start gap-2"><span className="text-ocre-dark dark:text-ocre" aria-hidden="true">✓</span>
                      <span>{t('sobre.planos_plus_item_1_pre')} <a href="https://balaio.net" target="_blank" rel="noopener noreferrer" className="text-teal-dark dark:text-teal underline">Balaio</a>{t('sobre.planos_plus_item_1_post')}</span>
                    </li>
                    <li className="flex items-start gap-2"><span className="text-ocre-dark dark:text-ocre" aria-hidden="true">✓</span> {t('sobre.planos_plus_item_2')}</li>
                    <li className="flex items-start gap-2"><span className="text-ocre-dark dark:text-ocre" aria-hidden="true">✓</span> {t('sobre.planos_plus_item_3', { pct: rateio })}</li>
                  </ul>
                  <Link href={lp('/cadastre')} className="mt-6 flex items-center justify-center min-h-11 bg-ocre-dark text-white font-semibold text-sm px-4 rounded-xl hover:bg-ocre-dark/90 transition-colors">
                    {t('sobre.planos_plus_btn')}
                  </Link>
                </MagicCard>
              </BlurFade>
            </div>
            <p className="text-sm text-fg-3-texto mt-6">{t('sobre.planos_disclaimer')}</p>
          </section>

          {/* Prestacao de contas */}
          <section id="contas" className="scroll-mt-24">
            <BlurFade>
              <div className="rounded-2xl bg-teal-dark text-white p-6 md:p-10">
                <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight mb-8">{t('sobre.transp_h2')}</h2>
                <dl className="grid md:grid-cols-3 gap-8 mb-10">
                  {([CHAVES.rateioCidade, CHAVES.rateioOperacao, CHAVES.lucro] as const).map((chave, i) => (
                    <div key={chave} className="flex flex-col-reverse justify-end">
                      <dt className="text-white/80 text-sm leading-snug mt-3 max-w-[16rem]">{t(`sobre.transp_stat_${i}`)}</dt>
                      <dd className="font-display font-bold text-5xl md:text-6xl leading-none tabular-nums">
                        <Pct valor={parametro(param, chave)} />
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/20">
                  <p className="text-white/85 text-sm leading-relaxed max-w-md">{t('sobre.transp_desc')}</p>
                  <Link href={lp('/apoie')} className="shrink-0 inline-flex items-center justify-center gap-2 min-h-11 bg-white text-teal-dark font-semibold px-5 rounded-full hover:bg-areia transition-colors text-sm">
                    {t('sobre.transp_btn')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </BlurFade>
          </section>

          {/* Futuro */}
          <section id="futuro" className="scroll-mt-24">
            <h2 className={`${H2} mb-4`}>{t('sobre.futuro_h2')}</h2>
            <p className="text-lg text-fg-3-texto max-w-2xl leading-relaxed mb-8">{t('sobre.futuro_desc')}</p>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              {FUTURO.map((label, i) => (
                <li key={label}>
                  <BlurFade delay={(i % 4) * 70} className="h-full">
                    <MagicCard className={`${CARTAO} h-full p-5 font-display font-semibold text-lg leading-snug text-fg-1`}>{label}</MagicCard>
                  </BlurFade>
                </li>
              ))}
            </ul>
            <BlurFade>
              <Citacao className="text-xl md:text-2xl">{t('sobre.futuro_box')}</Citacao>
            </BlurFade>
          </section>

          {/* Quem faz */}
          <section id="quem" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('sobre.quem_h2')}</h2>
            <BlurFade>
              <MagicCard className={`${CARTAO} p-6 max-w-xl`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6 26 C6 26 4 16 16 10 C28 4 28 14 22 18 C16 22 14 18 16 14 C18 10 22 12 20 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <circle cx="20" cy="16" r="2" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-fg-1">Instituto Balaio</div>
                    <div className="text-sm text-fg-3-texto">
                      {t('sobre.quem_balaio_sub')} · <a href="https://balaio.net" target="_blank" rel="noopener noreferrer" className="text-teal-dark dark:text-teal hover:underline inline-flex items-center gap-0.5">balaio.net <ExternalLink className="w-3 h-3" aria-hidden="true" /></a>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-fg-3-texto leading-relaxed">{t('sobre.quem_balaio_desc')}</p>
                <a href="mailto:contato@vivegostoso.com.br" className="mt-3 inline-flex items-center min-h-11 text-sm text-teal-dark dark:text-teal hover:underline">
                  contato@vivegostoso.com.br
                </a>
              </MagicCard>
            </BlurFade>
            <p className="mt-4">
              <Link href={lp('/transparencia')} className="inline-flex items-center gap-1 min-h-11 text-teal-dark dark:text-teal text-sm font-semibold hover:underline">
                {t('sobre.transparencia_link')} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </p>
          </section>

          {/* Participar */}
          <section id="participar" className="scroll-mt-24">
            <h2 className={`${H2} mb-6`}>{t('sobre.participar_h2')}</h2>
            <BentoGrid>
              <BentoCard
                titulo={t('sobre.participar_negocio_h3')}
                descricao={t('sobre.participar_negocio_desc')}
                href={lp('/cadastre')}
                acao={t('sobre.participar_negocio_btn')}
                tom="teal"
                className="lg:col-span-2"
              />
              <BentoCard
                titulo={t('sobre.participar_alcance_h3')}
                descricao={t('sobre.participar_alcance_desc', { pct: rateio })}
                href={lp('/apoie')}
                acao={t('sobre.participar_alcance_btn')}
                atraso={70}
              />
              <BentoCard
                titulo={t('sobre.participar_morador_h3')}
                descricao={t('sobre.participar_morador_desc')}
                href={lp('/contrate')}
                acao={t('sobre.participar_morador_btn')}
                atraso={140}
                className="lg:col-span-3"
              />
            </BentoGrid>
            <div className="mt-12 pt-8 border-t border-border-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-2xl text-fg-1">
                  {t('sobre.cta_explorar_h2_1')} {t('sobre.cta_explorar_h2_2')}
                </h3>
                <p className="text-fg-3-texto text-base leading-relaxed max-w-lg mt-2">{t('sobre.cta_explorar_desc')}</p>
              </div>
              <Link href={lp('/')} className="shrink-0 inline-flex items-center justify-center gap-2 min-h-11 border border-border-1 text-fg-1 font-semibold px-6 rounded-full hover:border-teal transition-colors text-sm">
                {t('sobre.cta_explorar_btn')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
