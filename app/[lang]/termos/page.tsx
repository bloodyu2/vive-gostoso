import type { Metadata } from 'next'
import { routing } from '../../../i18n/routing'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'As regras de uso do site e do aplicativo Vive Gostoso, em linguagem simples.',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }))
}

const SECOES: { titulo: string; texto: string[] }[] = [
  {
    titulo: '1. O que é o Vive Gostoso',
    texto: [
      'O Vive Gostoso é o site e o aplicativo de São Miguel do Gostoso, RN. Ele reúne o guia da cidade, as marés e o vento, o Passaporte Gostoso (cupons e carimbos) e, no aplicativo, pedidos de comida, corridas e pedidos de serviço.',
      'O Vive Gostoso liga as pessoas. Quem entrega, quem dirige, quem presta o serviço e quem vende é a pessoa ou o negócio que aceitou o pedido, e não o Vive Gostoso.',
    ],
  },
  {
    titulo: '2. Conta',
    texto: [
      'Você pode olhar o guia sem conta. Para pedir, chamar uma corrida, guardar cupons ou trabalhar no aplicativo é preciso criar uma conta com um e-mail seu (ou entrar com o Google). Guarde sua senha e não a passe a ninguém.',
      'Você deve ter 18 anos ou mais, ou o consentimento de quem responde por você, para criar uma conta.',
    ],
  },
  {
    titulo: '3. Pagamento',
    texto: [
      'O aplicativo não cobra pedido, corrida nem serviço. O preço é combinado entre as pessoas e pago direto, na hora, em Pix, cartão ou dinheiro.',
      'A única cobrança do aplicativo é a mensalidade de quem trabalha nele: R$ 4,99 por mês por serviço, e R$ 199 por mês no plano do negócio, cobradas pelo Asaas. O primeiro mês é grátis no período de lançamento. Se a mensalidade de um papel atrasar, só esse papel é pausado, e ele volta quando o pagamento é confirmado.',
    ],
  },
  {
    titulo: '4. Quem trabalha no aplicativo',
    texto: [
      'Só pessoas se cadastram para trabalhar, cada uma com o próprio nome e WhatsApp. Uma agência ou empresa não cadastra funcionários nem escolhe quem vai: cada um faz o próprio cadastro.',
      'Entrega e corrida só abrem depois que a equipe confere o cadastro (nome, WhatsApp, documento e veículo). Mototáxi e táxi precisam de alvará. A equipe pode suspender um papel que desrespeite estas regras.',
    ],
  },
  {
    titulo: '5. O que esperamos de você',
    texto: [
      'Tratar bem as outras pessoas, informar dados verdadeiros, não usar o aplicativo para fraude, assédio ou qualquer coisa ilegal, e cancelar com aviso quando não puder cumprir um pedido.',
      'Condutas graves podem ser denunciadas no próprio aplicativo (Regras e segurança). Em risco imediato, ligue 190 (polícia) ou 192 (Samu): o aplicativo não é um serviço de emergência.',
    ],
  },
  {
    titulo: '6. Responsabilidade',
    texto: [
      'Fazemos o possível para o aplicativo funcionar sempre, mas ele pode ficar fora do ar ou ter erros. Marés, vento e horários são estimativas e não substituem a sua atenção no mar e na estrada.',
      'Problemas com um pedido, uma corrida ou um serviço se resolvem entre as partes, no chat do aplicativo. O Vive Gostoso não decide entre vocês, mas ajuda a mediar e pode suspender quem agir de má-fé.',
    ],
  },
  {
    titulo: '7. Seus dados',
    texto: [
      'Como tratamos os seus dados está na Política de Privacidade. Você pode pedir a exclusão da conta e dos dados a qualquer momento, no aplicativo ou pela página de exclusão de conta.',
    ],
  },
  {
    titulo: '8. Mudanças e contato',
    texto: [
      'Podemos mudar estes termos. Avisaremos no aplicativo e no site quando a mudança for importante. Dúvidas: contato@vivegostoso.com.br.',
    ],
  },
]

export default async function TermosPage({ params }: { params: Promise<{ lang: string }> }) {
  await params
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-20">
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-[1.1] tracking-tight text-fg-1 mb-10">Termos de Uso</h1>
      <div className="max-w-none text-fg-3-texto text-base md:text-lg leading-relaxed space-y-10">
        {SECOES.map((s) => (
          <section key={s.titulo} className="border-t border-border-1 pt-6">
            <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{s.titulo}</h2>
            <div className="space-y-3">
              {s.texto.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        <p className="text-sm text-fg-3-texto">Última atualização: 12 de novembro de 2026. Texto em linguagem simples; a versão revisada juridicamente substitui esta quando publicada.</p>
      </div>
    </div>
  )
}
