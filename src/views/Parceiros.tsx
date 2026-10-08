'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useStats } from '@/hooks/useStats'
import { useParametros } from '@/hooks/useParametros'
import { CHAVES, parametro, precoEmReais, type Parametros } from '@/lib/parametros'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import { Marquee } from '@/components/magicui/marquee'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { Citacao } from '@/components/institucional/citacao'

const BENEFITS = [
  {
    title: 'Seja encontrado',
    desc: 'Apareça no diretório que turistas consultam antes e durante a viagem a São Miguel do Gostoso.',
  },
  {
    title: 'Presença digital',
    desc: 'Seu negócio vinculado ao Instagram e WhatsApp, com link direto para clientes encontrarem você.',
  },
  {
    title: 'Comunidade local',
    desc: 'Faça parte de uma plataforma criada por e para São Miguel do Gostoso. Apoie o digital local.',
  },
  {
    title: 'Destaque no resultado',
    desc: 'Planos pagos colocam seu negócio no topo do diretório e em posições estratégicas de busca.',
  },
]

/* Frases curtas que ja existem na pagina (beneficios e itens do plano gratuito). */
const FAIXA = [
  'Seja encontrado',
  'Presença digital',
  'Comunidade local',
  'Destaque no resultado',
  'Perfil básico no diretório',
  'Fotos e descrição',
  'Link para Instagram e WhatsApp',
  'Horários de funcionamento',
  'Selo de negócio verificado',
]

const TESTIMONIALS = [
  {
    name: 'Tribo do Kite',
    category: 'Kite & Windsurf',
    quote: 'Nossa visibilidade aumentou muito depois de entrar no Vive Gostoso. Os turistas chegam sabendo exatamente quem somos.',
  },
  {
    name: 'Baboon Restaurante',
    category: 'Gastronomia',
    quote: 'A plataforma é muito bem feita e o atendimento da equipe é excelente. Vale muito a pena estar listado aqui.',
  },
]

const PASSOS = [
  {
    title: 'Crie sua conta',
    desc: 'Cadastre-se com e-mail. Gratuito e sem compromisso.',
  },
  {
    title: 'Preencha o perfil',
    desc: 'Nome, descrição, fotos, Instagram, WhatsApp e horários.',
  },
  {
    title: 'Publique e apareça',
    desc: 'Clique em Publicar e fique visível para os turistas de Gostoso.',
  },
]

const H2 = 'font-display font-semibold text-3xl md:text-4xl tracking-tight text-fg-1'

type ParceirosProps = { initialParametros?: Parametros }

export default function Parceiros({ initialParametros }: ParceirosProps) {
  const { t } = useTranslation()
  /* Mesma fonte da /sobre, da /transparencia e do painel de assinatura. */
  const { data: param } = useParametros(
    initialParametros ? { initialData: initialParametros } : undefined
  )
  const preco = (chave: string) => {
    const c = parametro(param, chave)
    return c === undefined ? null : precoEmReais(c)
  }
  const localePath = useLocalePath()
  const { data: stats } = useStats()
  const planData = [
    {
      name: t('parceiros:plan_gratuito'),
      precoChave: CHAVES.planoGratuito,
      period: t('parceiros:plan_period_forever'),
      badge: null,
      destaque: false,
      features: [
        'Perfil básico no diretório',
        'Fotos e descrição',
        'Link para Instagram e WhatsApp',
        'Horários de funcionamento',
      ],
      cta: 'Começar grátis',
      ctaStyle: 'border border-border-1 text-fg-1 hover:border-teal',
    },
    {
      name: t('parceiros:plan_associado'),
      precoChave: CHAVES.planoAssociado,
      period: t('parceiros:plan_period_month'),
      badge: t('parceiros:plan_popular_badge'),
      destaque: true,
      features: [
        'Tudo do plano gratuito',
        'Selo de negócio verificado ✓',
        'Posição destacada no diretório',
        'Suporte direto da equipe',
      ],
      cta: 'Assinar Associado',
      ctaStyle: 'bg-teal-dark text-white hover:bg-teal-dark/90',
    },
    {
      name: t('parceiros:plan_destaque'),
      precoChave: CHAVES.planoDestaque,
      period: t('parceiros:plan_period_month'),
      badge: t('parceiros:plan_destaque_badge'),
      destaque: false,
      features: [
        'Tudo do plano Associado',
        '★ Destaque no topo do diretório',
        'Foto de capa em destaque',
        'Prioridade em buscas por categoria',
        'Apoio na estratégia digital',
      ],
      cta: 'Assinar Destaque',
      ctaStyle: 'bg-ocre-dark text-white hover:bg-ocre-dark/90',
    },
  ]

  const numeros = stats
    ? [
        { v: stats.businesses, rotulo: t('parceiros:stats_negocios') },
        { v: stats.verified, rotulo: t('parceiros:stats_verificados') },
        { v: stats.categories, rotulo: t('parceiros:stats_categorias') },
      ]
    : []

  return (
    <div>
      {/* ── Hero: uma unica acao, cadastrar ── */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-12 md:pb-16">
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight text-fg-1 max-w-4xl mb-6">
          {t('parceiros:hero_titulo')}{' '}
          <span className="text-teal-dark dark:text-teal">Vive Gostoso</span>
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-fg-3-texto max-w-2xl mb-8">
          {t('parceiros:hero_desc')}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <ShimmerButton
            href={localePath('/cadastre')}
            className="bg-teal-dark hover:bg-teal-dark/90 min-h-12 px-8 rounded-full text-base"
          >
            {t('parceiros:cta_cadastrar')}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </ShimmerButton>
          <a
            href={buildWhatsAppLink(OFFICIAL_WHATSAPP, 'Gostaria de saber mais sobre o Vive Gostoso para meu negócio.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-11 text-fg-1 font-semibold underline underline-offset-4 decoration-fg-3-texto/50 hover:decoration-fg-1"
          >
            {t('parceiros:cta_equipe')}
          </a>
        </div>

        {/* Sem fallback numerico: `?? 179` e `13` escritos a mao mentiam quando
            a consulta falhava ou quando o catalogo mudava. O bloco inteiro so
            aparece com dado, e so conta quando o numero e maior que zero. */}
        {numeros.length > 0 && (
          <dl className="grid grid-cols-3 gap-4 md:gap-10 mt-12 pt-8 border-t border-border-1 max-w-2xl">
            {numeros.map(n => (
              <div key={n.rotulo} className="flex flex-col-reverse justify-end">
                <dt className="text-sm text-fg-3-texto mt-1">{n.rotulo}</dt>
                <dd className="font-display font-bold text-4xl md:text-5xl leading-none text-fg-1 tabular-nums">
                  {n.v > 0 ? <NumberTicker value={n.v} decimais={0} /> : n.v}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* ── Faixa de proposta de valor ── */}
      <div className="border-y border-border-1 py-4" aria-label={t('parceiros:benefits_titulo')}>
        <Marquee duracao={45}>
          {FAIXA.map(f => (
            <span key={f} className="inline-flex items-center min-h-11 px-5 rounded-full border border-border-1 bg-white dark:bg-card text-sm font-medium text-fg-1 whitespace-nowrap">
              {f}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 space-y-20 md:space-y-28">
        {/* ── Beneficios ── */}
        <section>
          <h2 className={`${H2} mb-2`}>{t('parceiros:benefits_titulo')}</h2>
          <p className="text-lg text-fg-3-texto mb-8 max-w-2xl">{t('parceiros:benefits_desc')}</p>
          <BentoGrid>
            <BentoCard
              titulo={BENEFITS[0].title}
              descricao={BENEFITS[0].desc}
              tom="teal"
              className="lg:col-span-2 lg:row-span-2"
            />
            <BentoCard titulo={BENEFITS[1].title} descricao={BENEFITS[1].desc} atraso={70} />
            <BentoCard titulo={BENEFITS[2].title} descricao={BENEFITS[2].desc} atraso={140} />
            <BentoCard titulo={BENEFITS[3].title} descricao={BENEFITS[3].desc} tom="ocre" atraso={210} className="lg:col-span-3" />
          </BentoGrid>
        </section>

        {/* ── Como funciona ── */}
        <section>
          <h2 className={`${H2} mb-2`}>{t('parceiros:how_titulo')}</h2>
          <p className="text-lg text-fg-3-texto mb-8">{t('parceiros:how_desc')}</p>
          <ol className="grid md:grid-cols-3 gap-4 md:gap-5">
            {PASSOS.map((p, i) => (
              <li key={p.title}>
                <BlurFade delay={(i % 4) * 70} className="h-full">
                  <MagicCard className="h-full rounded-2xl bg-white dark:bg-card border border-border-1 p-6">
                    <p className="font-display font-bold text-5xl text-teal-dark dark:text-teal leading-none mb-4" aria-hidden="true">{i + 1}</p>
                    <h3 className="font-semibold text-lg text-fg-1 mb-1">{p.title}</h3>
                    <p className="text-sm text-fg-3-texto leading-relaxed">{p.desc}</p>
                  </MagicCard>
                </BlurFade>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Planos: o feixe so no plano em destaque ── */}
        <section>
          <h2 className={`${H2} mb-2`}>{t('parceiros:plans_titulo')}</h2>
          <p className="text-lg text-fg-3-texto mb-8">{t('parceiros:plans_desc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {planData.map((plan, i) => (
              <BlurFade key={plan.name} delay={(i % 4) * 70} className="h-full">
                <MagicCard
                  className={cn(
                    'h-full rounded-2xl bg-white dark:bg-card border p-6 flex flex-col',
                    plan.destaque ? 'relative overflow-hidden border-teal/40' : 'border-border-1',
                  )}
                >
                  {plan.destaque && <BorderBeam />}
                  <div className="min-h-7 mb-2">
                    {plan.badge && (
                      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-ocre-light dark:bg-ocre/20 text-fg-1">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="font-display text-lg font-bold text-fg-1">{plan.name}</p>
                    <p className="mt-1">
                      <span className="font-display text-4xl font-bold text-fg-1 tabular-nums">{preco(plan.precoChave)}</span>
                      <span className="text-sm text-fg-3-texto ml-1">{plan.period}</span>
                    </p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-fg-3-texto">
                        <CheckCircle className="w-4 h-4 text-teal-dark dark:text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={localePath('/cadastre')}
                    className={cn('w-full flex items-center justify-center min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors', plan.ctaStyle)}
                  >
                    {plan.cta}
                  </Link>
                </MagicCard>
              </BlurFade>
            ))}
          </div>

          <p className="text-sm text-fg-3-texto mt-6">
            {t('parceiros:plan_disclaimer', { pct: parametro(param, CHAVES.rateioCidade) ?? '' })}
          </p>
        </section>

        {/* ── Depoimentos ── */}
        <section>
          <h2 className={`${H2} mb-8`}>{t('parceiros:testimonial_titulo')}</h2>
          <div className="grid md:grid-cols-2 gap-10 md:gap-14">
            {TESTIMONIALS.map(({ name, category, quote }, i) => (
              <BlurFade key={name} delay={(i % 4) * 70}>
                <figure>
                  <blockquote>
                    <Citacao className="text-xl md:text-2xl">&ldquo;{quote}&rdquo;</Citacao>
                  </blockquote>
                  <figcaption className="mt-4">
                    <p className="text-base font-semibold text-fg-1">{name}</p>
                    <p className="text-sm text-fg-3-texto">{category}</p>
                  </figcaption>
                </figure>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* ── CTA final ── */}
        <section>
          <BlurFade>
            <div className="rounded-2xl bg-teal-dark text-white p-8 md:p-12">
              <h2 className="font-display font-semibold text-3xl md:text-5xl tracking-tight mb-3 max-w-2xl">
                {t('parceiros:final_titulo')}
              </h2>
              <p className="text-white/85 text-lg mb-8 max-w-xl">
                {t('parceiros:final_desc')}
              </p>
              <ShimmerButton
                href={localePath('/cadastre')}
                className="bg-[#1A1A1A] hover:bg-black min-h-12 px-8 rounded-full text-base"
              >
                {t('parceiros:final_cta')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </ShimmerButton>
              <p className="text-sm text-white/80 mt-4">{t('parceiros:final_fineprint')}</p>
            </div>
          </BlurFade>
        </section>
      </div>
    </div>
  )
}
