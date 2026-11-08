import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'
import { getLocale } from 'next-intl/server'

import { GTMScript } from '@/components/gtm-script'
import { PageViewTracker } from '@/components/page-view-tracker'
import { ToastContainer } from '@/components/ui/toast'
import { SCRIPT_ANTI_FOUC } from '@/lib/tema'
import { getNonce } from '@/lib/csp-nonce'
import '@/styles/globals.css'

/** O valor do atributo `lang`, por idioma.
 *
 *  `pt` vira `pt-BR` porque o conteudo e portugues do Brasil, e a etiqueta com
 *  regiao e a que o leitor de tela usa para escolher a voz. `en` e `es` ficam
 *  sem regiao: o site nao se dirige a um pais especifico nessas duas. */
const LANG_HTML: Record<string, string> = { pt: 'pt-BR', en: 'en', es: 'es' }

/* KAN-463: as duas familias servidas pelo proprio site (next/font), com preload.
   Antes vinham do Google Fonts: uma folha que bloqueava a pintura (0,96 s no
   Lighthouse celular) e os arquivos so eram pedidos depois dela, num segundo
   dominio. Mesmas familias, eixos e estilos de antes. `subsets` so decide o que
   entra em preload: os outros recortes continuam declarados por unicode-range. */
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-fraunces',
})
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

/** [largura css, altura css, densidade] dos iPhones com tela de abertura. */
const SPLASH_IPHONE: ReadonlyArray<readonly [number, number, number]> = [
  [440, 956, 3],
  [430, 932, 3],
  [428, 926, 3],
  [414, 896, 3],
  [414, 896, 2],
  [402, 874, 3],
  [393, 852, 3],
  [390, 844, 3],
  [375, 812, 3],
  [375, 667, 2],
]

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
  /* KAN-347: o nonce da requisicao, gerado no proxy. Vai no script anti-FOUC
     abaixo e no bootstrap do GTM, para os dois rodarem sob a CSP que deixou de
     ter 'unsafe-inline' em script-src. */
  const nonce = await getNonce()

  return (
    <html lang={LANG_HTML[lang] ?? lang} className={`${fraunces.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Antes de qualquer outra coisa no <head>: aplica a classe do tema
            escuro antes do primeiro paint, para quem usa escuro nao ver um
            flash claro. Le a mesma chave e a mesma regra do useTheme, de
            src/lib/tema.ts, com teste que compara os dois. O <html> acima tem
            suppressHydrationWarning porque este script muta a classe dele de
            proposito antes da hidratacao. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SCRIPT_ANTI_FOUC }} />
        {/* Abertura do app instalado no iPhone: uma tela por tamanho (largura x altura em
            pixels CSS e densidade), com o logo original inteiro. Gerada por
            scripts/gerar-icones-app.py. Sem a tela certa o iOS mostra o fundo em branco. */}
        {SPLASH_IPHONE.map(([w, h, dpr]) => (
          <link
            key={`${w}x${h}x${dpr}`}
            rel="apple-touch-startup-image"
            media={`screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr})`}
            href={`/splash/splash-${w * dpr}x${h * dpr}.png`}
          />
        ))}
      <GTMScript nonce={nonce} />
    </head>
      <body className="bg-page text-fg-1 font-sans antialiased">
        <PageViewTracker />
        <Providers>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  )
}
