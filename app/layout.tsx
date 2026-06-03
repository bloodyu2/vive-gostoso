import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import { GTMScript } from '@/components/gtm-script'
import '@/styles/globals.css'

export const viewport: Viewport = {
  themeColor: '#0D7C7C',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://vivegostoso.com.br'),
  title: { default: 'Vive Gostoso', template: '%s | Vive Gostoso' },
  description: 'A infraestrutura digital de São Miguel do Gostoso, RN.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
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
      <GTMScript />
    </head>
      <body className="bg-areia text-[#1A1A1A] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
