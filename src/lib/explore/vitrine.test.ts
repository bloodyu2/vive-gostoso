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

  it('a frase dos cartoes pequenos cabe em duas linhas (ate 48 caracteres, com n de 3 digitos)', () => {
    const cheio = { come: 148, fique: 148, passeie: 148, participe: 148 }
    for (const lang of ['pt', 'en', 'es'] as const) {
      for (const contagens of [{}, cheio]) {
        const t = textosVitrine(lang, contagens)
        for (const i of ITENS_VITRINE.filter((x) => !x.destaque)) {
          expect(t.itens[i.id].linha.length, `${lang} ${i.id}: ${t.itens[i.id].linha}`).toBeLessThanOrEqual(48)
        }
      }
    }
  })

  it('titulo e linha em pt, en e es, sem travessao', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      const t = textosVitrine(lang)
      expect(t.titulo.length).toBeGreaterThan(3)
      for (const i of ITENS_VITRINE) {
        const item = t.itens[i.id]
        expect(item.titulo.length, `${lang} ${i.id}`).toBeGreaterThan(2)
        expect(item.linha.length, `${lang} ${i.id}`).toBeGreaterThan(10)
        expect(item.linha).not.toContain(String.fromCharCode(0x2014))
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

  it('todo item tem caminho e botao em pt, en e es', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      const t = textosVitrine(lang)
      for (const i of ITENS_VITRINE) {
        expect(i.caminho.startsWith('/'), i.id).toBe(true)
        expect(t.itens[i.id].botao.trim().length, `${lang} ${i.id}`).toBeGreaterThan(2)
      }
    }
  })

  it('nenhum texto da vitrine tem travessao', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      const bruto = JSON.stringify(textosVitrine(lang, { come: 12, fique: 30, passeie: 9, participe: 4 }))
      expect(bruto).not.toContain(String.fromCharCode(0x2014))
      expect(bruto).not.toContain(String.fromCharCode(0x2013))
    }
  })

  it('com contagem, a frase traz o numero; sem contagem, nao sobra {n}', () => {
    for (const lang of ['pt', 'en', 'es'] as const) {
      const com = textosVitrine(lang, { come: 12, fique: 30, passeie: 9, participe: 4 })
      expect(com.itens.come.linha, lang).toContain('12')
      expect(com.itens.fique.linha, lang).toContain('30')
      expect(com.itens.passeie.linha, lang).toContain('9')
      expect(com.itens.participe.linha, lang).toContain('4')
      const sem = textosVitrine(lang, { come: null, fique: null, passeie: null, participe: null })
      const semNada = textosVitrine(lang)
      for (const t of [sem, semNada]) {
        for (const i of ITENS_VITRINE) expect(t.itens[i.id].linha, `${lang} ${i.id}`).not.toContain('{n}')
      }
      expect(sem.itens.come.linha).toBe(semNada.itens.come.linha)
    }
  })

  it('contagem 0 ou 1 usa a frase sem numero', () => {
    const t = textosVitrine('pt', { come: 0, fique: 1 })
    expect(t.itens.come.linha).toBe(textosVitrine('pt').itens.come.linha)
    expect(t.itens.fique.linha).toBe(textosVitrine('pt').itens.fique.linha)
  })

  it('cada item tem imagem local que existe ou fica com o icone', () => {
    for (const i of ITENS_VITRINE) {
      if (i.imagem) expect(existsSync(resolve('public', `.${i.imagem}`)), i.imagem).toBe(true)
    }
  })
})
