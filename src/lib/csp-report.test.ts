import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/csp-report/route'

function pedido(corpo: string, cabecalhos: Record<string, string> = {}): NextRequest {
  return new NextRequest('https://www.vivegostoso.com.br/api/csp-report', {
    method: 'POST',
    headers: { 'content-type': 'application/csp-report', ...cabecalhos },
    body: corpo,
  })
}

describe('POST /api/csp-report', () => {
  let aviso: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    aviso.mockRestore()
  })

  it('relatorio pequeno responde 204 e vai para o log, truncado', async () => {
    const r = await POST(pedido(JSON.stringify({ 'csp-report': { 'blocked-uri': 'inline' } })))
    expect(r.status).toBe(204)
    expect(aviso).toHaveBeenCalledTimes(1)
  })

  it('corpo declarado acima do teto responde 204 sem ler o corpo', async () => {
    const req = pedido('x', { 'content-length': '5000000' })
    const ler = vi.spyOn(req, 'text')
    const r = await POST(req)
    expect(r.status).toBe(204)
    expect(ler).not.toHaveBeenCalled()
  })

  it('corpo real acima do teto, mesmo sem content-length, nao vai para o log', async () => {
    const r = await POST(pedido('a'.repeat(20_000)))
    expect(r.status).toBe(204)
    const registrado = aviso.mock.calls.map((c: unknown[]) => String(c[1] ?? '')).join('')
    expect(registrado).not.toContain('aaaa')
  })

  it('tipo de conteudo estranho e ignorado', async () => {
    const req = new NextRequest('https://www.vivegostoso.com.br/api/csp-report', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'oi',
    })
    const r = await POST(req)
    expect(r.status).toBe(204)
    expect(aviso).not.toHaveBeenCalled()
  })
})
