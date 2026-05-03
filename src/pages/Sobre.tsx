import { Link } from 'react-router-dom'
import {
  Heart, Globe, Users, TrendingUp, MapPin, ArrowRight,
  Gift, Search, Megaphone, Lightbulb, BookOpen,
  Eye, BarChart2, CheckCircle, ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { usePageMeta } from '@/hooks/usePageMeta'

const STEPS = [
  {
    icon: Gift,
    color: 'bg-teal-light text-teal',
    title: 'Cadastro gratuito para sempre',
    body: 'Qualquer negócio de Gostoso entra na plataforma sem pagar nada. Fotos, horários, contato, localização. Isso é feito de boa vontade e amor pela cidade, sem prazo, sem cobrança surpresa.',
    tag: 'Hoje',
  },
  {
    icon: Search,
    color: 'bg-teal-light text-teal',
    title: 'Tráfego orgânico imediato',
    body: 'Quem chega a Gostoso pesquisa antes de chegar. Cada perfil cadastrado aparece nos resultados de busca, no Google e dentro da plataforma, sem pagar um centavo de anúncio.',
    tag: 'Hoje',
  },
  {
    icon: TrendingUp,
    color: 'bg-ocre-light text-ocre',
    title: 'Mais negócios = mais alcance para todos',
    body: 'A plataforma fica mais relevante no Google a cada negócio que entra. Mais visitantes a encontram antes de embarcar para Gostoso. O crescimento é coletivo, e gratuito para quem participa.',
    tag: 'Efeito rede',
  },
  {
    icon: Megaphone,
    color: 'bg-ocre-light text-ocre',
    title: 'Associados amplificam o destino',
    body: 'Quem se torna associado (R$30-50/mês) financia campanhas de tráfego pago que promovem Gostoso como destino. O retorno não é exclusivo de quem paga: toda a plataforma se beneficia. 80% vai direto para o Fundo Público da Cidade.',
    tag: 'Opcional',
  },
  {
    icon: Lightbulb,
    color: 'bg-[#EDE9FE] text-[#7C3AED]',
    title: 'O futuro depende da comunidade',
    body: 'Simpósios, treinamentos, palestras, workshops de temporada: tudo isso é possível quando a comunidade se organiza. O Vive Gostoso é a infraestrutura. O que construímos em cima é decisão de quem vive e trabalha aqui.',
    tag: 'Futuro',
  },
]

const FUTURE = [
  { icon: BookOpen, label: 'Simpósios e palestras' },
  { icon: Users,    label: 'Workshops coletivos' },
  { icon: BarChart2,label: 'Dados de temporada' },
  { icon: Globe,    label: 'Promoção nacional' },
]

export default function Sobre() {
  usePageMeta({
    title: 'Sobre o Vive Gostoso',
    description: 'Conheça o projeto por trás do guia digital de São Miguel do Gostoso — feito pela comunidade, para a comunidade.',
  })
  const { t } = useTranslation()
  const lp = useLocalePath()

  const VERBOS = [
    { v: t('nav.come'),      to: lp('/come'),      desc: 'Restaurantes, bares e gastronomia local',     color: 'text-ocre' },
    { v: t('nav.fique'),     to: lp('/fique'),     desc: 'Pousadas e hospedagem de todos os estilos',    color: 'text-teal' },
    { v: t('nav.passeie'),   to: lp('/passeie'),   desc: 'Kite, buggy, passeios e esportes',             color: 'text-[#3D8B5A]' },
    { v: t('nav.explore'),   to: lp('/explore'),   desc: 'Mapa interativo da cidade',                    color: 'text-coral' },
    { v: t('nav.participe'), to: lp('/participe'), desc: 'Festivais e eventos do calendário',            color: 'text-teal' },
    { v: t('nav.conheca'),   to: lp('/conheca'),   desc: 'História, praias e como chegar',               color: 'text-[#3D8B5A]' },
    { v: t('nav.apoie'),     to: lp('/apoie'),     desc: 'Fundo público e transparência financeira',     color: 'text-ocre' },
    { v: t('nav.contrate'),  to: lp('/contrate'),  desc: 'Serviços de moradores e vagas de emprego',     color: 'text-coral' },
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
          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-white/10">
            {[
              { n: '100%', label: 'gratuito para todos os negócios' },
              { n: '80%',  label: 'da arrecadação fica na cidade' },
              { n: '0%',   label: 'de lucro para ninguém de fora' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-white">{s.n}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gratuito — banner destaque */}
      <section className="bg-teal px-5 md:px-8 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-base">Todos os negócios cadastrados hoje recebem tráfego orgânico. Gratuitamente.</p>
              <p className="text-teal-light text-sm mt-0.5">Sem prazo. Sem cobrança. Feito com amor por quem mora aqui.</p>
            </div>
          </div>
          <Link to="/cadastre"
            className="flex-shrink-0 bg-white text-teal font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-teal-light transition-colors flex items-center gap-1.5">
            Cadastrar meu negócio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* O que é */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
          Não é um site de turismo.<br />É o sistema operacional da cidade.
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed">
          <p>
            Sites de turismo mostram o que a cidade quer vender. O Vive Gostoso mostra o que a cidade <em>é</em>, incluindo o restaurante pequeno que abre toda segunda, a pousada gerenciada por quem nasceu aqui, o kite instructor que conhece cada vento.
          </p>
          <p>
            A plataforma pertence à cidade. Não existe para gerar lucro para um investidor externo. Existe para que o dinheiro do turismo fique em Gostoso, financie Gostoso, e faça Gostoso crescer do jeito que os moradores querem.
          </p>
        </div>
      </section>

      {/* Como funciona — cards com ícone */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">O modelo</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10">
            Como o Vive Gostoso funciona
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

      {/* Efeito rede — flywheel visual */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Efeito comunidade</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          Quanto mais, melhor para todos.
        </h2>
        <p className="text-[#737373] text-lg mb-12 max-w-2xl">
          O Vive Gostoso funciona como um volante: cada negócio que entra fortalece o todo. Ninguém precisa investir sozinho.
        </p>
        {/* Flywheel */}
        <div className="relative">
          {/* Linha conectora — desktop */}
          <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users,      label: 'Mais negócios cadastrados',    color: 'bg-teal-light text-teal' },
              { icon: TrendingUp, label: 'Plataforma mais relevante no Google', color: 'bg-ocre-light text-ocre' },
              { icon: Eye,        label: 'Mais visitantes chegam preparados',   color: 'bg-teal-light text-teal' },
              { icon: Heart,      label: 'Mais clientes para todo mundo',        color: 'bg-ocre-light text-ocre' },
            ].map((node, i) => {
              const Icon = node.icon
              return (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${node.color} relative z-10`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#3D3D3D] dark:text-[#C0BCB8] font-medium leading-snug">{node.label}</p>
                  {i < 3 && (
                    <div className="md:hidden text-[#C4BFBA] text-lg">↓</div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-8 p-5 bg-areia dark:bg-[#161616] rounded-2xl flex items-center gap-4 border border-[#E8E4DF] dark:border-[#2D2D2D]">
            <CheckCircle className="w-5 h-5 text-teal flex-shrink-0" />
            <p className="text-sm text-[#3D3D3D] dark:text-[#C0BCB8] leading-relaxed">
              <strong>E o ciclo recomeça.</strong> Mais clientes significa mais negócios querendo participar, o que torna a plataforma ainda mais forte. Ninguém precisa fazer isso sozinho.
            </p>
          </div>
        </div>
      </section>

      {/* Sistema de verbos */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Os módulos</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-2">
            Oito verbos. Uma cidade inteira.
          </h2>
          <p className="text-[#737373] text-lg mb-10">
            Cada módulo responde a uma pergunta que o visitante, e o morador, faz todo dia.
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

      {/* Planos — 3 tiers explícitos */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Associe-se</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          Três formas de participar.
        </h2>
        <p className="text-[#737373] text-lg mb-10 max-w-2xl">
          O cadastro é gratuito e já traz retorno. Os planos pagos existem para quem quer mais, e para financiar a cidade.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {/* Gratuito */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6 flex flex-col">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-[#1A1A1A] dark:text-white">R$0</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-5">Gratuito, sempre</div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] flex-1">
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Perfil completo na plataforma</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Fotos, horários, contato e mapa</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Tráfego orgânico imediato</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Aparece em buscas do Google</li>
            </ul>
            <Link to="/cadastre" className="mt-6 block text-center bg-[#F5F2EE] dark:bg-[#2D2D2D] text-[#1A1A1A] dark:text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#E8E4DF] transition-colors">
              Cadastrar agora
            </Link>
          </div>

          {/* Associado R$30 */}
          <div className="bg-white dark:bg-[#1C1C1C] border border-teal/30 rounded-2xl p-6 flex flex-col">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-teal">R$30</span>
              <span className="text-sm text-[#737373]">/mês</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-teal mb-5">Associado</div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] flex-1">
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Tudo do plano gratuito</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Destaque nas listagens</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> Selo "Associado" no perfil</li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span><span><strong>Tráfego pago coletivo:</strong> campanhas que promovem Gostoso como destino. Todos os associados aparecem.</span></li>
              <li className="flex items-start gap-2"><span className="text-teal mt-0.5">✓</span> 80% vai para o Fundo da Cidade</li>
            </ul>
            <Link to="/cadastre" className="mt-6 block text-center bg-teal text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-teal-dark transition-colors">
              Quero ser associado
            </Link>
          </div>

          {/* Associado Plus R$50 */}
          <div className="bg-white dark:bg-[#1C1C1C] border-2 border-ocre rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-5 bg-ocre text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Mais visibilidade
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-ocre">R$50</span>
              <span className="text-sm text-[#737373]">/mês</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-ocre mb-5">Associado Plus</div>
            <ul className="space-y-2.5 text-sm text-[#3D3D3D] dark:text-[#C0BCB8] flex-1">
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span> Tudo do plano Associado</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span><span><strong>Tráfego pago dedicado:</strong> campanhas individuais criadas e gerenciadas pela <a href="https://balaio.net" target="_blank" rel="noopener noreferrer" className="text-teal underline">Balaio</a>, especializada em marketing local.</span></li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span> Relatório mensal de resultados</li>
              <li className="flex items-start gap-2"><span className="text-ocre mt-0.5">✓</span> 80% vai para o Fundo da Cidade</li>
            </ul>
            <Link to="/cadastre" className="mt-6 block text-center bg-ocre text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-ocre-dark transition-colors">
              Quero o Plus
            </Link>
          </div>
        </div>
        <p className="text-xs text-[#737373] mt-6 text-center">
          Os planos pagos são opcionais e não existem para gerar lucro: existem para financiar a promoção coletiva de Gostoso.
        </p>
      </section>

      {/* Transparência financeira */}
      <section className="bg-teal text-white px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-light/70 mb-3">Prestação de contas</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10 text-white">
            Cada real. Público. Auditável.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <div className="text-5xl font-display font-bold mb-2">80%</div>
              <div className="text-teal-light text-sm font-medium leading-snug">da arrecadação vai para o Fundo Público de Marketing da Cidade</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <div className="text-5xl font-display font-bold mb-2">20%</div>
              <div className="text-teal-light text-sm font-medium leading-snug">cobre hosting, domínio e manutenção técnica da plataforma</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <div className="text-5xl font-display font-bold mb-2">0%</div>
              <div className="text-teal-light text-sm font-medium leading-snug">de lucro: a plataforma não existe para enriquecer ninguém de fora</div>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              Toda movimentação financeira é pública e visível em tempo real na página APOIE. Qualquer pessoa pode auditar o que entra e o que sai.
            </p>
            <Link to={lp('/apoie')} className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-teal font-semibold px-5 py-2.5 rounded-full hover:bg-teal-light transition-colors text-sm">
              <TrendingUp className="w-4 h-4" />
              Ver o fundo agora
            </Link>
          </div>
        </div>
      </section>

      {/* Futuro */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">O que vem depois</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
          O futuro é da comunidade.
        </h2>
        <p className="text-[#737373] text-lg mb-10 max-w-2xl leading-relaxed">
          A plataforma é a infraestrutura. O que a cidade constrói em cima depende de quantas pessoas decidirem participar. Algumas possibilidades reais:
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
          <p className="text-sm text-[#737373] leading-relaxed">
            Nenhum disso depende de uma empresa de fora. Depende de moradores, donos de negócios e quem ama Gostoso decidindo fazer juntos. A infraestrutura já existe.
          </p>
        </div>
      </section>

      {/* Quem faz */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Quem faz</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
            Desenvolvido pela Balaio.
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
                    Tecnologia e estratégia · <a href="https://balaio.net" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline inline-flex items-center gap-0.5">balaio.net <ExternalLink className="w-3 h-3" /></a>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#737373] leading-relaxed">
                Hub responsável pelo desenvolvimento e manutenção da plataforma. O Vive Gostoso é o caso zero de um modelo replicável para outras cidades do litoral nordestino.
              </p>
              <a
                href="mailto:contato@vivegostoso.com.br"
                className="mt-3 inline-block text-xs text-teal hover:underline"
              >
                contato@vivegostoso.com.br
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — conhecer a homepage */}
      <section className="bg-[#1A1A1A] text-white px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-white/50 text-sm font-semibold uppercase tracking-widest mb-3">Pronto para explorar?</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-3">
              Agora que você conhece a iniciativa,<br className="hidden md:block" />
              que tal conhecer a cidade?
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-lg">
              Restaurantes, pousadas, passeios, eventos: tudo está na plataforma. Quem sabe o seu negócio já não está lá?
            </p>
          </div>
          <Link
            to={lp('/')}
            className="flex-shrink-0 flex items-center gap-2 bg-teal text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-teal-dark transition-colors"
          >
            Ver a página inicial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Participe</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-10">
          Como participar do Vive Gostoso
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-teal" />
            </div>
            <h3 className="font-semibold mb-2">Tem um negócio?</h3>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">
              Cadastre gratuitamente. Perfil completo com fotos, horários, localização e contato direto. Zero custo, sempre.
            </p>
            <Link to="/cadastre" className="text-teal text-sm font-semibold hover:underline flex items-center gap-1">
              Cadastrar agora <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-ocre-light flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-ocre" />
            </div>
            <h3 className="font-semibold mb-2">Quer ampliar seu alcance?</h3>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">
              Torne-se associado e contribua com a promoção coletiva da cidade. 80% do valor vai direto para o Fundo Público.
            </p>
            <Link to={lp('/apoie')} className="text-ocre text-sm font-semibold hover:underline flex items-center gap-1">
              Ver os planos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#E8E4DF] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#3D3D3D]" />
            </div>
            <h3 className="font-semibold mb-2">É morador?</h3>
            <p className="text-sm text-[#737373] leading-relaxed mb-4">
              Ofereça seus serviços ou divulgue vagas de emprego no módulo Contrate. Gratuito e sem intermediários.
            </p>
            <Link to={lp('/contrate')} className="text-[#3D3D3D] dark:text-[#C0BCB8] text-sm font-semibold hover:underline flex items-center gap-1">
              Ver o Contrate <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
