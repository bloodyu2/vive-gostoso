// app/layout.tsx
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://vivegostoso.com.br'),
  title: { default: 'Vive Gostoso', template: '%s | Vive Gostoso' },
  description: 'A infraestrutura digital de São Miguel do Gostoso, RN.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-areia text-[#1A1A1A] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
