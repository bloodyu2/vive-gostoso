import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import { GTMScript } from '@/components/gtm-script'
import { PageViewTracker } from '@/components/page-view-tracker'
import { ToastContainer } from '@/components/ui/toast'
import '@/styles/globals.css'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
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
