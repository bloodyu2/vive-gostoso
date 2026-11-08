import { describe, expect, it } from 'vitest'
import { MAXIMO_DE_NOVOS, selecionarNovos, type NegocioNovo } from './novos-em-gostoso'

function negocio(id: string, criado: string, cover: string | null = '/x.jpg'): NegocioNovo {
  return { id, name: id, slug: id, cover_url: cover, created_at: criado, is_verified: false, category: null }
}

describe('selecionarNovos', () => {
  it('ordena do cadastro mais recente para o mais antigo', () => {
    const r = selecionarNovos([negocio('a', '2026-10-01'), negocio('b', '2026-11-05'), negocio('c', '2026-10-20')])
    expect(r.map(n => n.id)).toEqual(['b', 'c', 'a'])
  })

  it('deixa de fora quem nao tem foto', () => {
    const r = selecionarNovos([negocio('a', '2026-11-05', null), negocio('b', '2026-11-04', '')])
    expect(r).toEqual([])
  })

  it('nao repete o mesmo negocio', () => {
    const r = selecionarNovos([negocio('a', '2026-11-05'), negocio('a', '2026-11-05')])
    expect(r).toHaveLength(1)
  })

  it('limita ao maximo e mantem os mais recentes', () => {
    const lista = Array.from({ length: 20 }, (_, i) => negocio(`n${i}`, `2026-10-${String(i + 1).padStart(2, '0')}`))
    const r = selecionarNovos(lista)
    expect(r).toHaveLength(MAXIMO_DE_NOVOS)
    expect(r[0].id).toBe('n19')
  })

  it('nao altera a lista recebida', () => {
    const entrada = [negocio('a', '2026-10-01'), negocio('b', '2026-11-05')]
    selecionarNovos(entrada)
    expect(entrada.map(n => n.id)).toEqual(['a', 'b'])
  })
})
