import { describe, expect, it } from 'vitest'
import { praiasCitadas } from './praias-citadas'

describe('praias citadas num post', () => {
  it('acha a praia pelo nome, sem ligar para acento nem caixa', () => {
    const r = praiasCitadas('<p>Fomos a praia do CARDEIRO e depois a Xepa.</p>')
    expect(r.map((p) => p.slug)).toEqual(['cardeiro', 'xepa'])
  })

  it('aceita o nome curto depois de "praia de/do/da"', () => {
    expect(praiasCitadas('Tourinhos no fim da tarde').map((p) => p.slug)).toEqual(['tourinhos'])
  })

  it('nao confunde palavra comum com praia', () => {
    expect(praiasCitadas('O marco da cidade e o amor pelo mar')).toEqual([])
  })

  it('texto sem praia devolve lista vazia', () => {
    expect(praiasCitadas('')).toEqual([])
  })
})
