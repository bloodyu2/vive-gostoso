// app/api/csp-report/route.ts
// Recebe relatorios de violacao de Content-Security-Policy (ver o directive
// `report-uri` em next.config.ts). So loga em runtime logs -- sem storage,
// sem auth (o navegador manda isso sem credenciais por padrao).
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    console.warn('[csp-report]', JSON.stringify(report))
  } catch {
    // Corpo malformado/vazio -- ignora, mas ainda confirma para o navegador
    // nao tentar de novo.
  }
  return new NextResponse(null, { status: 204 })
}
