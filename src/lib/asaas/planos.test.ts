import { describe, it, expect } from 'vitest'
import { CHAVES } from '@/lib/parametros'
import { ehCobranca, ehPlano, valorDoPlano } from './planos'

/** Os mesmos valores que o painel mostra, vindos de gostoso_parametros_produto. */
const PARAMETROS = {
  [CHAVES.planoAssociado]: 3990,
  [CHAVES.planoDestaque]: 5990,
  [CHAVES.descontoAnual]: 10,
}

describe('valorDoPlano', () => {
  /* Os quatro numeros sao os mesmos que os price IDs do Stripe cobram
     (src/hooks/useCheckout.ts). Se um dia divergirem, o cliente pagaria um valor
     no Asaas e o painel mostraria outro. */
  it('mensal devolve o parametro do banco, sem transformacao', () => {
    expect(valorDoPlano(PARAMETROS, 'associado', 'monthly')).toBe(3990)
    expect(valorDoPlano(PARAMETROS, 'destaque', 'monthly')).toBe(5990)
  })

  it('anual e o mensal x12 com o desconto do banco', () => {
    expect(valorDoPlano(PARAMETROS, 'associado', 'annual')).toBe(43092)
    expect(valorDoPlano(PARAMETROS, 'destaque', 'annual')).toBe(64692)
  })

  it('o anual e sempre menor que doze mensais', () => {
    for (const plano of ['associado', 'destaque'] as const) {
      expect(valorDoPlano(PARAMETROS, plano, 'annual')!).toBeLessThan(
        valorDoPlano(PARAMETROS, plano, 'monthly')! * 12
      )
    }
  })

  /* A regra do repo e nao inventar preco: parametro ausente devolve null, e a
     rota responde 503 caindo no Stripe, em vez de cobrar um valor chutado. */
  it('devolve null quando o parametro do plano nao veio', () => {
    expect(valorDoPlano(undefined, 'associado', 'monthly')).toBe(null)
    expect(valorDoPlano({}, 'associado', 'monthly')).toBe(null)
    expect(valorDoPlano({ [CHAVES.planoDestaque]: 5990 }, 'associado', 'monthly')).toBe(null)
  })

  it('devolve null no anual quando falta o desconto', () => {
    const semDesconto = { [CHAVES.planoAssociado]: 3990 }
    expect(valorDoPlano(semDesconto, 'associado', 'annual')).toBe(null)
    // Mensal continua valendo: o desconto so e necessario para o anual.
    expect(valorDoPlano(semDesconto, 'associado', 'monthly')).toBe(3990)
  })

  it('desconto zero devolve doze mensais', () => {
    const semDesconto = { [CHAVES.planoAssociado]: 3990, [CHAVES.descontoAnual]: 0 }
    expect(valorDoPlano(semDesconto, 'associado', 'annual')).toBe(47880)
  })
})

describe('guarda de tipo', () => {
  it('ehPlano so aceita os dois planos', () => {
    expect(ehPlano('associado')).toBe(true)
    expect(ehPlano('destaque')).toBe(true)
    expect(ehPlano('ouro')).toBe(false)
    expect(ehPlano(undefined)).toBe(false)
    expect(ehPlano(null)).toBe(false)
  })

  it('ehCobranca so aceita as duas cobrancas', () => {
    expect(ehCobranca('monthly')).toBe(true)
    expect(ehCobranca('annual')).toBe(true)
    expect(ehCobranca('semanal')).toBe(false)
    expect(ehCobranca('')).toBe(false)
  })
})
