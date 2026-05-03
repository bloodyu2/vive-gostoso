import { Link } from 'react-router-dom'
import {
  Heart, Globe, Users, TrendingUp, MapPin, ArrowRight,
  Gift, Search, Megaphone, Lightbulb, BookOpen,
  Eye, BarChart2, CheckCircle, ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Sobre() {
  const { t } = useTranslation()
  const lp = useLocalePath()

  usePageMeta({
    title: 'Sobre o Vive Gostoso',
    description: 'Conheça o projeto por trás do guia digital de São Miguel do Gostoso — feito pela comunidade, para a comunidade.',
  })

  const STEPS = [
    { icon: Gift,       color: 'bg-teal-light text-teal',       tag: t('sobre.step_0_tag'), title: t('sobre.step_0_title'), body: t('sobre.step_0_body') },
    { icon: Search,     color: 'bg-teal-light text-teal',       tag: t('sobre.step_1_tag'), title: t('sobre.step_1_title'), body: t('sobre.step_1_body') },
    { icon: TrendingUp, color: 'bg-ocre-light text-ocre',       tag: t('sobre.step_2_tag'), title: t('sobre.step_2_title'), body: t('sobre.step_2_body') },
    { icon: Megaphone,  color: 'bg-ocre-light text-ocre',       tag: t('sobre.step_3_tag'), title: t('sobre.step_3_title'), body: t('sobre.step_3_body') },
    { icon: Lightbulb,  color: 'bg-[#EDE9FE] text-[#7C3AED]',  tag: t('sobre.step_4_tag'), title: t('sobre.step_4_title'), body: t('sobre.step_4_body') },
  ]

  const FUTURE = [
    { icon: BookOpen,  label: t('sobre.futuro_item_0') },
    { icon: Users,     label: t('sobre.futuro_item_1') },
    { icon: BarChart2, label: t('sobre.futuro_item_2') },
    { icon: Globe,     label: t('sobre.futuro_item_3') },
  ]

  const VERBOS = [
    { v: t('nav.come'),      to: lp('/come'),      desc: t('sobre.verbos_come_desc'),      color: 'text-ocre' },
    { v: t('nav.fique'),     to: lp('/fique'),     desc: t('sobre.verbos_fique_desc'),     color: 'text-teal' },
    { v: t('nav.passeie'),   to: lp('/passeie'),   desc: t('sobre.verbos_passeie_desc'),   color: 'text-[#3D8B5A]' },
    { v: t('nav.explore'),   to: lp('/explore'),   desc: t('sobre.verbos_explore_desc'),   color: 'text-coral' },
    { v: t('nav.participe'), to: lp('/participe'), desc: t('sobre.verbos_participe_desc'), color: 'text-teal' },
    { v: t('nav.conheca'),   to: lp('/conheca'),   desc: t('sobre.verbos_conheca_desc'),   color: 'text-[#3D8B5A]' },
    { v: t('nav.apoie'),     to: lp('/apoie'),     desc: t('sobre.verbos_apoie_desc'),     color: 'text-ocre' },
    { v: t('nav.contrate'),  to: lp('/contrate'),  desc: t('sobre.verbos_contrate_desc'),  color: 'text-coral' },
  ]

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
            {t('sobre.badge')}
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6">
            {t('sobre.titulo')}
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            {t('sobre.desc')}
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-white/10">
            {([0, 1, 2] as const).map(i => (
              <div key={i}>
                <div className="font-display font-bold text-2xl text-white">{t(`sobre.stat_${i}_n`)}</div>
                <div className="text-xs text-white/50 mt-0.5">{t(`sobre.stat_${i}_label`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner destaque */}
      <section className="bg-teal px-5 md:px-8 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-base">{t('sobre.banner_titulo')}</p>
              <p className="text-teal-light text-sm mt-0.5">{t('sobre.banner_sub')}</p>
            </div>
          </div>
          <Link to="/cadastre"
            className="flex-shrink-0 bg-white text-teal font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-teal-light transition-colors flex items-center gap-1.5">
            {t('sobre.banner_btn')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* O que é */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
          {t('sobre.oque_h2_1')}<br />{t('sobre.oque_h2_2')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed">
          <p>{t('sobre.oque_p1')}</p>
          <p>{t('sobre.oque_p2')}</p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.modelo_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10">
            {t('sobre.modelo_h2')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className={`bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6 flex flex-col gap-4 ${i === STEPS.length - 1 ? 'sm:col-span-2' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] bg-[#F5F2EE] dark:bg-[#2D2D2D] px-2.5 py-1 rounded-full">{s.tag}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] dark:text-white text-base mb-1.5">{s.title}</h3>
                    <p className="text-sm text-[#737373] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Efeito rede */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.rede_eyebrow')}</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          {t('sobre.rede_h2')}
        </h2>
        <p className="text-[#737373] text-lg mb-12 max-w-2xl">
          {t('sobre.rede_desc')}
        </p>
        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {([
              { icon: Users,      color: 'bg-teal-light text-teal',  key: 'rede_node_0' },
              { icon: TrendingUp, color: 'bg-ocre-light text-ocre',  key: 'rede_node_1' },
              { icon: Eye,        color: 'bg-teal-light text-teal',  key: 'rede_node_2' },
              { icon: Heart,      color: 'bg-ocre-light text-ocre',  key: 'rede_node_3' },
            ] as const).map((node, i) => {
              const Icon = node.icon
              return (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${node.color} relative z-10`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#3D3D3D] dark:text-[#C0BCB8] font-medium leading-snug">{t(`sobre.${node.key}`)}</p>
                  {i < 3 && <div className="md:hidden text-[#C4BFBA] text-lg">↓</div>}
                </div>
              )
            })}
          </div>
          <div className="mt-8 p-5 bg-areia dark:bg-[#161616] rounded-2xl flex items-center gap-4 border border-[#E8E4DF] dark:border-[#2D2D2D]">
            <CheckCircle className="w-5 h-5 text-teal flex-shrink-0" />
            <p className="text-sm text-[#3D3D3D] dark:text-[#C0BCB8] leading-relaxed">
              <strong>{t('sobre.rede_ciclo_strong')}</strong> {t('sobre.rede_ciclo_text')}
            </p>
          </div>
        </div>
      </section>

      {/* Sistema de verbos */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.verbos_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-2">
            {t('sobre.verbos_h2')}
          </h2>
          <p className="text-[#737373] text-lg mb-10">
            {t('sobre.verbos_desc')}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {VERBOS.map(({ v, to, desc, color }) => (
              <Link
                key={v}
                to={to}
                className="group flex items-center gap-4 bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl px-5 py-4 hover:border-teal hover:shadow-md transition-all"
              >
                <span className={`font-display font-bold text-xl w-28 flex-shrink-0 ${color}`}>{v}</span>
                <span className="text-sm text-[#737373] leading-snug flex-1">{desc}</span>
                <ArrowRight className="w-4 h-4 text-teal opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.planos_eyebrow')}</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          {t('sobre.planos_h2')}
        </h2>
        <p className="text-[#737373] text-lg mb-10 max-w-2xl">
          {t('sobre.planos_desc')}
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {/* Gratuito */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6 flex flex-col">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-[#1A1A1A] dark:text-white">R$0</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-5">{t('sobre.planos_free_label')}</div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] flex-1">
              {[0, 1, 2, 3].map(i => (
                <li key={i} className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> {t(`sobre.planos_free_item_${i}`)}</li>
              ))}
            </ul>
            <Link to="/cadastre" className="mt-6 block text-center bg-[#F5F2EE] dark:bg-[#2D2D2D] text-[#1A1A1A] dark:text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#E8E4DF] transition-colors">
              {t('sobre.planos_free_btn')}
            </Link>
          </div>

          {/* Associado */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-teal/30 rounded-2xl p-6 flex flex-col">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-teal">R$30</span>
              <span className="text-sm text-[#737373]">/mês</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-teal mb-5">{t('sobre.planos_assoc_label')}</div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] flex-1">
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> {t('sobre.planos_assoc_item_0')}</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> {t('sobre.planos_assoc_item_1')}</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> {t('sobre.planos_assoc_item_2')}</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span>
                <span><strong>{t('sobre.planos_assoc_item_3_label')}</strong> {t('sobre.planos_assoc_item_3_text')}</span>
              </li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> {t('sobre.planos_assoc_item_4')}</li>
            </ul>
            <Link to="/cadastre" className="mt-6 block text-center bg-teal text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-teal-dark transition-colors">
              {t('sobre.planos_assoc_btn')}
            </Link>
          </div>

          {/* Associado Plus */}
          <div className="bg-white dark:bg-[#1C1C1C] border-2 border-ocre rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-5 bg-ocre text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              {t('sobre.planos_plus_badge')}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-ocre">R$50</span>
              <span className="text-sm text-[#737373]">/mês</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-ocre mb-5">{t('sobre.planos_plus_label')}</div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] flex-1">
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span> {t('sobre.planos_plus_item_0')}</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span>
                <span>{t('sobre.planos_plus_item_1_pre')} <a href="https://balaio.net" target="_blank" rel="noopener noreferrer" className="text-teal underline">Balaio</a>{t('sobre.planos_plus_item_1_post')}</span>
              </li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span> {t('sobre.planos_plus_item_2')}</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span> {t('sobre.planos_plus_item_3')}</li>
            </ul>
            <Link to="/cadastre" className="mt-6 block text-center bg-ocre text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-ocre-dark transition-colors">
              {t('sobre.planos_plus_btn')}
            </Link>
          </div>
        </div>
        <p className="text-xs text-[#737373] mt-6 text-center">{t('sobre.planos_disclaimer')}</p>
      </section>

      {/* Transparência */}
      <section className="bg-teal text-white px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-light/70 mb-3">{t('sobre.transp_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10 text-white">
            {t('sobre.transp_h2')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {(['80%', '20%', '0%'] as const).map((n, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 text-center">
                <div className="text-5xl font-display font-bold mb-2">{n}</div>
                <div className="text-teal-light text-sm font-medium leading-snug">{t(`sobre.transp_stat_${i}`)}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm leading-relaxed max-w-md">{t('sobre.transp_desc')}</p>
            <Link to={lp('/apoie')} className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-teal font-semibold px-5 py-2.5 rounded-full hover:bg-teal-light transition-colors text-sm">
              <TrendingUp className="w-4 h-4" />
              {t('sobre.transp_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Futuro */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.futuro_eyebrow')}</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          {t('sobre.futuro_h2')}
        </h2>
        <p className="text-[#737373] text-lg mb-10 max-w-2xl leading-relaxed">
          {t('sobre.futuro_desc')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {FUTURE.map(({ icon: Icon, label }) => (
            <div key={label} className="bg-areia dark:bg-[#161616] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-5 flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal" />
              </div>
              <span className="text-sm font-medium text-[#3D3D3D] dark:text-[#C0BCB8] leading-snug">{label}</span>
            </div>
          ))}
        </div>
        <div className="p-5 bg-areia dark:bg-[#161616] rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] flex items-start gap-4">
          <Lightbulb className="w-5 h-5 text-ocre flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#737373] leading-relaxed">{t('sobre.futuro_box')}</p>
        </div>
      </section>

      {/* Quem faz */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.quem_eyebrow')}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
            {t('sobre.quem_h2')}
          </h2>
          <div className="max-w-md">
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 26 C6 26 4 16 16 10 C28 4 28 14 22 18 C16 22 14 18 16 14 C18 10 22 12 20 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="20" cy="16" r="2" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Instituto Balaio</div>
                  <div className="text-xs text-[#737373]">
                    {t('sobre.quem_balaio_sub')} · <a href="https://balaio.net" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline inline-flex items-center gap-0.5">balaio.net <ExternalLink className="w-3 h-3" /></a>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#737373] leading-relaxed">{t('sobre.quem_balaio_desc')}</p>
              <a href="mailto:contato@vivegostoso.com.br" className="mt-3 inline-block text-xs text-teal hover:underline">
                contato@vivegostoso.com.br
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — homepage */}
      <section className="bg-[#1A1A1A] text-white px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-white/50 text-sm font-semibold uppercase tracking-widest mb-3">{t('sobre.cta_explorar_eyebrow')}</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-3">
              {t('sobre.cta_explorar_h2_1')}<br className="hidden md:block" />
              {t('sobre.cta_explorar_h2_2')}
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-lg">
              {t('sobre.cta_explorar_desc')}
            </p>
          </div>
          <Link
            to={lp('/')}
            className="flex-shrink-0 flex items-center gap-2 bg-teal text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-teal-dark transition-colors"
          >
            {t('sobre.cta_explorar_btn')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Participar */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">{t('sobre.participar_eyebrow')}</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10">
          {t('sobre.participar_h2')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-teal" />
            </div>
            <h3 className="font-semibold mb-2">{t('sobre.participar_negocio_h3')}</h3>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">{t('sobre.participar_negocio_desc')}</p>
            <Link to="/cadastre" className="text-teal text-sm font-semibold hover:underline flex items-center gap-1">
              {t('sobre.participar_negocio_btn')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-ocre-light flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-ocre" />
            </div>
            <h3 className="font-semibold mb-2">{t('sobre.participar_alcance_h3')}</h3>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">{t('sobre.participar_alcance_desc')}</p>
            <Link to={lp('/apoie')} className="text-ocre text-sm font-semibold hover:underline flex items-center gap-1">
              {t('sobre.participar_alcance_btn')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#E8E4DF] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#3D3D3D]" />
            </div>
            <h3 className="font-semibold mb-2">{t('sobre.participar_morador_h3')}</h3>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">{t('sobre.participar_morador_desc')}</p>
            <Link to={lp('/contrate')} className="text-[#3D3D3D] dark:text-[#C0BCB8] text-sm font-semibold hover:underline flex items-center gap-1">
              {t('sobre.participar_morador_btn')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
