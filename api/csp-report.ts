// Vercel serverless endpoint (Node runtime, zero-config) para receber
// relatorios de violacao do Content-Security-Policy.
//
// Configurado em vercel.json via os headers Content-Security-Policy
// (`report-uri`) e Reporting-Endpoints/Report-To (`report-to default`).
//
// Comportamento: loga o body do relatorio em `console.log` (visivel nos
// Runtime Logs do Vercel) e retorna 204 No Content. Sem dependencia
// externa, sem persistencia. Suficiente para diagnostico inicial; se
// volume de relatorios crescer, migrar para servico dedicado (Sentry,
// report-uri.com etc).

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  // CSP Level 2 envia content-type application/csp-report;
  // Reporting API (Level 3) envia application/reports+json.
  // Em ambos os casos o body ja vem parseado pelo Vercel quando o
  // content-type for JSON-like. Caso contrario, vem como string.
  const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)

  // Limita tamanho do log para evitar abuse.
  const truncated = payload.length > 10_000 ? payload.slice(0, 10_000) + '...[truncated]' : payload

  console.log('[csp-report]', truncated)

  res.status(204).end()
}
