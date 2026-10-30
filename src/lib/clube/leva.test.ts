import { describe, expect, it } from 'vitest'
import { dicionario } from '@/lib/bio/dicionario'
import { LEVA_ESTABELECIMENTOS } from './config'
import { contarEstabelecimentosNoAr, levaDoClube, textosDaLeva } from './leva'

describe('conta da 1a leva', () => {
  it('a leva e de 20 estabelecimentos', () => {
    expect(LEVA_ESTABELECIMENTOS).toBe(20)
  })

  it('7 no ar: restam 13', () => {
    expect(levaDoClube(7)).toEqual({ noAr: 7, total: 20, restantes: 13, completa: false, percentual: 35 })
  })

  it('20 no ar: leva completa, zero restante', () => {
    const l = levaDoClube(20)
    expect(l.restantes).toBe(0)
    expect(l.completa).toBe(true)
    expect(l.percentual).toBe(100)
  })

  it('mais de 20 no ar nao quebra: continua completa, sem restante negativo', () => {
    const l = levaDoClube(23)
    expect(l.restantes).toBe(0)
    expect(l.completa).toBe(true)
    expect(l.percentual).toBe(100)
    expect(l.noAr).toBe(23)
  })

  it('entrada ruim vira zero', () => {
    expect(levaDoClube(-3).restantes).toBe(20)
    expect(levaDoClube(Number.NaN).noAr).toBe(0)
  })
})

describe('contagem de estabelecimentos', () => {
  it('conta so no_ar e cada negocio uma vez', () => {
    const n = contarEstabelecimentosNoAr([
      { businessId: 'a', status: 'no_ar' },
      { businessId: 'a', status: 'no_ar' },
      { businessId: 'b', status: 'em_combinacao' },
      { businessId: 'c', status: 'no_ar' },
      { businessId: '', status: 'no_ar' },
    ])
    expect(n).toBe(2)
  })
})

describe('texto da leva nos tres idiomas', () => {
  for (const lang of ['pt', 'en', 'es'] as const) {
    const t = dicionario(lang).clube

    it(`${lang}: o numero nao esta escrito nos textos, vem da constante`, () => {
      for (const k of ['leva_titulo', 'leva_contagem', 'leva_restam', 'leva_resta', 'leva_completa', 'leva_nota'] as const) {
        expect(t[k]).not.toMatch(/\d{2,}/)
      }
    })

    it(`${lang}: 7 de 20, restam 13, e fala de estabelecimentos`, () => {
      const x = textosDaLeva(t, levaDoClube(7))
      expect(x.titulo).toContain('20')
      expect(x.contagem).toContain('7')
      expect(x.contagem).toContain('20')
      expect(x.situacao).toContain('13')
      expect(`${x.titulo} ${x.contagem} ${x.situacao}`).not.toMatch(/[{}]/)
      expect(`${x.titulo} ${x.situacao}`).toMatch(/estabelec|establec|business/i)
    })

    it(`${lang}: uma vaga so usa o singular`, () => {
      expect(textosDaLeva(t, levaDoClube(19)).situacao).toBe(t.leva_resta.replace('{restantes}', '1'))
      expect(textosDaLeva(t, levaDoClube(18)).situacao).toBe(t.leva_restam.replace('{restantes}', '2'))
      expect(t.leva_resta).not.toBe(t.leva_restam)
    })

    it(`${lang}: leva completa tem texto proprio, sem numero negativo nem NaN`, () => {
      for (const n of [20, 21, 40]) {
        const x = textosDaLeva(t, levaDoClube(n))
        expect(x.situacao).toContain('20')
        expect(x.situacao).not.toMatch(/-\d|NaN|undefined|\{/)
        expect(x.contagem).toBe('')
      }
    })

    it(`${lang}: sem travessao nem emoji`, () => {
      const todos = Object.entries(t).filter(([k]) => k.startsWith('leva_')).map(([, v]) => String(v)).join(' ')
      expect(todos).not.toMatch(/[\u2014\u2013]|[\u{1F300}-\u{1FAFF}]/u)
    })
  }
})
