import { describe, expect, it } from 'vitest'
import { paginasEstaticas } from '../../../scripts/paginas-sitemap.mjs'

describe('paginas fixas do sitemap', () => {
  const paginas = paginasEstaticas(process.cwd()) as Array<{ path: string; priority: string }>
  const prioridade = (p: string) => Number(paginas.find((x) => x.path === p)?.priority)

  it('tem o Explore, o mapa e a tabua de mares', () => {
    const caminhos = paginas.map((p) => p.path)
    for (const c of ['/', '/explore', '/explore/mapa', '/explore/mares']) expect(caminhos).toContain(c)
  })

  it('a tabua de mares tem a maior prioridade depois da home', () => {
    const outras = paginas.filter((p) => p.path !== '/' && p.path !== '/explore/mares')
    for (const o of outras) expect(prioridade('/explore/mares'), o.path).toBeGreaterThan(Number(o.priority))
  })

  it('nao repete caminho', () => {
    const caminhos = paginas.map((p) => p.path)
    expect(new Set(caminhos).size).toBe(caminhos.length)
  })
})

describe('a /bio fica fora do sitemap', () => {
  it('nenhuma pagina fixa e a /bio', () => {
    const caminhos = (paginasEstaticas(process.cwd()) as Array<{ path: string }>).map((p) => p.path)
    expect(caminhos.some((c) => /(^|\/)bio(\/|$)/.test(c))).toBe(false)
  })
})
