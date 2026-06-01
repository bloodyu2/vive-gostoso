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
  const { lang } = await params
  const messages = await getMessages()
  const t = (messages as any)?.privacidade ?? {}

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-16">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1A1A1A] mb-6">
        {t.title ?? 'Politica de Privacidade'}
      </h1>
      <div className="prose prose-lg max-w-none text-[#1A1A1A]/80 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">{t.sec1_title ?? '1. Quem somos'}</h2>
          <p>{t.sec1_text ?? 'Vive Gostoso e a infraestrutura digital de Sao Miguel do Gostoso, RN. Operamos sem fins lucrativos e com transparencia total.'}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">{t.sec2_title ?? '2. Dados que coletamos'}</h2>
          <p>{t.sec2_text ?? 'Coletamos apenas dados necessarios: nome, e-mail e telefone para cadastro de prestadores; dados publicos de negocios (nome, endereco, contato); e dados de navegacao via cookies analiticos (com seu consentimento).'}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">{t.sec3_title ?? '3. Como usamos seus dados'}</h2>
          <p>{t.sec3_text ?? 'Seus dados sao usados para: exibir seu perfil/negocio na plataforma; permitir contato direto (WhatsApp); analise de uso anonima para melhorar o site; e processamento de pagamentos (Stripe).'}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">{t.sec4_title ?? '4. Cookies'}</h2>
          <p>{t.sec4_text ?? 'Usamos cookies essenciais (funcionamento do site) e cookies analiticos (Google Analytics) apenas com seu consentimento. Voce pode recusar ou gerenciar a qualquer momento clicando em "Gerenciar cookies" no rodape.'}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">{t.sec5_title ?? '5. Seus direitos (LGPD)'}</h2>
          <p>{t.sec5_text ?? 'Voce tem direito a: acessar, corrigir, excluir, portar e revogar consentimento. Para exercer, envie e-mail para: privacidade@vivegostoso.com.br'}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">{t.sec6_title ?? '6. Retencao'}</h2>
          <p>{t.sec6_text ?? 'Mantemos seus dados enquanto sua conta ou negocio estiver ativo na plataforma. Apos exclusao, removemos em ate 30 dias, salvo obrigacoes legais.'}</p>
        </section>
      </div>
    </div>
  )
}
