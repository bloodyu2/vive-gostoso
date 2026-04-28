import { Link } from 'react-router-dom'
import { Heart, Globe, Users, TrendingUp, MapPin, ArrowRight } from 'lucide-react'

const VERBOS = [
  { v: 'COME',      to: '/come',      desc: 'Restaurantes, bares e gastronomia local' },
  { v: 'FIQUE',     to: '/fique',     desc: 'Pousadas e hospedagem de todos os estilos' },
  { v: 'PASSEIE',   to: '/passeie',   desc: 'Kite, buggy, passeios e esportes' },
  { v: 'EXPLORE',   to: '/explore',   desc: 'Mapa interativo da cidade' },
  { v: 'PARTICIPE', to: '/participe', desc: 'Festivais e eventos do calendário' },
  { v: 'CONHEÇA',   to: '/conheca',   desc: 'História, praias e como chegar' },
  { v: 'APOIE',     to: '/apoie',     desc: 'Fundo público e transparência financeira' },
  { v: 'CONTRATE',  to: '/contrate',  desc: 'Serviços de moradores e vagas de emprego' },
]

const STEPS = [
  {
    n: '01',
    title: 'O negócio se cadastra',
    body: 'Restaurante, pousada, guia ou prestador de serviço — qualquer estabelecimento de Gostoso pode criar um perfil gratuito com fotos, horários, contato e localização.',
  },
  {
    n: '02',
    title: 'O visitante descobre',
    body: 'Quem chega a Gostoso encontra tudo num só lugar: onde comer, onde ficar, o que fazer, o que está aberto agora. Sem precisar depender de grupos de WhatsApp ou dicas desencontradas.',
  },
  {
    n: '03',
    title: 'O associado financia a cidade',
    body: 'Quem escolhe o plano associado (R$30-50/mês) ganha destaque na plataforma. Mas mais importante: 80% do que paga vai direto para o Fundo Público de Marketing da Cidade, visível e auditável por qualquer pessoa.',
  },
  {
    n: '04',
    title: 'A cidade cresce junta',
    body: 'O fundo financia promoção coletiva: campanhas de turismo, presença em feiras, calendário de eventos. Nenhum negócio sozinho consegue isso. Juntos, conseguem.',
  },
]

export default function Sobre() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal/20 text-teal-light text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" />
            São Miguel do Gostoso, RN
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6">
            A infraestrutura<br />digital de uma cidade.
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
            Gostoso tem tudo — praias de classe mundial, gastronomia de respeito, eventos que atraem o Brasil inteiro.
            Faltava um lugar onde tudo isso estivesse junto, organizado e acessível.
            <strong className="text-white"> O Vive Gostoso é esse lugar.</strong>
          </p>
        </div>
      </section>

      {/* O que é */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
          Não é um site de turismo.<br />É o sistema operacional da cidade.
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-[#3D3D3D] dark:text-[#C0BCB8] text-base leading-relaxed">
          <p>
            Sites de turismo mostram o que a cidade quer vender. O Vive Gostoso mostra o que a cidade <em>é</em> — incluindo o restaurante pequeno que abre toda segunda, a pousada gerenciada por quem nasceu aqui, o kite instructor que conhece cada vento.
          </p>
          <p>
            A plataforma pertence à cidade. Não existe para gerar lucro para um investidor externo. Existe para que o dinheiro do turismo fique em Gostoso, financie Gostoso, e faça Gostoso crescer do jeito que os moradores querem.
          </p>
        </div>
      </section>

      {/* Sistema de verbos */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Como funciona</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-2">
            Oito verbos. Uma cidade inteira.
          </h2>
          <p className="text-[#737373] text-lg mb-10">
            Cada módulo do Vive Gostoso responde a uma pergunta que o visitante — e o morador — faz todo dia.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {VERBOS.map(({ v, to, desc }) => (
              <Link
                key={v}
                to={to}
                className="group flex items-center gap-4 bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl px-5 py-4 hover:border-teal hover:shadow-md transition-all"
              >
                <span className="font-display font-bold text-xl text-teal w-28 flex-shrink-0">{v}</span>
                <span className="text-sm text-[#737373] leading-snug flex-1">{desc}</span>
                <ArrowRight className="w-4 h-4 text-teal opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">O modelo</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-12">
          Como o Vive Gostoso funciona
        </h2>
        <div className="space-y-10">
          {STEPS.map(s => (
            <div key={s.n} className="flex gap-6">
              <div className="font-display font-bold text-4xl text-[#E8E4DF] dark:text-[#2D2D2D] leading-none w-12 flex-shrink-0 pt-1">{s.n}</div>
              <div>
                <h3 className="font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-[#737373] leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transparência financeira */}
      <section className="bg-teal text-white px-5 md:px-8 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-display font-bold mb-2">80%</div>
            <div className="text-teal-light text-sm font-medium">da arrecadação vai para o Fundo Público de Marketing da Cidade</div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold mb-2">20%</div>
            <div className="text-teal-light text-sm font-medium">cobre hosting, domínio e manutenção técnica da plataforma</div>
          </div>
          <div>
            <div className="text-5xl font-display font-bold mb-2">0%</div>
            <div className="text-teal-light text-sm font-medium">de lucro. A plataforma não existe para enriquecer ninguém</div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Link to="/apoie" className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-6 py-3 rounded-full hover:bg-teal-light transition-colors text-sm">
            <TrendingUp className="w-4 h-4" />
            Ver o fundo em tempo real
          </Link>
        </div>
      </section>

      {/* Quem faz */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <p className="text-xs font-bold tracking-widest uppercase text-[#737373] mb-3">Quem faz</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-8">
          Feito por quem mora aqui.
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white font-bold">V</div>
              <div>
                <div className="font-semibold">Victor Hugo Lima</div>
                <div className="text-xs text-[#737373]">Arquiteto técnico · morador desde 2025</div>
              </div>
            </div>
            <p className="text-sm text-[#737373] leading-relaxed">
              Desenvolvedor e estrategista. Escolheu Gostoso como casa definitiva e decidiu colocar a tecnologia a serviço da cidade que adotou.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-ocre flex items-center justify-center text-white font-bold">J</div>
              <div>
                <div className="font-semibold">Jonathan</div>
                <div className="text-xs text-[#737373]">Articulação comunitária · morador local</div>
              </div>
            </div>
            <p className="text-sm text-[#737373] leading-relaxed">
              Guia turístico, dono de churrasco, conhecido de todo Gostoso. Conecta a plataforma com a realidade da cidade e com os primeiros negócios parceiros.
            </p>
          </div>
        </div>
      </section>

      {/* Como participar */}
      <section className="bg-areia dark:bg-[#161616] px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
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
                Cadastre seu estabelecimento gratuitamente. Perfil com fotos, horários, localização e contato direto.
              </p>
              <Link to="/cadastre" className="text-teal text-sm font-semibold hover:underline flex items-center gap-1">
                Cadastrar agora <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-ocre-light flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-ocre" />
              </div>
              <h3 className="font-semibold mb-2">Quer apoiar?</h3>
              <p className="text-sm text-[#737373] leading-relaxed mb-4">
                Torne-se associado. Seu negócio ganha destaque e parte do valor vai diretamente para o Fundo da Cidade.
              </p>
              <Link to="/apoie" className="text-ocre text-sm font-semibold hover:underline flex items-center gap-1">
                Saber mais <ArrowRight className="w-3.5 h-3.5" />
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
              <Link to="/contrate" className="text-[#3D3D3D] dark:text-[#C0BCB8] text-sm font-semibold hover:underline flex items-center gap-1">
                Ver o Contrate <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
