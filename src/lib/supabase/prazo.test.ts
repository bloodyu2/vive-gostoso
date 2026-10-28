import { describe, it, expect, vi } from 'vitest'
import { fetchComPrazo } from './prazo'

type Chamada = (url: RequestInfo | URL, init?: RequestInit) => Promise<Response>

describe('fetchComPrazo', () => {
  it('GET que falha na rede ganha uma segunda tentativa', async () => {
    const base = vi.fn<Chamada>()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(new Response('[]'))
    const r = await fetchComPrazo(base as unknown as typeof fetch)('https://x.supabase.co/rest/v1/t')
    expect(await r.text()).toBe('[]')
    expect(base).toHaveBeenCalledTimes(2)
  })

  it('so tenta duas vezes: a segunda falha sobe', async () => {
    const base = vi.fn<Chamada>().mockRejectedValue(new TypeError('fetch failed'))
    await expect(fetchComPrazo(base as unknown as typeof fetch)('https://x.supabase.co/rest/v1/t')).rejects.toThrow('fetch failed')
    expect(base).toHaveBeenCalledTimes(2)
  })

  it('cada tentativa leva um sinal de prazo', async () => {
    const base = vi.fn<Chamada>(async () => new Response('[]'))
    await fetchComPrazo(base as unknown as typeof fetch)('https://x.supabase.co/rest/v1/t')
    expect(base.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
  })

  it('gravacao nao e repetida nem recebe prazo', async () => {
    const base = vi.fn<Chamada>().mockRejectedValue(new TypeError('fetch failed'))
    await expect(fetchComPrazo(base as unknown as typeof fetch)('https://x.supabase.co/rest/v1/t', { method: 'POST' })).rejects.toThrow()
    expect(base).toHaveBeenCalledTimes(1)
    expect(base.mock.calls[0][1]?.signal).toBeUndefined()
  })

  it('se quem chamou ja cancelou, nao tenta de novo', async () => {
    const ctl = new AbortController()
    ctl.abort()
    const base = vi.fn<Chamada>().mockRejectedValue(new DOMException('aborted', 'AbortError'))
    await expect(fetchComPrazo(base as unknown as typeof fetch)('https://x.supabase.co/rest/v1/t', { signal: ctl.signal })).rejects.toThrow()
    expect(base).toHaveBeenCalledTimes(1)
  })
})
