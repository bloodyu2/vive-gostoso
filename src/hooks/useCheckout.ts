import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export const STRIPE_PRICES = {
  associado: 'price_1TRYN4CK3p35JtqmlgDz9R7v',
  destaque:  'price_1TRYN7CK3p35JtqmURKw4Z6a',
} as const

export async function startCheckout(businessId: string, plan: 'associado' | 'destaque') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const resp = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      priceId: STRIPE_PRICES[plan],
      businessId,
      successUrl: `${window.location.origin}/cadastre/painel?associado=success`,
      cancelUrl: `${window.location.origin}/cadastre/painel`,
    }),
  })

  const { url, error } = await resp.json()
  if (error) throw new Error(error)
  if (url) window.location.href = url
}
