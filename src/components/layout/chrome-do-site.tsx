'use client'

import { usePathname } from 'next/navigation'

import { CookieBanner } from '@/components/cookie-banner'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ShareFab } from '@/components/share-fab'

/** O que o layout de idioma põe em volta de toda página, e as rotas onde isso
 *  atrapalha.
 *
 *  Cabeçalho, rodapé, botão flutuante de compartilhar e banner de cookies são certos
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
const SEM_CROMO = ['/bio']

function semPrefixo(caminho: string): string {
  const sem = caminho.replace(/^\/(pt|en|es)(?=\/|$)/, '')
  return sem === '' ? '/' : sem
}

export function ChromeDoSite({ children }: { children: React.ReactNode }) {
  const caminho = semPrefixo(usePathname() ?? '/')
  const nu = SEM_CROMO.some((rota) => caminho === rota || caminho.startsWith(`${rota}/`))

  if (nu) return <main>{children}</main>

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ShareFab />
      <CookieBanner />
    </>
  )
}
