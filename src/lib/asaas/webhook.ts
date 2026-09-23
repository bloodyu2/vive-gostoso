import crypto from 'crypto'
import type { AsaasWebhookPayload } from './types'

/**
 * Validacao do webhook do Asaas.
 *
 * O Asaas manda o token combinado no header `asaas-access-token`. A comparacao
 * e timing-safe e falha fechado: sem token configurado do nosso lado, nada
 * passa, para uma variavel ausente nao virar porta aberta.
 */
export function validateWebhookToken(
  headerValue: string | null,
  expectedToken: string | undefined
): boolean {
  if (!headerValue || !expectedToken) return false
  const a = Buffer.from(headerValue, 'utf8')
  const b = Buffer.from(expectedToken, 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Forma minima que o handler usa. Payload sem isso e recusado com 400. */
export function parseWebhookPayload(body: unknown): AsaasWebhookPayload | null {
  if (!isRecord(body)) return null
  const { id, event, payment } = body as { id?: unknown; event?: unknown; payment?: unknown }
  if (typeof event !== 'string' || event.length === 0) return null
  if (!isRecord(payment)) return null
  if (typeof payment.id !== 'string' || payment.id.length === 0) return null
  if (typeof payment.status !== 'string') return null

  return {
    id: typeof id === 'string' ? id : undefined,
    event,
    payment: {
      id: payment.id,
      status: payment.status,
      externalReference:
        typeof payment.externalReference === 'string' ? payment.externalReference : null,
      value: typeof payment.value === 'number' ? payment.value : 0,
      billingType: typeof payment.billingType === 'string' ? payment.billingType : '',
      dueDate: typeof payment.dueDate === 'string' ? payment.dueDate : undefined,
      subscription: typeof payment.subscription === 'string' ? payment.subscription : null,
    },
  }
}

/**
 * Referencia externa das cobrancas: e por ela que o webhook sabe a que negocio
 * (e a que plano) o pagamento pertence, sem coluna nova em `gostoso_businesses` e
 * sem tocar nas colunas do Stripe.
 *
 * Formato: `plano:<businessId>:<associado|destaque>:<monthly|annual>` ou
 * `doacao:<uuid>`.
 */
export type ReferenciaCobranca =
  | {
      tipo: 'plano'
      businessId: string
      plan: 'associado' | 'destaque'
      billing: 'monthly' | 'annual'
    }
  | { tipo: 'doacao'; id: string }

export function montarReferenciaPlano(
  businessId: string,
  plan: 'associado' | 'destaque',
  billing: 'monthly' | 'annual'
): string {
  return `plano:${businessId}:${plan}:${billing}`
}

export function montarReferenciaDoacao(id: string): string {
  return `doacao:${id}`
}

export function lerReferencia(externalReference: string | null): ReferenciaCobranca | null {
  if (!externalReference) return null
  const partes = externalReference.split(':')

  if (partes[0] === 'doacao' && partes[1]) {
    return { tipo: 'doacao', id: partes[1] }
  }

  if (partes[0] === 'plano' && partes.length === 4) {
    const businessId = partes[1]
    const plan = partes[2]
    const billing = partes[3]
    if (!businessId) return null
    if (plan !== 'associado' && plan !== 'destaque') return null
    if (billing !== 'monthly' && billing !== 'annual') return null
    return { tipo: 'plano', businessId, plan, billing }
  }

  return null
}

export type EventoDePagamento = 'confirmado' | 'vencido' | 'estornado' | 'falhou' | null

/** Traduz o evento do Asaas para o que o handler precisa fazer. */
export function traduzirEvento(event: string): EventoDePagamento {
  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      return 'confirmado'
    case 'PAYMENT_OVERDUE':
      return 'vencido'
    case 'PAYMENT_REFUNDED':
    case 'PAYMENT_PARTIALLY_REFUNDED':
      return 'estornado'
    case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
    case 'PAYMENT_DECLINED':
      return 'falhou'
    default:
      return null
  }
}
