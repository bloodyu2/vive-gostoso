// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
