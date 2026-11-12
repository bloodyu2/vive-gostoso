import { beforeEach, describe, expect, it } from 'vitest'
import { AMBIENTE_PADRAO, carregarFuncao } from '@/test/deno/carregar'
import { estadoBanco } from '@/test/deno/supabase-js'
import { assinar } from '@/test/deno/stripe'

const EVENTO_SEM_EFEITO = JSON.stringify({ id: 'evt_1', type: 'sonda.sem.efeito', data: { object: {} } })
const EVENTO_PLANO_ANUAL = JSON.stringify({
  id: 'evt_2',
  type: 'checkout.session.completed',
  data: {
    object: {
      mode: 'payment',
      customer: 'cus_1',
      metadata: { business_id: 'b1', plan: 'associado', billing: 'annual' },
    },
  },
})

function pedido(corpo: string, assinatura: string | null): Request {
  return new Request('https://exemplo.supabase.test/functions/v1/stripe-webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(assinatura ? { 'stripe-signature': assinatura } : {}) },
    body: corpo,
  })
}

function prepararBanco() {
  const b = estadoBanco()
  b.escritas = []
  b.falhaDeEscrita = {}
  b.tabelas = { gostoso_businesses: [{ id: 'b1', profile_id: 'p1' }] }
}

describe('stripe-webhook', () => {
  beforeEach(() => {
    prepararBanco()
  })

  it('assinatura valida de evento sem efeito responde 200', async () => {
    const h = await carregarFuncao('stripe-webhook')
    const r = await h(pedido(EVENTO_SEM_EFEITO, assinar(EVENTO_SEM_EFEITO, AMBIENTE_PADRAO.STRIPE_WEBHOOK_SECRET)))
    expect(r.status).toBe(200)
  })

  it('assinatura errada e ausente respondem 400', async () => {
    const h = await carregarFuncao('stripe-webhook')
    expect((await h(pedido(EVENTO_SEM_EFEITO, assinar(EVENTO_SEM_EFEITO, 'whsec_outro')))).status).toBe(400)
    expect((await h(pedido(EVENTO_SEM_EFEITO, null))).status).toBe(400)
  })

  it('sem o segredo do webhook, evento assinado com chave vazia e recusado com 503 e nao toca no banco', async () => {
    const h = await carregarFuncao('stripe-webhook', { ...AMBIENTE_PADRAO, STRIPE_WEBHOOK_SECRET: undefined })
    prepararBanco()
    const r = await h(pedido(EVENTO_PLANO_ANUAL, assinar(EVENTO_PLANO_ANUAL, '')))
    expect(r.status).toBe(503)
    expect(estadoBanco().escritas).toEqual([])
  })

  it('segredo vazio (string) tambem e recusado', async () => {
    const h = await carregarFuncao('stripe-webhook', { ...AMBIENTE_PADRAO, STRIPE_WEBHOOK_SECRET: '' })
    const r = await h(pedido(EVENTO_SEM_EFEITO, assinar(EVENTO_SEM_EFEITO, '')))
    expect(r.status).toBe(503)
  })

  it('falha ao gravar o plano devolve 500 para o Stripe repetir o evento', async () => {
    const h = await carregarFuncao('stripe-webhook')
    prepararBanco()
    estadoBanco().falhaDeEscrita = { gostoso_businesses: { message: 'banco fora' } }
    const r = await h(pedido(EVENTO_PLANO_ANUAL, assinar(EVENTO_PLANO_ANUAL, AMBIENTE_PADRAO.STRIPE_WEBHOOK_SECRET)))
    expect(r.status).toBe(500)
  })

  it('plano anual pago grava o plano no negocio do metadado', async () => {
    const h = await carregarFuncao('stripe-webhook')
    prepararBanco()
    const r = await h(pedido(EVENTO_PLANO_ANUAL, assinar(EVENTO_PLANO_ANUAL, AMBIENTE_PADRAO.STRIPE_WEBHOOK_SECRET)))
    expect(r.status).toBe(200)
    const gravou = estadoBanco().escritas.find((e) => e.tabela === 'gostoso_businesses' && e.operacao === 'update')
    expect(gravou?.valores.plan).toBe('associado')
  })
})
