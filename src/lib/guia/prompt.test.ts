import { describe, expect, it } from 'vitest'
import { CANARIO, SISTEMA } from './prompt'

describe('prompt do guia', () => {
  it('ensina a usar o aplicativo sem abrir mao das regras de seguranca', () => {
    expect(SISTEMA).toContain('APLICATIVO')
    expect(SISTEMA).toContain('Chamar corrida')
    expect(SISTEMA).toContain('Nao invente tela, botao, preco ou regra')
    expect(SISTEMA).toContain('SEGURANCA')
    expect(SISTEMA).toContain(CANARIO)
  })
})
