// next.config.ts
import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const SUPABASE_ORIGIN = 'https://wppsmvgbagalczoardfl.supabase.co'
// Varias capas de negocio ainda apontam para o Unsplash (fotos de exemplo
// cadastradas no banco). A CSP nao listava esses hosts, entao o navegador
// bloqueava as imagens em silencio -- 5 das 8 <img> da home ficavam com
// naturalWidth 0 mesmo com as URLs respondendo 200 e JPEG valido.
const UNSPLASH_ORIGINS = 'https://images.unsplash.com https://plus.unsplash.com'
const SUPABASE_WS_ORIGIN = 'wss://wppsmvgbagalczoardfl.supabase.co'

// Content-Security-Policy -- ver docs/security-audit/relatorio-auditoria-seguranca.pdf (F5).
// Reimplementa o que o CLAUDE.md documentava como vivendo em vercel.json (removido em algum
// momento para corrigir um 404 causado por um rewrite catch-all) -- next.config.ts headers()
// e o lugar certo pra isso na Vercel, sem precisar de vercel.json. 'unsafe-inline' em
// script-src/style-src e um trade-off deliberado e documentado: o bootstrap de consent+gtag do
// GTM (src/components/gtm-script.tsx) e varios `style={{...}}` inline no app nao usam nonce --
// uma CSP com nonce por request e uma mudanca maior e separada. Esta CSP ainda bloqueia
// injecao arbitraria de script/estilo/frame/object de terceiros, que e a reducao de impacto
// que importa para os achados de XSS (F1, F2).
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${SUPABASE_ORIGIN} ${UNSPLASH_ORIGINS} https://api.mapbox.com https://*.tiles.mapbox.com`,
  `connect-src 'self' ${SUPABASE_ORIGIN} ${SUPABASE_WS_ORIGIN} https://api.mapbox.com https://events.mapbox.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com`,
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
  'report-uri /api/csp-report',
].join('; ')

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wppsmvgbagalczoardfl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
          { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
        ],
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})(withNextIntl(config))
