import { describe, expect, it } from 'vitest'
import { guardarCupom, lerCupons } from './cupons-locais'

function memoria(inicial?: string) {
  let v: string | null = inicial ?? null
  return {
    getItem: () => v,
    setItem: (_k: string, x: string) => {
      v = x
    },
    raw: () => v,
  }
}
const T1 = 'a1'.repeat(32)
const T2 = 'b2'.repeat(32)

describe('cupons guardados no aparelho', () => {
  it('guarda um cupom por parceiro e lê de volta', () => {
    const m = memoria()
    guardarCupom(m, 'p1', T1)
    guardarCupom(m, 'p2', T2)
    expect(lerCupons(m)).toEqual({ p1: T1, p2: T2 })
  })
  it('um resgate novo no mesmo parceiro troca o cupom', () => {
    const m = memoria()
    guardarCupom(m, 'p1', T1)
    guardarCupom(m, 'p1', T2)
    expect(lerCupons(m)).toEqual({ p1: T2 })
  })
  it('dado torto no armazenamento é ignorado, e token que não é token também', () => {
    expect(lerCupons(memoria('não é json'))).toEqual({})
    expect(lerCupons(memoria(JSON.stringify({ p1: 'curto', p2: T2, p3: 5 })))).toEqual({ p2: T2 })
    expect(lerCupons(memoria(JSON.stringify([1, 2])))).toEqual({})
  })
  it('sem armazenamento (modo privado) não quebra', () => {
    expect(lerCupons(null)).toEqual({})
    expect(() => guardarCupom(null, 'p1', T1)).not.toThrow()
    const quebrado = {
      getItem: () => {
        throw new Error('bloqueado')
      },
      setItem: () => {
        throw new Error('bloqueado')
      },
    }
    expect(lerCupons(quebrado)).toEqual({})
    expect(() => guardarCupom(quebrado, 'p1', T1)).not.toThrow()
  })
})
