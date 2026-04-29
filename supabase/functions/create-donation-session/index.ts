import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amountCents, successUrl, cancelUrl } = await req.json()
    const origin = req.headers.get('origin') ?? 'https://vivegostoso.com.br'

    if (!amountCents || typeof amountCents !== 'number' || amountCents < 500) {
      return new Response(JSON.stringify({ error: 'Valor mínimo de doação: R$5,00' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix', 'boleto'],
      locale: 'pt-BR',
      billing_address_collection: 'required',
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Doação — Vive Gostoso',
            description: 'Apoio à plataforma comunitária de São Miguel do Gostoso, RN. Cada real fica na cidade.',
            images: [],
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      success_url: successUrl ?? `${origin}/apoie?doacao=success`,
      cancel_url: cancelUrl ?? `${origin}/apoie`,
      metadata: { type: 'donation' },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-donation-session error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
