import type {
  AsaasCheckoutRequest,
  AsaasCheckoutResponse,
  AsaasCreateCustomerRequest,
  AsaasCreatePaymentRequest,
  AsaasCreateSubscriptionRequest,
  AsaasCustomer,
  AsaasPayment,
  AsaasSubscription,
} from './types'

/**
 * Cliente do Asaas, no padrao da casa (acalanto-tours, balaio-digital e
 * booking-app).
 *
 * Ambiente por `ASAAS_ENVIRONMENT`: exatamente 'sandbox' usa a chave de sandbox
 * e o host de sandbox; qualquer outro valor usa producao. A escolha da chave
 * segue a do host de proposito: sandbox com a chave de producao tem que falhar
 * alto, e nao cobrar de verdade achando que esta testando.
 */

function isSandbox(): boolean {
  return process.env.ASAAS_ENVIRONMENT === 'sandbox'
}

/**
 * Placeholder de documento, igual ao do acalanto-tours.
 *
 * O Asaas exige `cpfCnpj` para criar cliente, mas nem toda tela nossa coleta o
 * documento (a /apoie nao coleta). Este valor marca "sem documento" e nunca
 * deve ser usado para deduplicar cliente.
 */
export const SEM_DOCUMENTO = '00000000000'

function getBaseUrl(): string {
  return isSandbox()
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/v3'
}

function getApiKey(): string {
  const key = isSandbox()
    ? process.env.ASAAS_SANDBOX_API_KEY
    : process.env.ASAAS_API_KEY
  if (!key) {
    throw new Error(
      `ASAAS API key not configured (ASAAS_ENVIRONMENT=${process.env.ASAAS_ENVIRONMENT ?? 'unset'}, expected key: ${isSandbox() ? 'ASAAS_SANDBOX_API_KEY' : 'ASAAS_API_KEY'})`
    )
  }
  return key
}

/**
 * A cobranca Asaas esta ligada?
 *
 * A pergunta e sobre a chave do ambiente escolhido, e nao sobre qualquer chave:
 * `ASAAS_ENVIRONMENT=sandbox` com a chave de producao preenchida continua
 * desligado, porque e a de sandbox que seria usada. Mesmo criterio do
 * booking-app, para o produto se comportar de forma explicavel sem chave em vez
 * de quebrar no fim do formulario.
 */
export function asaasLigado(): boolean {
  return Boolean(isSandbox() ? process.env.ASAAS_SANDBOX_API_KEY : process.env.ASAAS_API_KEY)
}

export interface AsaasErrorDetail {
  code?: string
  description?: string
}

export class AsaasApiError extends Error {
  status: number
  asaasErrors: AsaasErrorDetail[]

  constructor(status: number, path: string, body: string) {
    let errors: AsaasErrorDetail[] = []
    try {
      const parsed = JSON.parse(body)
      if (Array.isArray(parsed?.errors)) errors = parsed.errors
    } catch {
      // Corpo que nao e JSON: a mensagem crua ainda vai na Error.
    }
    super(`ASAAS ${path} respondeu ${status}: ${body}`)
    this.name = 'AsaasApiError'
    this.status = status
    this.asaasErrors = errors
  }
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      access_token: getApiKey(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    throw new AsaasApiError(res.status, `${options.method ?? 'GET'} ${path}`, await res.text())
  }
  return res.json() as Promise<T>
}

/** E por CPF/CNPJ que o Asaas deduplica cliente. */
export async function findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
  const result = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}&limit=1`
  )
  return result.data[0] ?? null
}

export async function createCustomer(req: AsaasCreateCustomerRequest): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export async function createOrFindCustomer(req: AsaasCreateCustomerRequest): Promise<AsaasCustomer> {
  // O placeholder nao e documento: buscar por ele casaria com o primeiro cliente
  // sem CPF criado e jogaria todo doador seguinte no MESMO cliente do Asaas, com
  // as cobrancas todas penduradas nele. Mesmo cuidado do acalanto-tours, que so
  // procura por CPF quando o CPF e real.
  const temDocumentoReal = req.cpfCnpj && req.cpfCnpj !== SEM_DOCUMENTO
  if (temDocumentoReal) {
    const existing = await findCustomerByCpfCnpj(req.cpfCnpj)
    if (existing) return existing
  }
  return createCustomer(req)
}

export async function createCharge(req: AsaasCreatePaymentRequest): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export async function createSubscription(
  req: AsaasCreateSubscriptionRequest
): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

/**
 * Checkout hospedado: e o que devolve `url` para redirecionar o cliente e
 * aceita URL de retorno. Quando a API nao devolve url, quem chama cai para a
 * cobranca avulsa e usa o `invoiceUrl`.
 */
export async function createCheckout(req: AsaasCheckoutRequest): Promise<AsaasCheckoutResponse> {
  return asaasFetch<AsaasCheckoutResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}
