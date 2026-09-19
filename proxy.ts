// proxy.ts (era middleware.ts -- Next 16 renomeou a convencao)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const SUPABASE_ORIGIN = 'https://wppsmvgbagalczoardfl.supabase.co'
// Varias capas de negocio ainda apontam para o Unsplash (fotos de exemplo
// cadastradas no banco). A CSP precisa listar esses hosts, senao o navegador
// bloqueia as imagens em silencio: 5 das 8 <img> da home ficavam com
// naturalWidth 0 mesmo com as URLs respondendo 200 e JPEG valido.
const UNSPLASH_ORIGINS = 'https://images.unsplash.com https://plus.unsplash.com'
const SUPABASE_WS_ORIGIN = 'wss://wppsmvgbagalczoardfl.supabase.co'

/** Nonce por requisicao, para a CSP (KAN-347 / VGO-09).
 *
 *  Antes, o `script-src` tinha `'unsafe-inline'`, que e exatamente o que permite
 *  injecao de script inline. Com nonce, o navegador so executa script inline que
 *  carregue o valor sorteado nesta requisicao.
 *
 *  Medido em 2026-09-19, antes de escrever isto:
 *  - o site inteiro ja renderiza por requisicao (todas as paginas usam `cookies()`
 *    via `createClient`, e as respostas vinham com `x-vercel-cache: MISS` e
 *    `cache-control: private, no-store`). Nonce nao invalida cache estatico
 *    nenhum, porque nao ha cache estatico a perder.
 *  - o HTML servido tem 3 scripts inline executaveis (anti-FOUC do tema,
 *    `consent default` do GTM e `gtag('config')`) mais os blocos
 *    `application/ld+json`, que nao executam mas levam nonce por consistencia.
 *
 *  `'strict-dynamic'` entra junto. Ele faz o navegador confiar em quem foi
 *  carregado por script ja confiavel, o que e o que permite o Next carregar os
 *  chunks dele e o GTM injetar as tags em tempo de execucao. Sem ele, esses
 *  scripts seriam bloqueados. O host do googletagmanager fica na lista como
 *  fallback para navegador antigo, que ignora nonce e strict-dynamic: e o desenho
 *  em camadas recomendado.
 *
 *  `style-src` mantem `'unsafe-inline'` de proposito: o projeto usa muitos
 *  `style={{...}}` inline e nonce de estilo exigiria tocar dezenas de componentes
 *  sem reduzir risco na mesma proporcao. O achado VGO-09 e sobre execucao de
 *  script, e esse esta coberto.
 */
function gerarNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}

function montarCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com`,
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

/** A CSP precisa estar nos DOIS lados, e a ordem importa.
 *
 *  No lado da REQUISICAO: o Next le o nonce do cabecalho
 *  `Content-Security-Policy` da requisicao para marcar os scripts inline dele
 *  (o bootstrap `self.__next_f` e as tags dos chunks). Sem isso, esses scripts
 *  saem sem nonce e a CSP de resposta os bloqueia, o que derruba a hidratacao
 *  do site inteiro.
 *
 *  No lado da RESPOSTA: e o cabecalho que o navegador de fato aplica.
 *
 *  E o cabecalho tem que estar na requisicao ANTES de chamar o next-intl: ele
 *  monta um `new Headers(request.headers)` proprio para o rewrite, e so copia o
 *  que ja estiver la. Setar depois faz o nonce sumir sem erro nenhum. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = gerarNonce()
  const csp = montarCsp(nonce)

  // Antes de qualquer middleware: o next-intl copia estes headers no rewrite.
  request.headers.set('x-nonce', nonce)
  request.headers.set('Content-Security-Policy', csp)

  let resposta: NextResponse

  // Rotas de API nao passam pelo i18n nem pelo refresh de sessao do Supabase --
  // sem isso, /api/csp-report cai no intlMiddleware e o POST do navegador nunca
  // chega no Route Handler (next-intl reescreve/redireciona para /pt/api/csp-report).
  if (pathname.startsWith('/api/')) {
    resposta = NextResponse.next({ request: { headers: request.headers } })
  } else if (pathname.startsWith('/cadastre') || pathname.startsWith('/auth')) {
    // Rotas autenticadas: supabase session primeiro (sem i18n prefix)
    resposta = await updateSession(request)
  } else if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    // Arquivos especiais do Next.js que nao devem passar pelo i18n
    resposta = NextResponse.next({ request: { headers: request.headers } })
  } else {
    // Demais rotas: i18n middleware primeiro. next-intl retorna 200 com rewrite
    // headers para o locale padrao (pt), entao devolvemos sempre a resposta dele
    // para o rewrite ser aplicado.
    resposta = intlMiddleware(request) ?? (await updateSession(request))
  }

  resposta.headers.set('Content-Security-Policy', csp)
  return resposta
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
