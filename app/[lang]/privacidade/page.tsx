import type { Metadata } from 'next'
import { getMessages } from 'next-intl/server'
import { routing } from '../../../i18n/routing'

export const metadata: Metadata = {
  title: 'Politica de Privacidade',
  description: 'Como tratamos seus dados no Vive Gostoso.',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }))
}

export default async function PrivacidadePage({ params }: { params: Promise<{ lang: string }> }) {
  await params
  const messages = await getMessages()
  const t = (messages as Record<string, Record<string, string>>)?.privacidade ?? {}

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-20">
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-[1.1] tracking-tight text-fg-1 mb-10">
        {t.title ?? 'Politica de Privacidade'}
      </h1>
      <div className="max-w-none text-fg-3-texto text-base md:text-lg leading-relaxed space-y-10">
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{t.sec1_title ?? '1. Quem somos'}</h2>
          <p>{t.sec1_text ?? 'Vive Gostoso e a infraestrutura digital de Sao Miguel do Gostoso, RN. Operamos sem fins lucrativos e com transparencia total.'}</p>
        </section>
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{t.sec2_title ?? '2. Dados que coletamos'}</h2>
          <p>{t.sec2_text ?? 'Coletamos apenas dados necessarios: nome, e-mail e telefone para cadastro de prestadores; dados publicos de negocios (nome, endereco, contato); e dados de navegacao via cookies analiticos (com seu consentimento).'}</p>
        </section>
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{t.sec3_title ?? '3. Como usamos seus dados'}</h2>
          <p>{t.sec3_text ?? 'Seus dados sao usados para: exibir seu perfil/negocio na plataforma; permitir contato direto (WhatsApp); analise de uso anonima para melhorar o site; e processamento de pagamentos (Stripe).'}</p>
        </section>
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{t.sec4_title ?? '4. Cookies'}</h2>
          <p>{t.sec4_text ?? 'Usamos cookies essenciais, que fazem o site funcionar, e cookies de análise, só com o seu consentimento. Os de análise são do Google Analytics, que conta as visitas, e do Microsoft Clarity, que faz mapas de calor e grava a sessão de forma anônima (cliques, rolagem e movimento na página). Você pode recusar ou mudar a escolha quando quiser, em "Gerenciar cookies", no rodapé.'}</p>
        </section>
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{t.sec5_title ?? '5. Seus direitos (LGPD)'}</h2>
          <p>{t.sec5_text ?? 'Voce tem direito a: acessar, corrigir, excluir, portar e revogar consentimento. Para exercer, envie e-mail para: privacidade@vivegostoso.com.br'}</p>
        </section>
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">{t.sec6_title ?? '6. Retencao'}</h2>
          <p>{t.sec6_text ?? 'Mantemos seus dados enquanto sua conta ou negocio estiver ativo na plataforma. Apos exclusao, removemos em ate 30 dias, salvo obrigacoes legais.'}</p>
        </section>
      </div>
    </div>
  )
}
