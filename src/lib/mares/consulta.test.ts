import { describe, expect, it } from 'vitest'
import { buscarLinhas, fetchComCache, type ClienteMares } from './consulta'

function clienteQueDevolve(resultado: { data: unknown; error: { message: string; code?: string } | null }): ClienteMares {
  const consulta = {
    select: () => consulta,
    eq: () => consulta,
    gte: () => consulta,
    lt: () => consulta,
    order: () => Promise.resolve(resultado),
  }
  return { from: () => consulta } as unknown as ClienteMares
}

describe('leitura de gostoso_mares', () => {
  it('tabela ainda nao existe em producao: devolve vazio, sem quebrar', async () => {
    const r = await buscarLinhas(
      clienteQueDevolve({ data: null, error: { message: 'relation does not exist', code: '42P01' } }),
      'COM3DN', '2026-09-26', '2026-10-06',
    )
    expect(r).toEqual({ linhas: [], erro: true })
  })

  it('tabela vazia: devolve vazio sem erro', async () => {
    const r = await buscarLinhas(clienteQueDevolve({ data: [], error: null }), 'COM3DN', '2026-09-26', '2026-10-06')
    expect(r).toEqual({ linhas: [], erro: false })
  })

  it('sem cliente (variaveis ausentes no build): vazio', async () => {
    const r = await buscarLinhas(null, 'COM3DN', '2026-09-26', '2026-10-06')
    expect(r.linhas).toEqual([])
  })

  it('repassa as linhas lidas', async () => {
    const linha = { data_hora: '2026-09-27T13:23:00+00:00', altura_m: 0.14, tipo: 'baixa' }
    const r = await buscarLinhas(clienteQueDevolve({ data: [linha], error: null }), 'COM3DN', '2026-09-26', '2026-10-06')
    expect(r.linhas).toEqual([linha])
  })
})

describe('cache da leitura', () => {
  it('pede ao Next para guardar a resposta por 1 hora', async () => {
    const chamadas: RequestInit[] = []
    const falso = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      chamadas.push(init ?? {})
      return new Response('[]')
    }) as typeof fetch
    await fetchComCache(falso)('https://exemplo.supabase.co/rest/v1/gostoso_mares', { method: 'GET' })
    expect(chamadas[0].next).toEqual({ revalidate: 3600, tags: ['gostoso_mares'] })
    expect(chamadas[0].method).toBe('GET')
    await fetchComCache(falso, 'gostoso_blog_posts')('https://exemplo.supabase.co/rest/v1/gostoso_blog_posts')
    expect(chamadas[1].next).toEqual({ revalidate: 3600, tags: ['gostoso_blog_posts'] })
  })
})
