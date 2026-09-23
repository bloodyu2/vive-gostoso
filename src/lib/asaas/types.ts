/**
 * Tipos do Asaas, reduzidos ao que os dois fluxos da Vive precisam: doacao de
 * valor livre e plano (associado/destaque, mensal ou anual).
 *
 * Adaptado do padrao da casa (`lib/asaas/types.ts` do acalanto-tours, que cobre
 * split com subconta de parceiro, que aqui nao existe: o dinheiro cai direto na
 * conta Asaas da empresa).
 */

export type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

export interface AsaasCustomer {
  id: string
  name: string
  email?: string
  cpfCnpj: string
}

export interface AsaasCreateCustomerRequest {
  name: string
  email?: string
  /* O Asaas exige documento para criar cliente. Nao inventamos CPF nem usamos
   * documento de preenchimento: sem documento a chamada nao acontece e o fluxo
   * continua no Stripe, que segue no ar. */
  cpfCnpj: string
  externalReference?: string
}

export interface AsaasPayment {
  id: string
  customer: string
  billingType: AsaasBillingType
  value: number
  dueDate: string
  status: string
  invoiceUrl: string | null
  externalReference: string | null
}

export interface AsaasCreatePaymentRequest {
  customer: string
  billingType: AsaasBillingType
  value: number
  dueDate: string
  description?: string
  externalReference?: string
}

export interface AsaasSubscription {
  id: string
  customer: string
  billingType: AsaasBillingType
  value: number
  nextDueDate: string
  cycle: 'MONTHLY' | 'YEARLY'
  status: string
  externalReference: string | null
}

export interface AsaasCreateSubscriptionRequest {
  customer: string
  billingType: AsaasBillingType
  value: number
  nextDueDate: string
  cycle: 'MONTHLY' | 'YEARLY'
  description?: string
  externalReference?: string
}

/**
 * Checkout hospedado do Asaas (POST /checkouts), no formato que o
 * acalanto-tours ja usa em producao.
 *
 * Existe porque o Stripe Checkout devolvia `success_url`: sem ele, o doador
 * pagava e nao voltava para a /apoie. O endpoint /payments nao aceita URL de
 * retorno e o /checkouts aceita.
 *
 * Nao serve para cobranca recorrente: o plano mensal usa assinatura
 * (POST /subscriptions), como no balaio-digital.
 */
export interface AsaasCheckoutRequest {
  name: string
  value: number
  dueDate: string
  billingTypes: AsaasBillingType[]
  description?: string
  externalReference?: string
  successUrl?: string
  notificationEnabled?: boolean
}

export interface AsaasCheckoutResponse {
  id: string
  url?: string
  status?: string
}

export interface AsaasWebhookPayment {
  id: string
  externalReference: string | null
  status: string
  value: number
  billingType: string
  dueDate?: string
  /* Presente quando a cobranca pertence a uma assinatura. E por ele que o
   * webhook conhece a assinatura que gerou as cobrancas dos ciclos. */
  subscription?: string | null
}

export interface AsaasWebhookPayload {
  id?: string
  event: string
  payment: AsaasWebhookPayment
}
