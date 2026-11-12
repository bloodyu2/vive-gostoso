'use client'

import { usePathname } from 'next/navigation'

import { ConsentimentoSalvo } from '@/components/consentimento-salvo'
import { CookieBanner } from '@/components/cookie-banner'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { GuiaChat } from '@/components/guia/guia-chat'
import { ShareFab } from '@/components/share-fab'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { BarraDoApp, barraDoAppVisivel } from '@/components/layout/barra-do-app'

/** O que o layout de idioma põe em volta de toda página, e as rotas onde isso
 *  atrapalha.
 *
 *  Cabeçalho, rodapé, flutuante de compartilhar, flutuante de WhatsApp e banner
 *  de cookies são certos
 *  no site. Na /bio os quatro viram ruído: ela é uma etiqueta NFC lida em pé, na rua,
 *  e ali o flutuante fica exatamente por cima do rodapé com o e-mail, enquanto o
 *  banner cobre a faixa de baixo inteira. Compartilhar também não faz sentido numa
 *  página cujo trabalho é ser compartilhada por aproximação.
 *
 *  Tirar o banner não deixa a medição sem consentimento: o GTM só mede depois do
 *  aceite. Quem chega pela etiqueta sem nunca ter respondido não é medido, e responde
 *  quando visitar o site.
 *
 *  O CAMINHO CHEGA COM E SEM PREFIXO DE IDIOMA. O projeto usa localePrefix
 *  "as-needed", então o português vive em /bio e os outros em /en/bio e /es/bio. Por
 *  isso a comparação tira o prefixo antes de olhar a rota, em vez de listar as três
 *  formas na mão e esquecer uma quando entrar um idioma novo. */
const SEM_CROMO = ['/bio', '/clube', '/p']

function semPrefixo(caminho: string): string {
  const sem = caminho.replace(/^\/(pt|en|es)(?=\/|$)/, '')
  return sem === '' ? '/' : sem
}

export function ChromeDoSite({ children }: { children: React.ReactNode }) {
  const caminho = semPrefixo(usePathname() ?? '/')
  const nu = SEM_CROMO.some((rota) => caminho === rota || caminho.startsWith(`${rota}/`))

  /* Medicao (08/11/2026): sem banner o consentimento nunca era concedido e o GA4 nao via
     nenhuma visita nas plaquinhas. Na /p o banner volta (e a unica forma de quem le o QR
     poder aceitar); em /bio e /clube segue sem banner, mas o aceite ja gravado e reaplicado. */
  if (nu) {
    const naPlaquinha = caminho === '/p' || caminho.startsWith('/p/')
    return (
      <>
        <main>{children}</main>
        {naPlaquinha ? <CookieBanner /> : <ConsentimentoSalvo />}
      </>
    )
  }

  const comBarra = barraDoAppVisivel(caminho)

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Espaco do tamanho da barra do app (so no celular), para ela nao cobrir o fim do rodape. */}
      {comBarra && <div aria-hidden="true" className="h-[calc(3.5rem+env(safe-area-inset-bottom))] md:hidden" />}
      <ShareFab />
      <WhatsAppButton variante="fab" />
      {/* KAN-687: guia de IA. Sem NEXT_PUBLIC_GUIA_ATIVO=1 nao renderiza nada. */}
      <GuiaChat />
      <BarraDoApp />
      <CookieBanner acimaDaBarra={comBarra} />
    </>
  )
}
