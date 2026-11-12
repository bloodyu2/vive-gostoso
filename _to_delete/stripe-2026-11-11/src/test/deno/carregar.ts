// Carrega uma Edge Function do repositorio nos testes e devolve o handler que ela
// registrou em `serve`. Cada chamada recarrega o modulo, porque as funcoes leem
// os segredos na partida.
import { vi } from 'vitest'
import { resolve } from 'node:path'
import type { Handler } from './std-http-server'
import type { EstadoStripe } from './stripe'
import type { EstadoBanco } from './supabase-js'

type Global = typeof globalThis & {
  Deno?: { env: { get: (k: string) => string | undefined } }
  __edgeHandler?: Handler
  __stripeEstado?: EstadoStripe
  __bancoEstado?: EstadoBanco
}

export const AMBIENTE_PADRAO = {
  STRIPE_SECRET_KEY: 'sk_test_exemplo',
  STRIPE_WEBHOOK_SECRET: 'whsec_exemplo',
  SUPABASE_URL: 'https://exemplo.supabase.test',
  SUPABASE_SERVICE_ROLE_KEY: 'service_exemplo',
}

export async function carregarFuncao(
  nome: 'create-checkout-session' | 'create-donation-session' | 'stripe-webhook',
  ambiente: Record<string, string | undefined> = AMBIENTE_PADRAO,
): Promise<Handler> {
  const g = globalThis as Global
  vi.resetModules()
  g.Deno = { env: { get: (k) => ambiente[k] } }
  g.__stripeEstado = { chamadas: [] }
  g.__bancoEstado = undefined
  g.__edgeHandler = undefined
  const caminho = resolve(process.cwd(), `supabase/functions/${nome}/index.ts`).replace(/\\/g, '/')
  await import(/* @vite-ignore */ caminho)
  if (!g.__edgeHandler) throw new Error(`A funcao ${nome} nao registrou handler`)
  return g.__edgeHandler
}
