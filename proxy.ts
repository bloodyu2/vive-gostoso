// proxy.ts (era middleware.ts -- Next 16 renomeou a convencao)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const SUPABASE_ORIGIN = 'https://wppsmvgbagalczoardfl.supabase.co'
const UNSPLASH_ORIGINS = 'https://images.unsplash.com https://plus.unsplash.com'
const SUPABASE_WS_ORIGIN = 'wss://wppsmvgbagalczoardfl.supabase.co'

/** Nonce por requisicao, para a CSP.
 *
 *  KAN-347 (VGO-09). Antes desta mudanca o `script-src` tinha `'unsafe-inline'`,
 *  que e o que permite injecao de script inline. Com nonce, o navegador so
 *  executa script inline que carregue o valor da requisicao.
 *
 *  O site inteiro ja e renderizado por requisicao (todas as paginas usam
 *  `cookies()` via `createClient`, e as respostas medidas vinham com
 *  `x-vercel-cache: MISS` e `cache-control: private, no-store`), entao nao ha
 *  custo de cache estatico a perder: o nonce nao invalida nada que ja nao fosse
 *  dinamico. Medido em 2026-09-19 antes de escrever isto.
 *
 *  `'strict-dynamic'` NAO entra. Ele faz o navegador ignorar a lista de hosts e
 *  confiar so em quem foi carregado por script confiavel, e isso bloquearia as
 *  tags <script src> dos chunks do Next e o proprio gtag.js carregado por tag
 *  estatica. O ganho de segurança que importa aqui ja vem do nonce: navegador
 *  que entende nonce ignora `'unsafe-inline'`, e script inline sem o nonce da
 *  requisicao nao executa. A lista de hosts segue valendo para navegador antigo.
 *
 *  `style-src` mantem `'unsafe-inline'` de proposito: o projeto usa muitos
 *  `style={{...}}` inline, e nonce de estilo exigiria tocar dezenas de
 *  componentes sem reduzir risco proporcional. O achado que importa (execucao de
 *  script) esta coberto.
 */
function gerarNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}

function montarCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
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
}

/** Aplica o nonce e a CSP nos dois lados.
 *
 *  O Next le o nonce do cabecalho `Content-Security-Policy` da REQUISICAO para
 *  marcar os proprios scripts inline dele (o bootstrap `self.__next_f`), entao a
 *  CSP vai tambem nas request headers. O `x-nonce` fica para os componentes
 *  nossos lerem via `headers()`. */
function comNonce(request: NextRequest, resposta: NextResponse, nonce: string): NextResponse {
  const csp = montarCsp(nonce)
  request.headers.set('x-nonce', nonce)
  request.headers.set('Content-Security-Policy', csp)
  resposta.headers.set('Content-Security-Policy', csp)
  return resposta
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = gerarNonce()

  // Rotas de API nao precisam de CSP de documento; o cabecalho segue pelas
  // respostas normais do Next. Aqui so garantimos que o nonce exista para quem
  // for ler, sem passar pelo i18n.
  if (pathname.startsWith('/api/')) {
    return comNonce(request, NextResponse.next(), nonce)
  }

  // Rotas autenticadas: supabase session primeiro (sem i18n prefix)
  if (pathname.startsWith('/cadastre') || pathname.startsWith('/auth')) {
    return comNonce(request, await updateSession(request), nonce)
  }

  // Arquivos especiais do Next.js que nao devem passar pelo i18n
  // (sitemap.xml, robots.txt, etc. sao gerados em app/ na raiz)
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return comNonce(request, NextResponse.next(), nonce)
  }

  // Demais rotas: i18n middleware primeiro
  // next-intl retorna 200 com rewrite headers para o locale padrao (pt)
  // Devemos sempre retornar a resposta do intl para que o rewrite seja aplicado
  const intlResponse = intlMiddleware(request)
  if (intlResponse) return comNonce(request, intlResponse, nonce)

  // Fallback: refresh passivo da session (nao deve chegar aqui normalmente)
  return comNonce(request, await updateSession(request), nonce)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
