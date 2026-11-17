import { describe, expect, it } from 'vitest'
import { lerDecisao, lerFila, motivoValido } from './analise'

describe('lerFila', () => {
  it('le uma linha completa', () => {
    const fila = lerFila([
      {
        partner_id: 'p1', business_id: 'b1', nome: 'Cafe Damy', slug: 'damy', beneficio: 'Um cafezinho.',
        regra: 'Vale na compra de um prato.', limite_mensal: 20, valido_ate: '2027-01-31',
        enviado_em: '2026-11-17T20:00:00Z', ja_aprovada_antes: true, ultimo_motivo: null,
      },
    ])
    expect(fila).toEqual([
      {
        partnerId: 'p1', businessId: 'b1', nome: 'Cafe Damy', slug: 'damy', beneficio: 'Um cafezinho.',
        regra: 'Vale na compra de um prato.', limiteMensal: 20, validoAte: '2027-01-31',
        enviadoEm: '2026-11-17T20:00:00Z', jaAprovadaAntes: true, ultimoMotivo: null,
      },
    ])
  })

  it('descarta linha sem id, nome ou beneficio e entrada que nao e lista', () => {
    expect(lerFila(null)).toEqual([])
    expect(lerFila({})).toEqual([])
    expect(lerFila([null, 3, { nome: 'X', beneficio: 'Y' }, { partner_id: 'p', beneficio: 'Y' }, { partner_id: 'p', nome: 'X' }])).toEqual([])
  })

  it('campos opcionais ausentes viram nulo e falso', () => {
    const [l] = lerFila([{ partner_id: 'p', nome: 'X', beneficio: 'Y' }])
    expect(l).toMatchObject({ regra: null, limiteMensal: null, validoAte: null, jaAprovadaAntes: false, ultimoMotivo: null })
  })
})

describe('motivoValido', () => {
  it('exige de 5 a 300 letras sem contar os espacos das pontas', () => {
    expect(motivoValido('')).toBe(false)
    expect(motivoValido('  abc  ')).toBe(false)
    expect(motivoValido('abcde')).toBe(true)
    expect(motivoValido(' '.repeat(10) + 'abcde')).toBe(true)
    expect(motivoValido('a'.repeat(300))).toBe(true)
    expect(motivoValido('a'.repeat(301))).toBe(false)
  })
})

describe('lerDecisao', () => {
  it('le aprovada e recusada', () => {
    expect(lerDecisao({ ok: true, status: 'no_ar' })).toEqual({ ok: true, status: 'no_ar' })
    expect(lerDecisao({ ok: true, status: 'rejeitado' })).toEqual({ ok: true, status: 'rejeitado' })
  })

  it('le os motivos de falha do banco', () => {
    expect(lerDecisao({ ok: false, motivo: 'motivo_obrigatorio' })).toEqual({ ok: false, motivo: 'motivo_obrigatorio' })
    expect(lerDecisao({ ok: false, motivo: 'nao_esta_em_analise', status: 'no_ar' })).toEqual({ ok: false, motivo: 'nao_esta_em_analise' })
    expect(lerDecisao({ ok: false, motivo: 'nao_encontrado' })).toEqual({ ok: false, motivo: 'nao_encontrado' })
  })

  it('resposta torta nunca vira sucesso', () => {
    expect(lerDecisao(null)).toEqual({ ok: false, motivo: 'desconhecido' })
    expect(lerDecisao({ ok: true })).toEqual({ ok: false, motivo: 'desconhecido' })
    expect(lerDecisao({ ok: true, status: 'pausado' })).toEqual({ ok: false, motivo: 'desconhecido' })
    expect(lerDecisao({ ok: false, motivo: 'outra' })).toEqual({ ok: false, motivo: 'desconhecido' })
  })
})
