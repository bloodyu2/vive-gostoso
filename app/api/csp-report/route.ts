// app/api/csp-report/route.ts
// Recebe relatorios de violacao de Content-Security-Policy (ver o directive
// `report-uri` em next.config.ts). So loga em runtime logs -- sem storage,
// sem auth (o navegador manda isso sem credenciais por padrao).
import { NextRequest, NextResponse } from 'next/server'

// Teto de bytes (KAN-348 / VGO-06): o corpo vem do navegador de qualquer
// visitante. 8 KB cobre um relatorio legitimo de violacao com folga.
const TETO_BYTES = 8192

/** Le o corpo ate o teto. Passou dele, para de ler e devolve `null`: o corpo
 *  nunca e carregado inteiro em memoria so para ser descartado depois. */
async function lerAteOTeto(request: NextRequest): Promise<string | null> {
  const leitor = request.body?.getReader()
  if (!leitor) return ''
  const partes: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await leitor.read()
    if (done) break
    total += value.byteLength
    if (total > TETO_BYTES) {
      await leitor.cancel().catch(() => undefined)
      return null
    }
    partes.push(value)
  }
  return Buffer.concat(partes).toString('utf8')
}

export async function POST(request: NextRequest) {
  try {
    const tipo = request.headers.get('content-type') ?? ''
    if (!tipo.includes('application/json') && !tipo.includes('application/csp-report')) {
      return new NextResponse(null, { status: 204 })
    }

    // Quem declara um corpo grande nao tem o corpo lido.
    const declarado = Number(request.headers.get('content-length') ?? '0')
    if (Number.isFinite(declarado) && declarado > TETO_BYTES) {
      console.warn('[csp-report] corpo acima do teto, ignorado:', declarado, 'bytes declarados')
      return new NextResponse(null, { status: 204 })
    }

    const texto = await lerAteOTeto(request)
    if (texto === null) {
      // Nao ecoa o corpo; so registra que veio grande demais.
      console.warn('[csp-report] corpo acima do teto, ignorado')
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
