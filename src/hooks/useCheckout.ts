import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export const STRIPE_PRICES = {
  monthly: {
    associado: 'price_1TRYN4CK3p35JtqmlgDz9R7v',
    destaque:  'price_1TRYN7CK3p35JtqmURKw4Z6a',
  },
  annual: {
    associado: 'price_1TReBwCK3p35JtqmmjgaRwCy', // R$430,92/ano — 10% off
    destaque:  'price_1TReBzCK3p35JtqmM0tIPdHm', // R$646,92/ano — 10% off
  },
} as const

export async function startCheckout(
  businessId: string,
  plan: 'associado' | 'destaque',
  billing: 'monthly' | 'annual' = 'monthly',
) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const priceId = STRIPE_PRICES[billing][plan]

  const resp = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      priceId,
      businessId,
      successUrl: `${window.location.origin}/cadastre/painel?associado=success`,
      cancelUrl: `${window.location.origin}/cadastre/painel`,
    }),
  })

  const { url, error } = await resp.json()
  if (error) throw new Error(error)
  if (url) window.location.href = url
}

export async function startDonation(amountCents: number) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/create-donation-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amountCents,
      successUrl: `${window.location.origin}/apoie?doacao=success`,
      cancelUrl: `${window.location.origin}/apoie`,
    }),
  })

  const { url, error } = await resp.json()
  if (error) throw new Error(error)
  if (url) window.location.href = url
}
