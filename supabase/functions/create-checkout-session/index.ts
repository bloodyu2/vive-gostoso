import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Annual plans: one-time payment (PIX + boleto + card), not a subscription
const ANNUAL_PRICES: Record<string, { plan: 'associado' | 'destaque'; amountCents: number }> = {
  'price_1TReBwCK3p35JtqmmjgaRwCy': { plan: 'associado', amountCents: 43092 }, // R$430,92
  'price_1TReBzCK3p35JtqmM0tIPdHm': { plan: 'destaque',  amountCents: 64692 }, // R$646,92
}

// Monthly plans: recurring subscription (card + boleto)
const MONTHLY_PLAN: Record<string, 'associado' | 'destaque'> = {
  'price_1TRYN4CK3p35JtqmlgDz9R7v': 'associado',
  'price_1TRYN7CK3p35JtqmURKw4Z6a': 'destaque',
}

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { priceId, businessId, successUrl, cancelUrl } = await req.json()

    if (!priceId || !businessId) {
      return new Response(JSON.stringify({ error: 'Missing priceId or businessId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: biz } = await supabase
      .from('gostoso_businesses')
      .select('id, name, stripe_customer_id')
      .eq('id', businessId)
      .maybeSingle()

    if (!biz) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create or reuse Stripe customer
    let customerId = biz.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { business_id: businessId, user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('gostoso_businesses')
        .update({ stripe_customer_id: customerId })
        .eq('id', businessId)
    }

    const origin = req.headers.get('origin') ?? 'https://vivegostoso.com.br'
    const success = successUrl ?? `${origin}/cadastre/painel?associado=success`
    const cancel  = cancelUrl  ?? `${origin}/cadastre/painel`

    const annualInfo = ANNUAL_PRICES[priceId]
    let session: Stripe.Checkout.Session

    if (annualInfo) {
      // ── Plano anual: pagamento único de 12 meses ──────────────────────────
      // PIX, boleto e cartão são aceitos. Sem renovação automática.
      const planLabel = annualInfo.plan === 'associado' ? 'Associado' : 'Destaque'
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card', 'pix', 'boleto'],
        payment_method_options: {
          pix:    { expires_after_seconds: 3600 },
          boleto: { expires_after_days: 3 },
        },
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${planLabel} — 12 meses`,
              description: 'Validade de 12 meses. Renovação manual ao fim do período.',
            },
            unit_amount: annualInfo.amountCents,
          },
          quantity: 1,
        }],
        billing_address_collection: 'required',
        locale: 'pt-BR',
        success_url: success,
        cancel_url: cancel,
        metadata: { business_id: businessId, plan: annualInfo.plan, billing: 'annual' },
      })
    } else if (MONTHLY_PLAN[priceId]) {
      // ── Plano mensal: assinatura recorrente (cartão + boleto) ─────────────
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        payment_method_types: ['card', 'boleto'],
        locale: 'pt-BR',
        billing_address_collection: 'required',
        success_url: success,
        cancel_url: cancel,
        metadata: { business_id: businessId },
        subscription_data: { metadata: { business_id: businessId } },
        allow_promotion_codes: true,
      })
    } else {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('create-checkout-session error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
