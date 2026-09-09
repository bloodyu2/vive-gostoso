import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import { getLocale } from 'next-intl/server'

import { GTMScript } from '@/components/gtm-script'
import { PageViewTracker } from '@/components/page-view-tracker'
import { ToastContainer } from '@/components/ui/toast'
import { SCRIPT_ANTI_FOUC } from '@/lib/tema'
import '@/styles/globals.css'

/** O valor do atributo `lang`, por idioma.
 *
 *  `pt` vira `pt-BR` porque o conteudo e portugues do Brasil, e a etiqueta com
 *  regiao e a que o leitor de tela usa para escolher a voz. `en` e `es` ficam
 *  sem regiao: o site nao se dirige a um pais especifico nessas duas. */
const LANG_HTML: Record<string, string> = { pt: 'pt-BR', en: 'en', es: 'es' }

export const viewport: Viewport = {
  themeColor: '#0D7C7C',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vivegostoso.com.br'),
  title: { default: 'Vive Gostoso', template: '%s | Vive Gostoso' },
  description: 'A infraestrutura digital de São Miguel do Gostoso, RN.',
  manifest: '/manifest.json',
  verification: {
    google: 'google342626b66cf2cdc9',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/pwa/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/pwa/icon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vive Gostoso',
  },
}

/** O idioma vem do next-intl, no servidor.
 *
 *  MEDIDO EM 09/09/2026, no HTML servido de dezoito rotas: `lang="pt"` nas tres
 *  linguas, inclusive em /en e /es. Leitor de tela le ingles com fonema
 *  portugues, e isso e falha de WCAG 3.1.1, nivel A.
 *
 *  O `LocaleSync` que existia so trocava a lingua do i18n; ele nunca tocou no
 *  atributo `lang`. Entao nao era "corrigido no navegador": era errado sempre.
 *
 *  `getLocale()` le o que o middleware do next-intl ja resolveu para esta
 *  requisicao, entao o valor sai do servidor e nao depende de JavaScript.
 *
 *  O `<html>` fica aqui, e nao em app/[lang]/layout.tsx, porque so o layout raiz
 *  pode escreve-lo, e este projeto tem rotas fora de [lang] (cadastre, auth,
 *  not-found) que dependem deste mesmo layout. Separar em dois layouts raiz por
 *  grupo de rota, como foi feito na Gostosense, moveria quarenta rotas num site
 *  cujo historico ja custou 428 URLs do indice. O ganho seria o mesmo e o risco
 *  nao. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocale()

  return (
    <html lang={LANG_HTML[lang] ?? lang} suppressHydrationWarning>
      <head>
        {/* Antes de qualquer outra coisa no <head>: aplica a classe do tema
            escuro antes do primeiro paint, para quem usa escuro nao ver um
            flash claro. Le a mesma chave e a mesma regra do useTheme, de
            src/lib/tema.ts, com teste que compara os dois. O <html> acima tem
            suppressHydrationWarning porque este script muta a classe dele de
            proposito antes da hidratacao. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ANTI_FOUC }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link rel="apple-touch-startup-image" href="/splash/splash-1170x2532.png" />
      <GTMScript />
    </head>
      <body className="bg-page text-fg-1 font-sans antialiased">
        <PageViewTracker />
        <Providers>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  )
}
