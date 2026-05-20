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

  // Demais rotas: i18n middleware primeiro
  const intlResponse = intlMiddleware(request)
  if (intlResponse && intlResponse.status !== 200) return intlResponse

  // Depois refresh passivo da session
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
