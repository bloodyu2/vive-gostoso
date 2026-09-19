// app/api/csp-report/route.ts
// Recebe relatorios de violacao de Content-Security-Policy (ver o directive
// `report-uri` em next.config.ts). So loga em runtime logs -- sem storage,
// sem auth (o navegador manda isso sem credenciais por padrao).
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Teto de bytes (KAN-348 / VGO-06): o corpo vem do navegador de qualquer
  // visitante e era lido/logado inteiro, sem limite. 8 KB cobre um relatorio
  // legitimo de violacao com folga.
  const TETO_BYTES = 8192

  try {
    const tipo = request.headers.get('content-type') ?? ''
    if (!tipo.includes('application/json') && !tipo.includes('application/csp-report')) {
      return new NextResponse(null, { status: 204 })
    }

    const texto = await request.text()
    if (texto.length > TETO_BYTES) {
      // Nao ecoa o corpo; so registra que veio grande demais.
      console.warn('[csp-report] corpo acima do teto, ignorado:', texto.length, 'bytes')
      return new NextResponse(null, { status: 204 })
    }

    // Trunca o que vai para o log: o relatorio pode carregar URL completa com
    // dado pessoal, e o log e mais um lugar onde ele poderia se espalhar.
    console.warn('[csp-report]', texto.slice(0, 2000))
  } catch {
    // Corpo malformado/vazio -- ignora, mas ainda confirma para o navegador
    // nao tentar de novo.
  }
  return new NextResponse(null, { status: 204 })
}
