import { describe, it, expect } from 'vitest'
import {
  PROFESSIONAL_CATEGORIES,
  GRUPOS_DE_CATEGORIA,
  CATEGORIA_LEGADA,
} from './professional'

describe('taxonomia do Contrate', () => {
  it('tem os dois grupos e o outro por ultimo', () => {
    expect(Object.keys(GRUPOS_DE_CATEGORIA)).toEqual(['casa', 'servicos'])
    expect(PROFESSIONAL_CATEGORIES.at(-1)).toBe('outro')
  })

  it('nao tem categoria repetida entre os grupos', () => {
    const todas = Object.values(GRUPOS_DE_CATEGORIA).flat()
    expect(todas).toHaveLength(21)
    expect(new Set(todas).size).toBe(todas.length)
  })

  it('mapeia a taxonomia antiga sem perder cadastro', () => {
    expect(CATEGORIA_LEGADA.designer).toBe('marketing-design')
    expect(CATEGORIA_LEGADA.fotografo).toBe('fotografo')
    expect(CATEGORIA_LEGADA.juridico).toBe('contabilidade-juridico')
    expect(CATEGORIA_LEGADA.educacao).toBe('aulas-particulares')
    expect(CATEGORIA_LEGADA.outro).toBe('outro')
    const destinos = Object.values(CATEGORIA_LEGADA)
    expect(destinos).toHaveLength(8)
    for (const d of destinos) expect(PROFESSIONAL_CATEGORIES).toContain(d)
  })
})
