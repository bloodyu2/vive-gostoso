'use client'

import Link from 'next/link'
import {
  Store, CheckCircle, Users, TrendingUp, MapPin,
  AtSign, Phone, Star, ArrowRight, Shield,
} from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useStats } from '@/hooks/useStats'
import { buildWhatsAppLink, OFFICIAL_WHATSAPP } from '@/lib/whatsapp'

const BENEFITS = [
  {
    icon: MapPin,
    title: 'Seja encontrado',
    desc: 'Apareça no diretório que turistas consultam antes e durante a viagem a São Miguel do Gostoso.',
  },
  {
    icon: AtSign,
    title: 'Presença digital',
    desc: 'Seu negócio vinculado ao Instagram e WhatsApp, com link direto para clientes encontrarem você.',
  },
  {
    icon: Users,
    title: 'Comunidade local',
    desc: 'Faça parte de uma plataforma criada por e para São Miguel do Gostoso. Apoie o digital local.',
  },
  {
    icon: TrendingUp,
    title: 'Destaque no resultado',
    desc: 'Planos pagos colocam seu negócio no topo do diretório e em posições estratégicas de busca.',
  },
]

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$0',
    period: 'para sempre',
    color: 'border-[#E8E4DF]',
    badge: null,
    features: [
      'Perfil básico no diretório',
      'Fotos e descrição',
      'Link para Instagram e WhatsApp',
      'Horários de funcionamento',
    ],
    cta: 'Começar grátis',
    ctaStyle: 'border border-[#E8E4DF] text-[#1A1A1A] hover:border-teal hover:text-teal',
    ctaHref: '/cadastre',
  },
  {
    name: 'Associado',
    price: 'R$39,90',
    period: 'por mês',
    color: 'border-teal',
    badge: 'Mais popular',
    badgeColor: 'bg-teal text-white',
    features: [
      'Tudo do plano gratuito',
      'Selo de negócio verificado ✓',
      'Posição destacada no diretório',
      'Suporte direto da equipe',
    ],
    cta: 'Assinar Associado',
    ctaStyle: 'bg-teal text-white hover:bg-teal/90',
    ctaHref: '/cadastre',
  },
  {
    name: 'Destaque',
    price: 'R$59,90',
    period: 'por mês',
    color: 'border-ocre',
    badge: 'Máximo destaque',
    badgeColor: 'bg-ocre text-white',
    features: [
      'Tudo do plano Associado',
      '★ Destaque no topo do diretório',
      'Foto de capa em destaque',
      'Prioridade em buscas por categoria',
      'Apoio na estratégia digital',
    ],
    cta: 'Assinar Destaque',
    ctaStyle: 'bg-ocre text-white hover:bg-ocre/90',
    ctaHref: '/cadastre',
  },
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

export default function Parceiros() {
  const { data: stats } = useStats()

  usePageMeta({
    title: 'Cadastre seu negócio no Vive Gostoso',
    description: 'Apareça no maior diretório digital de São Miguel do Gostoso. Cadastro gratuito para negócios locais.',
  })

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ── Hero ── */}
      <section className="bg-[#1A1A1A] text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-24 relative">
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_#20B2AA_0%,_transparent_60%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-teal/20 text-teal text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Store className="w-3.5 h-3.5" />
              Para negócios de São Miguel do Gostoso
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-2xl">
              Seu negócio merece estar no{' '}
              <span className="text-teal">Vive Gostoso</span>
            </h1>

            <p className="text-[#A0A0A0] text-lg leading-relaxed max-w-xl mb-8">
              O diretório digital que os turistas usam para descobrir restaurantes, pousadas, passeios e serviços em São Miguel do Gostoso.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/cadastre"
                className="inline-flex items-center justify-center gap-2 bg-teal text-white px-6 py-3.5 rounded-2xl font-semibold text-sm hover:bg-teal/90 transition-colors"
              >
                <Store className="w-4 h-4" />
                Cadastrar meu negócio grátis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={buildWhatsAppLink(OFFICIAL_WHATSAPP, 'Gostaria de saber mais sobre o Vive Gostoso para meu negócio.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Falar com a equipe
              </a>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{stats.businesses ?? 179}+</p>
                  <p className="text-xs text-[#737373] mt-0.5">negócios listados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">13</p>
                  <p className="text-xs text-[#737373] mt-0.5">categorias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal tabular-nums">100%</p>
                  <p className="text-xs text-[#737373] mt-0.5">local e independente</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
            Por que entrar no diretório?
          </h2>
          <p className="text-[#737373] text-base">
            Uma presença digital real, construída para São Miguel do Gostoso.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">{title}</h3>
                <p className="text-sm text-[#737373] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-y border-[#E8E4DF] py-16">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
              Simples e rápido
            </h2>
            <p className="text-[#737373]">Em menos de 5 minutos seu negócio está no ar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Crie sua conta',
                desc: 'Cadastre-se com e-mail. Gratuito e sem compromisso.',
              },
              {
                step: '2',
                title: 'Preencha o perfil',
                desc: 'Nome, descrição, fotos, Instagram, WhatsApp e horários.',
              },
              {
                step: '3',
                title: 'Publique e apareça',
                desc: 'Clique em Publicar e fique visível para os turistas de Gostoso.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">{title}</h3>
                <p className="text-sm text-[#737373] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/cadastre"
              className="inline-flex items-center gap-2 bg-teal text-white px-6 py-3.5 rounded-2xl font-semibold text-sm hover:bg-teal/90 transition-colors"
            >
              Começar agora, é grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
            Planos que crescem com você
          </h2>
          <p className="text-[#737373]">Comece grátis e faça upgrade quando quiser.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white border-2 rounded-2xl p-6 flex flex-col relative ${plan.color}`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              )}
              <div className="mb-4">
                <p className="font-display text-lg font-bold text-[#1A1A1A]">{plan.name}</p>
                <p className="mt-1">
                  <span className="text-3xl font-bold text-[#1A1A1A] tabular-nums">{plan.price}</span>
                  <span className="text-sm text-[#737373] ml-1">{plan.period}</span>
                </p>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#3D3D3D]">
                    <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className={`w-full text-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#737373] mt-6">
          Planos anuais com 10% de desconto · Cartão, PIX e boleto · Cancele quando quiser
        </p>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white border-y border-[#E8E4DF] py-16">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2">
              Quem já está no Vive Gostoso
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {TESTIMONIALS.map(({ name, category, quote }) => (
              <div key={name} className="bg-[#FAFAF9] border border-[#E8E4DF] rounded-2xl p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 text-ocre fill-ocre" />
                  ))}
                </div>
                <p className="text-sm text-[#3D3D3D] leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{name}</p>
                  <p className="text-xs text-[#737373]">{category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-16 text-center">
        <div className="bg-[#1A1A1A] text-white rounded-3xl px-8 py-12">
          <Shield className="w-10 h-10 text-teal mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            São Miguel do Gostoso é do seu jeito.
          </h2>
          <p className="text-[#A0A0A0] text-base mb-8 max-w-md mx-auto">
            Plataforma local, independente e feita para apoiar quem faz a cidade acontecer.
          </p>
          <Link
            href="/cadastre"
            className="inline-flex items-center gap-2 bg-teal text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-teal/90 transition-colors"
          >
            Cadastrar meu negócio agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-[#737373] mt-4">Grátis · Sem cartão de crédito · Pronto em 5 minutos</p>
        </div>
      </section>

    </div>
  )
}
