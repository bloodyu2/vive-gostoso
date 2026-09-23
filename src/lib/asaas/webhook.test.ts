import { describe, it, expect } from 'vitest'
import {
  lerReferencia,
  montarReferenciaDoacao,
  montarReferenciaPlano,
  parseWebhookPayload,
  traduzirEvento,
  validateWebhookToken,
} from './webhook'

describe('validateWebhookToken', () => {
  it('aceita quando o header bate com o token configurado', () => {
    expect(validateWebhookToken('token-combinado', 'token-combinado')).toBe(true)
  })

  it('recusa token diferente, vazio ou ausente', () => {
    expect(validateWebhookToken('errado', 'token-combinado')).toBe(false)
    expect(validateWebhookToken('', 'token-combinado')).toBe(false)
    expect(validateWebhookToken(null, 'token-combinado')).toBe(false)
  })

  /* Falha fechado: sem a variavel do nosso lado, nada passa. Se isto virar
     `true`, uma env ausente em producao transforma o webhook em porta aberta
     para qualquer um ativar plano. */
  it('recusa quando o token esperado nao esta configurado', () => {
    expect(validateWebhookToken('qualquer', undefined)).toBe(false)
    expect(validateWebhookToken('qualquer', '')).toBe(false)
  })

  it('nao aceita token de tamanho diferente (a comparacao e timing-safe)', () => {
    expect(validateWebhookToken('curto', 'token-combinado')).toBe(false)
    expect(validateWebhookToken('token-combinado-maior', 'token-combinado')).toBe(false)
  })
})

describe('traduzirEvento', () => {
  it('mapeia os eventos de pagamento que importam', () => {
    expect(traduzirEvento('PAYMENT_CONFIRMED')).toBe('confirmado')
    expect(traduzirEvento('PAYMENT_RECEIVED')).toBe('confirmado')
    expect(traduzirEvento('PAYMENT_OVERDUE')).toBe('vencido')
    expect(traduzirEvento('PAYMENT_REFUNDED')).toBe('estornado')
    expect(traduzirEvento('PAYMENT_DECLINED')).toBe('falhou')
  })

  /* Evento fora do escopo tem que devolver null, e nao um status qualquer: e
     esse null que faz o handler reconhecer com 200 e ignorar, em vez de marcar
     uma cobranca como vencida por um evento que nao diz isso. */
  it('devolve null para evento fora do escopo', () => {
    expect(traduzirEvento('PAYMENT_CREATED')).toBe(null)
    expect(traduzirEvento('PAYMENT_UPDATED')).toBe(null)
    expect(traduzirEvento('')).toBe(null)
  })
})

describe('parseWebhookPayload', () => {
  const base = {
    id: 'evt_1',
    event: 'PAYMENT_CONFIRMED',
    payment: { id: 'pay_1', status: 'CONFIRMED' },
  }

  it('aceita o payload minimo e normaliza os campos ausentes', () => {
    const p = parseWebhookPayload(base)
    expect(p?.event).toBe('PAYMENT_CONFIRMED')
    expect(p?.payment.id).toBe('pay_1')
    expect(p?.payment.value).toBe(0)
    expect(p?.payment.externalReference).toBe(null)
    expect(p?.payment.subscription).toBe(null)
  })

  it('recusa corpo que nao e objeto ou sem os campos obrigatorios', () => {
    expect(parseWebhookPayload(null)).toBe(null)
    expect(parseWebhookPayload('texto')).toBe(null)
    expect(parseWebhookPayload({})).toBe(null)
    expect(parseWebhookPayload({ event: 'PAYMENT_CONFIRMED' })).toBe(null)
    expect(parseWebhookPayload({ event: '', payment: { id: 'x', status: 'y' } })).toBe(null)
    expect(parseWebhookPayload({ event: 'X', payment: { id: '', status: 'y' } })).toBe(null)
    expect(parseWebhookPayload({ event: 'X', payment: { id: 'x' } })).toBe(null)
  })

  it('preserva o valor e a assinatura quando vem', () => {
    const p = parseWebhookPayload({
      ...base,
      payment: {
        id: 'pay_2',
        status: 'CONFIRMED',
        value: 39.9,
        externalReference: 'plano:abc:associado:monthly',
        subscription: 'sub_9',
      },
    })
    expect(p?.payment.value).toBe(39.9)
    expect(p?.payment.externalReference).toBe('plano:abc:associado:monthly')
    expect(p?.payment.subscription).toBe('sub_9')
  })
})

describe('referencia externa', () => {
  it('ida e volta do plano', () => {
    const r = montarReferenciaPlano('biz-1', 'destaque', 'annual')
    expect(r).toBe('plano:biz-1:destaque:annual')
    expect(lerReferencia(r)).toEqual({
      tipo: 'plano',
      businessId: 'biz-1',
      plan: 'destaque',
      billing: 'annual',
    })
  })

  it('ida e volta da doacao', () => {
    const r = montarReferenciaDoacao('uuid-1')
    expect(r).toBe('doacao:uuid-1')
    expect(lerReferencia(r)).toEqual({ tipo: 'doacao', id: 'uuid-1' })
  })

  /* Se uma referencia malformada passasse, o webhook ativaria plano no negocio
     errado ou com plano inexistente. Cada um destes casos tem que virar null. */
  it('recusa referencia malformada', () => {
    expect(lerReferencia(null)).toBe(null)
    expect(lerReferencia('')).toBe(null)
    expect(lerReferencia('plano:biz-1')).toBe(null)
    expect(lerReferencia('plano:biz-1:ouro:monthly')).toBe(null)
    expect(lerReferencia('plano::associado:monthly')).toBe(null)
    expect(lerReferencia('plano:biz-1:associado:semanal')).toBe(null)
    expect(lerReferencia('doacao')).toBe(null)
    expect(lerReferencia('cobranca:xyz')).toBe(null)
  })
})
