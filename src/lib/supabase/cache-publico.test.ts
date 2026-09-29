import { describe, it, expect, vi } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fetchDaVitrine, TAG_VITRINE, SEGUNDOS_VITRINE } from './publico'
import { deveAvisar, fetchQueAvisa } from './avisar-gravacao'
import { revalidarSeLogado, TAGS_REVALIDADAS } from './revalidar'

// KAN-463: leitura publica em cache de dados, limpa quando alguem logado grava.

describe('fetchDaVitrine', () => {
  it('guarda a resposta por 5 min com a tag da vitrine e mantem o resto do init', async () => {
    const base = vi.fn(async () => new Response('[]'))
    await fetchDaVitrine(base as unknown as typeof fetch)('https://x.supabase.co/rest/v1/t', { headers: { a: '1' } })
    const init = base.mock.calls[0][1] as RequestInit & { next: { revalidate: number; tags: string[] } }
    expect(init.next).toEqual({ revalidate: SEGUNDOS_VITRINE, tags: [TAG_VITRINE] })
    expect(SEGUNDOS_VITRINE).toBe(300)
    expect(init.headers).toEqual({ a: '1' })
  })
})

describe('deveAvisar', () => {
  const rest = 'https://wppsmvgbagalczoardfl.supabase.co/rest/v1/gostoso_businesses?id=eq.1'
  it('gravacao bem-sucedida de quem esta logado avisa', () => {
    for (const m of ['POST', 'PATCH', 'PUT', 'DELETE']) expect(deveAvisar(rest, m, true, true)).toBe(true)
  })
  it('RPC que grava (aprovar reivindicacao) avisa', () => {
    expect(deveAvisar('https://x.supabase.co/rest/v1/rpc/gostoso_approve_claim', 'POST', true, true)).toBe(true)
  })
  it('leitura, erro, anonimo e fora do REST nao avisam', () => {
    expect(deveAvisar(rest, 'GET', true, true)).toBe(false)
    expect(deveAvisar(rest, 'HEAD', true, true)).toBe(false)
    expect(deveAvisar(rest, 'PATCH', false, true)).toBe(false)
    expect(deveAvisar(rest, 'POST', true, false)).toBe(false)
    expect(deveAvisar('https://x.supabase.co/auth/v1/token', 'POST', true, true)).toBe(false)
    expect(deveAvisar('https://x.supabase.co/storage/v1/object/a', 'POST', true, true)).toBe(false)
  })
})

describe('fetchQueAvisa', () => {
  it('devolve a resposta original e avisa depois de gravar', async () => {
    const resposta = new Response('{}', { status: 201 })
    const base = vi.fn(async () => resposta)
    const avisar = vi.fn()
    const f = fetchQueAvisa(base as unknown as typeof fetch, avisar, () => true)
    const r = await f('https://x.supabase.co/rest/v1/gostoso_businesses', { method: 'PATCH' })
    expect(r).toBe(resposta)
    expect(avisar).toHaveBeenCalledTimes(1)
  })
  it('nao avisa em leitura nem sem sessao', async () => {
    const base = vi.fn(async () => new Response('[]'))
    const avisar = vi.fn()
    await fetchQueAvisa(base as unknown as typeof fetch, avisar, () => true)('https://x.supabase.co/rest/v1/t')
    await fetchQueAvisa(base as unknown as typeof fetch, avisar, () => false)('https://x.supabase.co/rest/v1/t', { method: 'POST' })
    expect(avisar).not.toHaveBeenCalled()
  })
  it('entende Request como entrada', async () => {
    const base = vi.fn(async () => new Response('{}'))
    const avisar = vi.fn()
    await fetchQueAvisa(base as unknown as typeof fetch, avisar, () => true)(new Request('https://x.supabase.co/rest/v1/t', { method: 'DELETE' }))
    expect(avisar).toHaveBeenCalledTimes(1)
  })
})

describe('revalidarSeLogado', () => {
  it('sem sessao devolve 401 e nao limpa nada', async () => {
    const limpar = vi.fn()
    const r = await revalidarSeLogado(async () => null, limpar)
    expect(r.status).toBe(401)
    expect(limpar).not.toHaveBeenCalled()
  })
  it('com sessao limpa a vitrine e as contagens', async () => {
    const limpar = vi.fn()
    const r = await revalidarSeLogado(async () => ({ id: 'u1' }), limpar)
    expect(r.status).toBe(200)
    expect(TAGS_REVALIDADAS).toEqual([TAG_VITRINE, 'gostoso_businesses'])
    expect(limpar.mock.calls.map((c) => c[0])).toEqual(TAGS_REVALIDADAS)
  })
})

describe('paginas publicas nao leem cookie do Supabase', () => {
  // O cliente com cookies (lib/supabase/server) faria a leitura depender de quem
  // esta logado e nao passaria pelo cache. Area restrita e rotas de auth podem.
  function arquivos(dir: string): string[] {
    return readdirSync(dir).flatMap((n) => {
      const p = join(dir, n)
      return statSync(p).isDirectory() ? arquivos(p) : /\.(ts|tsx)$/.test(n) ? [p] : []
    })
  }
  const raiz = join(__dirname, '..', '..', '..')
  const publicos = [
    ...arquivos(join(raiz, 'app', '[lang]')),
    join(raiz, 'src', 'lib', 'supabase', 'queries.ts'),
    join(raiz, 'src', 'lib', 'supabase', 'build-queries.ts'),
  ]
  it.each(publicos.map((p) => [p.slice(raiz.length + 1)]))('%s', (rel) => {
    const fonte = readFileSync(join(raiz, rel), 'utf8')
    expect(fonte).not.toMatch(/from ['"]@\/lib\/supabase\/server['"]/)
    expect(fonte).not.toMatch(/next\/headers/)
  })
})
