// Substituto, nos testes, do SDK do Stripe usado pelas Edge Functions. A
// verificacao de assinatura e real (HMAC-SHA256 do formato `t=...,v1=...`), para
// que um segredo vazio se comporte como no SDK: aceita assinatura feita com
// chave vazia. O resto grava as chamadas para o teste conferir.
import { createHmac, timingSafeEqual } from 'node:crypto'

export type EstadoStripe = {
  chamadas: string[]
  falhaAoCriarCliente?: Error
}

function estado(): EstadoStripe {
  const g = globalThis as { __stripeEstado?: EstadoStripe }
  if (!g.__stripeEstado) g.__stripeEstado = { chamadas: [] }
  return g.__stripeEstado
}

export function assinar(corpo: string, segredo: string, t = Math.floor(Date.now() / 1000)): string {
  const v1 = createHmac('sha256', segredo).update(`${t}.${corpo}`).digest('hex')
  return `t=${t},v1=${v1}`
}

export default class Stripe {
  static createFetchHttpClient() {
    return {}
  }

  webhooks = {
    constructEventAsync: async (corpo: string, cabecalho: string, segredo: string) => {
      const partes = Object.fromEntries(cabecalho.split(',').map((p) => p.split('=') as [string, string]))
      const esperado = createHmac('sha256', segredo).update(`${partes.t}.${corpo}`).digest('hex')
      const recebido = partes.v1 ?? ''
      const a = Buffer.from(esperado)
      const b = Buffer.from(recebido)
      if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('assinatura invalida')
      return JSON.parse(corpo)
    },
  }

  customers = {
    create: async () => {
      estado().chamadas.push('customers.create')
      const falha = estado().falhaAoCriarCliente
      if (falha) throw falha
      return { id: 'cus_teste' }
    },
  }

  checkout = {
    sessions: {
      create: async () => {
        estado().chamadas.push('checkout.sessions.create')
        return { url: 'https://checkout.stripe.test/sessao' }
      },
    },
  }

  subscriptions = {
    retrieve: async () => ({ id: 'sub_teste', items: { data: [{ price: { id: 'price_1TRYN4CK3p35JtqmlgDz9R7v' } }] } }),
  }
}
