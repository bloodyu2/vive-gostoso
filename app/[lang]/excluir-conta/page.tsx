import type { Metadata } from 'next'
import { routing } from '../../../i18n/routing'

export const metadata: Metadata = {
  title: 'Excluir minha conta',
  description: 'Como apagar a sua conta e os seus dados do Vive Gostoso, no aplicativo ou por e-mail.',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }))
}

const ASSUNTO = encodeURIComponent('Excluir minha conta do Vive Gostoso')
const CORPO = encodeURIComponent('Quero excluir a minha conta do Vive Gostoso e os dados ligados a ela.\n\nE-mail da conta: \nNome: ')

export default async function ExcluirContaPage({ params }: { params: Promise<{ lang: string }> }) {
  await params
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-20">
      <h1 className="font-display font-bold text-4xl md:text-5xl leading-[1.1] tracking-tight text-fg-1 mb-10">Excluir minha conta</h1>
      <div className="max-w-none text-fg-3-texto text-base md:text-lg leading-relaxed space-y-10">
        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">Pelo aplicativo (o jeito mais rápido)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Abra o aplicativo Vive Gostoso e entre na sua conta.</li>
            <li>Toque em <strong>Eu</strong>, na barra de baixo.</li>
            <li>Role até o fim e toque em <strong>Excluir minha conta</strong>.</li>
            <li>Digite <strong>EXCLUIR</strong> para confirmar e toque em <strong>Excluir tudo</strong>.</li>
          </ol>
          <p className="mt-3">A exclusão apaga a conta na hora e não pode ser desfeita.</p>
        </section>

        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">Sem acesso ao aplicativo</h2>
          <p>
            Envie um e-mail para{' '}
            <a className="underline" href={`mailto:privacidade@vivegostoso.com.br?subject=${ASSUNTO}&body=${CORPO}`}>privacidade@vivegostoso.com.br</a>{' '}
            a partir do e-mail da conta, com o assunto “Excluir minha conta”. Respondemos em até 5 dias úteis e apagamos os dados em até 30 dias. Se o e-mail vier de outro endereço, vamos pedir uma confirmação antes de apagar, para que ninguém exclua a conta de outra pessoa.
          </p>
          <p className="mt-3">Isso vale para a conta do aplicativo e para o cadastro no site (negócio, profissional ou Passaporte), que usam o mesmo e-mail.</p>
        </section>

        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">O que é apagado</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>A conta, o nome, o e-mail e a foto, se houver.</li>
            <li>Os cadastros de trabalho (entregador, motorista, prestador, negócio) e a disponibilidade.</li>
            <li>Pedidos, corridas, pedidos de serviço, orçamentos e mensagens ligados à conta.</li>
            <li>Carimbos e cupons do Passaporte, itens salvos, endereços, avisos e os aparelhos registrados para receber avisos.</li>
          </ul>
        </section>

        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">O que pode ficar guardado</h2>
          <p>
            Registros que a lei manda guardar por um tempo, como os de cobranças da mensalidade feitas pelo Asaas, e dados sem identificação, usados só para contar o uso do site. Eles não servem para identificar você depois da exclusão.
          </p>
        </section>

        <section className="border-t border-border-1 pt-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-fg-1 mb-3">Dúvidas</h2>
          <p>Fale com a gente em contato@vivegostoso.com.br. Veja também a Política de Privacidade e os Termos de Uso do Vive Gostoso.</p>
        </section>

        <p className="text-sm text-fg-3-texto">Última atualização: 12 de novembro de 2026.</p>
      </div>
    </div>
  )
}
