import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { ABAS_DO_MENU, ITENS_VITRINE, textosVitrine } from './vitrine'
import { PRAIAS_MARES } from '@/data/praias-mares'

describe('vitrine de recursos da home', () => {
  it('tem um cartao por aba do menu', () => {
    const caminhos = ITENS_VITRINE.map((i) => i.caminho)
    for (const aba of ABAS_DO_MENU) expect(caminhos, aba).toContain(`/${aba}`)
  })

  it('cada aba do menu existe como rota em app/[lang]', () => {
    for (const aba of ABAS_DO_MENU) expect(existsSync(resolve('app/[lang]', aba, 'page.tsx')), aba).toBe(true)
  })

  it('tem a tabua de mares em destaque, transfer, eventos e blog', () => {
    const mares = ITENS_VITRINE.find((i) => i.id === 'mares')
    expect(mares?.caminho).toBe('/explore/mares')
    expect(mares?.destaque).toBe(true)
    const caminhos = ITENS_VITRINE.map((i) => i.caminho)
    for (const c of ['/transfer', '/participe', '/blog']) expect(caminhos).toContain(c)
  })

  it('todo cartao aponta para uma rota que existe', () => {
    for (const i of ITENS_VITRINE) expect(existsSync(resolve('app/[lang]', `.${i.caminho}`, 'page.tsx')), i.caminho).toBe(true)
  })

  it('titulo e linha em pt, en e es, sem travessao', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      const t = textosVitrine(lang)
      expect(t.titulo.length).toBeGreaterThan(3)
      for (const i of ITENS_VITRINE) {
        const item = t.itens[i.id]
        expect(item.titulo.length, `${lang} ${i.id}`).toBeGreaterThan(2)
        expect(item.linha.length, `${lang} ${i.id}`).toBeGreaterThan(10)
        expect(item.linha).not.toContain('—')
      }
    }
  })

  it('o numero de praias da linha das mares e o numero real da tabua', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      const linha = textosVitrine(lang).itens.mares.linha
      expect(linha).toContain(String(PRAIAS_MARES.length))
      expect(linha).not.toContain('{n}')
    }
  })
})
