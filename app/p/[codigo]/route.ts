// app/p/[codigo]/route.ts
// Link curto das plaquinhas de avaliacao (QR e NFC). Redireciona para o destino
// definido em src/lib/plaquinhas.ts. 302 e sem cache de proposito: o destino de
// um codigo impresso pode mudar a qualquer momento.
import { NextResponse } from 'next/server'
import { destinoDaPlaquinha } from '@/lib/plaquinhas'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ codigo: string }> },
) {
  const { codigo } = await params
  const res = NextResponse.redirect(destinoDaPlaquinha(codigo), 302)
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex')
  return res
}
