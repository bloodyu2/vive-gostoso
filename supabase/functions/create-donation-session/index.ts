import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const ALLOWED_ORIGINS = new Set([
  'https://vivegostoso.com.br',
  'https://www.vivegostoso.com.br',
  'http://localhost:5173',
  'http://localhost:3000',
])

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://vivegostoso.com.br'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

function safeUrl(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  try {
    const u = new URL(value)
    return ALLOWED_ORIGINS.has(u.origin) ? u.toString() : fallback
  } catch { return fallback }
}

serve(async (req) => {
  const cors = corsHeaders(req.headers.get('origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const { amountCents, successUrl, cancelUrl } = await req.json()
    const reqOrigin = req.headers.get('origin')
    const baseOrigin = reqOrigin && ALLOWED_ORIGINS.has(reqOrigin) ? reqOrigin : 'https://vivegostoso.com.br'

    if (
      !amountCents ||
      typeof amountCents !== 'number' ||
      !Number.isFinite(amountCents) ||
      !Number.isInteger(amountCents) ||
      amountCents < 500 ||
      amountCents > 1_000_000_00
    ) {
      return new Response(JSON.stringify({ error: 'Valor inválido. Mínimo R$5,00, máximo R$1.000.000,00.' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'boleto'],
      payment_method_options: {
        boleto: { expires_after_days: 3 },
      },
      locale: 'pt-BR',
      billing_address_collection: 'required',
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Doação — Vive Gostoso',
            description: 'Apoio à plataforma comunitária de São Miguel do Gostoso, RN. Cada real fica na cidade.',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      success_url: safeUrl(successUrl, `${baseOrigin}/apoie?doacao=success`),
      cancel_url:  safeUrl(cancelUrl,  `${baseOrigin}/apoie`),
      metadata: { type: 'donation' },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('create-donation-session error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
