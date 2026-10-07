import { beforeEach, describe, expect, it } from 'vitest'
import { AMBIENTE_PADRAO, carregarFuncao } from '@/test/deno/carregar'
import { estadoBanco } from '@/test/deno/supabase-js'
import type { EstadoStripe } from '@/test/deno/stripe'

/* A Edge Function de checkout roda no Supabase, nao na Vercel. Aqui o arquivo do
   repositorio roda com Stripe e banco de mentira, para provar quem pode abrir
   cobranca para qual negocio. */
const PRECO_MENSAL = 'price_1TRYN4CK3p35JtqmlgDz9R7v'

function pedido(token: string | null, corpo: Record<string, unknown>): Request {
  return new Request('https://exemplo.supabase.test/functions/v1/create-checkout-session', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://www.vivegostoso.com.br',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(corpo),
  })
}

function estadoStripe(): EstadoStripe {
  return (globalThis as { __stripeEstado: EstadoStripe }).__stripeEstado
}

function prepararBanco() {
  const b = estadoBanco()
  b.escritas = []
  b.falhaDeEscrita = {}
  b.usuarios = {
    'token-dono': { id: 'u1', email: 'dono@exemplo.test' },
    'token-outro': { id: 'u2', email: 'outro@exemplo.test' },
  }
  b.tabelas = {
    gostoso_profiles: [
      { id: 'p1', auth_user_id: 'u1' },
      { id: 'p2', auth_user_id: 'u2' },
    ],
    gostoso_businesses: [{ id: 'b1', name: 'Negocio', stripe_customer_id: null, profile_id: 'p1' }],
  }
}

describe('create-checkout-session', () => {
  beforeEach(() => {
    prepararBanco()
  })

  it('o dono do negocio abre a cobranca', async () => {
    const h = await carregarFuncao('create-checkout-session')
    prepararBanco()
    const r = await h(pedido('token-dono', { priceId: PRECO_MENSAL, businessId: 'b1' }))
    expect(r.status).toBe(200)
    expect(((await r.json()) as { url: string }).url).toContain('checkout.stripe.test')
  })

  it('quem nao e dono recebe 403 e nada e criado nem gravado', async () => {
    const h = await carregarFuncao('create-checkout-session')
    prepararBanco()
    const r = await h(pedido('token-outro', { priceId: PRECO_MENSAL, businessId: 'b1' }))
    expect(r.status).toBe(403)
    expect(estadoStripe().chamadas).toEqual([])
    expect(estadoBanco().escritas).toEqual([])
  })

  it('sem token recebe 401', async () => {
    const h = await carregarFuncao('create-checkout-session')
    prepararBanco()
    const r = await h(pedido(null, { priceId: PRECO_MENSAL, businessId: 'b1' }))
    expect(r.status).toBe(401)
  })

  it('token que nao existe recebe 401', async () => {
    const h = await carregarFuncao('create-checkout-session')
    prepararBanco()
    const r = await h(pedido('token-falso', { priceId: PRECO_MENSAL, businessId: 'b1' }))
    expect(r.status).toBe(401)
  })

  it('erro interno do Stripe nao vaza o texto para o navegador', async () => {
    const h = await carregarFuncao('create-checkout-session')
    prepararBanco()
    estadoStripe().falhaAoCriarCliente = new Error('No such customer: cus_segredo_interno')
    const r = await h(pedido('token-dono', { priceId: PRECO_MENSAL, businessId: 'b1' }))
    expect(r.status).toBe(500)
    const texto = await r.text()
    expect(texto).not.toContain('cus_segredo_interno')
    expect(texto).not.toContain('No such customer')
  })

  it('sem a chave do Stripe a funcao recusa com 503, sem tentar nada', async () => {
    const h = await carregarFuncao('create-checkout-session', { ...AMBIENTE_PADRAO, STRIPE_SECRET_KEY: undefined })
    prepararBanco()
    const r = await h(pedido('token-dono', { priceId: PRECO_MENSAL, businessId: 'b1' }))
    expect(r.status).toBe(503)
    expect(estadoStripe().chamadas).toEqual([])
  })
})
