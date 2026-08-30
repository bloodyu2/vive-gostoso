// proxy.ts (era middleware.ts -- Next 16 renomeou a convencao)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas de API nao passam pelo i18n nem pelo refresh de sessao do Supabase --
  // sem isso, /api/csp-report cai no intlMiddleware e o POST do navegador nunca
  // chega no Route Handler (next-intl reescreve/redireciona para /pt/api/csp-report).
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Rotas autenticadas: supabase session primeiro (sem i18n prefix)
  if (pathname.startsWith('/cadastre') || pathname.startsWith('/auth')) {
    return await updateSession(request)
  }

  // Arquivos especiais do Next.js que nao devem passar pelo i18n
  // (sitemap.xml, robots.txt, etc. sao gerados em app/ na raiz)
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next()
  }

  // Demais rotas: i18n middleware primeiro
  // next-intl retorna 200 com rewrite headers para o locale padrao (pt)
  // Devemos sempre retornar a resposta do intl para que o rewrite seja aplicado
  const intlResponse = intlMiddleware(request)
  if (intlResponse) return intlResponse

  // Fallback: refresh passivo da session (nao deve chegar aqui normalmente)
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
