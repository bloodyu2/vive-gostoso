import { describe, expect, it } from 'vitest'
import { AMBIENTE_PADRAO, carregarFuncao } from '@/test/deno/carregar'
import { estadoStripe } from '@/test/deno/stripe'

function pedido(corpo: Record<string, unknown>): Request {
  return new Request('https://exemplo.supabase.test/functions/v1/create-donation-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://www.vivegostoso.com.br' },
    body: JSON.stringify(corpo),
  })
}

describe('create-donation-session', () => {
  it('valor valido abre a sessao', async () => {
    const h = await carregarFuncao('create-donation-session')
    const r = await h(pedido({ amountCents: 2500 }))
    expect(r.status).toBe(200)
  })

  it('valor fora da faixa responde 400', async () => {
    const h = await carregarFuncao('create-donation-session')
    expect((await h(pedido({ amountCents: 100 }))).status).toBe(400)
    expect((await h(pedido({ amountCents: 1.5 }))).status).toBe(400)
  })

  it('sem a chave do Stripe recusa com 503', async () => {
    const h = await carregarFuncao('create-donation-session', { ...AMBIENTE_PADRAO, STRIPE_SECRET_KEY: undefined })
    const r = await h(pedido({ amountCents: 2500 }))
    expect(r.status).toBe(503)
    expect(estadoStripe().chamadas).toEqual([])
  })
})
