import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Annual price IDs — when used, PIX is enabled in addition to card + boleto
const ANNUAL_PRICE_IDS = new Set([
  'price_1TReBwCK3p35JtqmmjgaRwCy', // associado anual (R$430,92/ano — 10% off)
  'price_1TReBzCK3p35JtqmM0tIPdHm', // destaque anual  (R$646,92/ano — 10% off)
])

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
    // Verify JWT and get user
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

    // Verify the business exists
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // Annual plans support PIX (one payment/year); monthly uses card + boleto only
      payment_method_types: ANNUAL_PRICE_IDS.has(priceId)
        ? ['card', 'boleto', 'pix']
        : ['card', 'boleto'],
      locale: 'pt-BR',
      // Required for boleto — collects CPF/CNPJ and billing address
      billing_address_collection: 'required',
      success_url: successUrl ?? `${req.headers.get('origin')}/cadastre/painel?associado=success`,
      cancel_url: cancelUrl ?? `${req.headers.get('origin')}/cadastre/painel`,
      metadata: { business_id: businessId },
      subscription_data: { metadata: { business_id: businessId } },
      allow_promotion_codes: true,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
