import { describe, it, expect } from 'vitest'
import {
  CHAVES, indexarParametros, precoEmReais, precoAnualCentavos, parametro, precosDoPlano,
} from './parametros'

describe('parametros do produto', () => {
  it('indexa por chave, com valor numerico', () => {
    const p = indexarParametros([
      { chave: CHAVES.planoAssociado, valor: 3990, unidade: 'centavos' },
      { chave: CHAVES.rateioCidade, valor: 80, unidade: 'percentual' },
    ])
    expect(p[CHAVES.planoAssociado]).toBe(3990)
    expect(p[CHAVES.rateioCidade]).toBe(80)
  })

  it('preco em reais formata como a pagina mostra', () => {
    expect(precoEmReais(3990).replace(/\u00a0/g, ' ')).toBe('R$ 39,90')
    expect(precoEmReais(0).replace(/\u00a0/g, ' ')).toBe('R$ 0,00')
  })

  it('o anual e calculado, nunca guardado', () => {
    /* 39,90 x 12 = 478,80; menos 10% = 430,92. E o numero que o painel ja
       mostrava, agora derivado em vez de escrito a mao. */
    expect(precoAnualCentavos(3990, 10)).toBe(43092)
    expect(precoAnualCentavos(5990, 10)).toBe(64692)
    expect(precoAnualCentavos(3990, 0)).toBe(47880)
  })

  it('parametro ausente devolve undefined, nunca um numero inventado', () => {
    /* Se isto devolvesse 0 ou um padrao, a pagina publicaria um preco falso
       exatamente quando perdeu a capacidade de saber o certo. */
    expect(parametro(undefined, CHAVES.planoAssociado)).toBeUndefined()
    expect(parametro({}, CHAVES.planoAssociado)).toBeUndefined()
    expect(parametro({ outra: 1 }, CHAVES.planoAssociado)).toBeUndefined()
    expect(parametro({ [CHAVES.planoAssociado]: 0 }, CHAVES.planoAssociado)).toBe(0)
  })
})

describe('precosDoPlano, os quatro precos do painel de assinatura', () => {
  const fonte = {
    [CHAVES.planoAssociado]: 3990,
    [CHAVES.planoDestaque]: 5990,
    [CHAVES.descontoAnual]: 10,
  }

  it('deriva os quatro da mesma fonte', () => {
    const p = precosDoPlano(fonte)
    expect(p.monthly.associado?.replace(/\u00a0/g, ' ')).toBe('R$ 39,90/mês')
    expect(p.monthly.destaque?.replace(/\u00a0/g, ' ')).toBe('R$ 59,90/mês')
    expect(p.annual.associado?.replace(/\u00a0/g, ' ')).toBe('R$ 430,92/ano')
    expect(p.annual.destaque?.replace(/\u00a0/g, ' ')).toBe('R$ 646,92/ano')
  })

  it('mudar a fonte muda os quatro juntos', () => {
    /* E a prova que o Victor pediu, em teste: um valor novo na fonte tem que
       aparecer no mensal E no anual, sem ninguem editar mais nada. */
    const p = precosDoPlano({ ...fonte, [CHAVES.planoAssociado]: 12345 })
    expect(p.monthly.associado).toContain('123,45')
    expect(p.annual.associado).toContain('1.333,26')
  })

  it('sem a fonte, nao inventa preco', () => {
    const p = precosDoPlano(undefined)
    expect(p.monthly.associado).toBeNull()
    expect(p.annual.destaque).toBeNull()
  })
})
