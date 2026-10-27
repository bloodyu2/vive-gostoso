// proxy.ts (era middleware.ts -- Next 16 renomeou a convencao)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { montarCsp } from '@/lib/csp'

const intlMiddleware = createMiddleware(routing)

function gerarNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
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
