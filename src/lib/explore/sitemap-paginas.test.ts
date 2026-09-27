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
