import { describe, it, expect } from 'vitest'
import { mediaAvaliacoes } from './media-avaliacoes'

describe('mediaAvaliacoes', () => {
  it('calcula a media pela soma e quantidade reais', () => {
    expect(mediaAvaliacoes(24, 5)).toBeCloseTo(4.8)
  })

  it('nao divide por zero nem devolve NaN quando nao ha avaliacao', () => {
    expect(mediaAvaliacoes(0, 0)).toBe(0)
    expect(mediaAvaliacoes(10, 0)).toBe(0)
  })

  it('ignora valores nao finitos', () => {
    expect(mediaAvaliacoes(Number.NaN, 3)).toBe(0)
    expect(mediaAvaliacoes(9, Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('nao usa a media da pagina: a mesma soma com quantidade maior da media menor', () => {
    // 5 notas 5.0 numa pagina nao podem virar a media do negocio.
    const soDaPagina = mediaAvaliacoes(25, 5)
    const real = mediaAvaliacoes(120, 25)
    expect(soDaPagina).toBeCloseTo(5)
    expect(real).toBeCloseTo(4.8)
    expect(real).not.toBeCloseTo(soDaPagina)
  })
})
