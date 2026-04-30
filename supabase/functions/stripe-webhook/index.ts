import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Monthly subscription price → plan mapping
const PRICE_TO_PLAN: Record<string, 'associado' | 'destaque'> = {
  'price_1TRYN4CK3p35JtqmlgDz9R7v': 'associado',
  'price_1TRYN7CK3p35JtqmURKw4Z6a': 'destaque',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? '',
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // ── Checkout completed ────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const businessId = session.metadata?.business_id
    if (!businessId) {
      return new Response('Missing business_id', { status: 400 })
    }

    if (session.mode === 'payment' && session.metadata?.billing === 'annual') {
      // Plano anual: pagamento único de 12 meses
      const plan = (session.metadata.plan ?? 'associado') as 'associado' | 'destaque'
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      await supabase
        .from('gostoso_businesses')
        .update({
          plan,
          plan_expires_at: expiresAt.toISOString(),
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: null,
        })
        .eq('id', businessId)

      const { data: biz } = await supabase
        .from('gostoso_businesses')
        .select('profile_id')
        .eq('id', businessId)
        .maybeSingle()

      if (biz?.profile_id) {
        const planLabel = plan === 'destaque' ? 'Destaque' : 'Associado'
        const expLabel  = expiresAt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
        await supabase.from('gostoso_notifications').insert({
          profile_id: biz.profile_id,
          type: 'plan_activated',
          title: `Plano ${planLabel} ativado por 12 meses! 🚀`,
          body: `Seu negócio tem visibilidade ampliada até ${expLabel}. Você será avisado antes do vencimento.`,
          link: '/cadastre/painel',
        })
      }

    } else if (session.mode === 'subscription' && session.subscription) {
      // Plano mensal: assinatura recorrente
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = sub.items.data[0]?.price?.id
      const plan: 'associado' | 'destaque' =
        (priceId && PRICE_TO_PLAN[priceId]) ? PRICE_TO_PLAN[priceId] : 'associado'

      await supabase
        .from('gostoso_businesses')
        .update({
          plan,
          stripe_subscription_id: sub.id,
          stripe_customer_id: session.customer as string,
          plan_expires_at: null,
        })
        .eq('id', businessId)

      const { data: biz } = await supabase
        .from('gostoso_businesses')
        .select('profile_id')
        .eq('id', businessId)
        .maybeSingle()

      if (biz?.profile_id) {
        const planLabel = plan === 'destaque' ? 'Destaque' : 'Associado'
        await supabase.from('gostoso_notifications').insert({
          profile_id: biz.profile_id,
          type: 'plan_activated',
          title: `Plano ${planLabel} ativado! 🚀`,
          body: 'Seu negócio agora tem visibilidade ampliada na plataforma.',
          link: '/cadastre/painel',
        })
      }
    }
  }

  // ── Subscription cancelled (mensal) ──────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase
      .from('gostoso_businesses')
      .update({ plan: 'free', stripe_subscription_id: null, plan_expires_at: null })
      .eq('stripe_subscription_id', sub.id)
  }

  // ── Subscription updated (mensal) ─────────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const priceId = sub.items.data[0]?.price?.id
    if (priceId && PRICE_TO_PLAN[priceId]) {
      await supabase
        .from('gostoso_businesses')
        .update({ plan: PRICE_TO_PLAN[priceId] })
        .eq('stripe_subscription_id', sub.id)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
