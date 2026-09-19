import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  asaasLigado,
  createCheckout,
  createCharge,
  createOrFindCustomer,
  createSubscription,
} from '@/lib/asaas/client'
import { montarReferenciaPlano } from '@/lib/asaas/webhook'
import { ehCobranca, ehPlano, valorDoPlano } from '@/lib/asaas/planos'
import { getParametrosProduto } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

/**
 * Plano pago (associado/destaque), pelo Asaas.
 *
 * Rota de API do Next em vez de edge function, de proposito: fica versionada
 * junto do app, testavel com vitest sem Deno, e o middleware do projeto ja trata
 * `/api/` fora do i18n. O Stripe continua no ar pela edge function
 * `create-checkout-session`; aqui nao se remove nada do Stripe.
 *
 * Mensal vira assinatura (POST /subscriptions), como no balaio-digital. Anual
 * vira cobranca unica, porque nao renova sozinha. Nos dois casos o plano so e
 * ativado quando o webhook confirma o pagamento, pela referencia externa.
 */

interface CorpoDoCheckout {
  plan: 'associado' | 'destaque'
  businessId: string
  billing: 'monthly' | 'annual'
  cpfCnpj: string
}

/**
 * Validacao a mao de proposito: os dois repos Vive nao tem zod como dependencia
 * e adicionar uma lib so para quatro campos mexeria no lockfile sem ganho.
 * Devolve null quando o corpo nao serve, e quem chama responde 400.
 */
function lerCorpo(corpo: unknown): CorpoDoCheckout | null {
  if (typeof corpo !== 'object' || corpo === null) return null
  const c = corpo as Record<string, unknown>
  if (!ehPlano(c.plan)) return null
  if (typeof c.businessId !== 'string' || c.businessId.length === 0) return null
  // CPF/CNPJ e opcional na entrada: o Painel nao coleta documento hoje, e o
  // Stripe tambem nao pedia (o Checkout hospedado dele coleta). Sem documento o
  // fluxo segue com o mesmo placeholder do acalanto-tours, para nao travar num
  // campo que a tela ainda nao tem.
  const cpfCnpj = typeof c.cpfCnpj === 'string' ? c.cpfCnpj : ''
  const billing = c.billing === undefined ? 'monthly' : c.billing
  if (!ehCobranca(billing)) return null
  return { plan: c.plan, businessId: c.businessId, billing, cpfCnpj }
}

/** Mesmo placeholder do acalanto-tours: o Asaas aceita cliente sem CPF real. */
const SEM_DOCUMENTO = '00000000000'

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function daquiA(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
  // Sem chave configurada a rota nao finge que cobra: 503 para o chamador cair
  // no Stripe, que segue funcionando.
  if (!asaasLigado()) {
    return NextResponse.json(
      { error: 'Asaas indisponivel: variavel de ambiente nao configurada.', code: 'asaas_off' },
      { status: 503 }
    )
  }

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo invalido.' }, { status: 400 })
  }

  const dados = lerCorpo(corpo)
  if (!dados) {
    return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 })
  }
  const { businessId, plan, billing } = dados

  const documento = apenasDigitos(dados.cpfCnpj)
  const documentoValido = documento.length === 11 || documento.length === 14
  if (dados.cpfCnpj.length > 0 && !documentoValido) {
    return NextResponse.json(
      { error: 'Informe um CPF (11 digitos) ou CNPJ (14 digitos) valido.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sessao expirada. Entre novamente.' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: biz } = await admin
    .from('gostoso_businesses')
    .select('id, name, profile_id')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) {
    return NextResponse.json({ error: 'Negocio nao encontrado.' }, { status: 404 })
  }

  // Guarda de IDOR, igual a edge function do Stripe: so o perfil dono do negocio
  // pode iniciar cobranca para ele. Sem isso, qualquer autenticado passaria um
  // businessId de terceiro e, pelo webhook, ativaria plano em negocio alheio.
  const { data: perfil } = await admin
    .from('gostoso_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!perfil || biz.profile_id !== perfil.id) {
    return NextResponse.json({ error: 'Sem permissao para este negocio.' }, { status: 403 })
  }

  // Preco vem do banco, nunca de constante neste arquivo: e a regra do repo
  // (src/lib/parametros.ts). Se o parametro nao veio, a rota NAO inventa valor
  // num caminho de cobranca -- responde 503 e o chamador cai no Stripe.
  const parametros = await getParametrosProduto()
  const valorCentavos = valorDoPlano(parametros, plan, billing)
  if (valorCentavos === null) {
    console.error(`[api/checkout] preco do plano ${plan}/${billing} ausente em gostoso_parametros_produto`)
    return NextResponse.json(
      { error: 'Preco do plano indisponivel.', code: 'preco_ausente' },
      { status: 503 }
    )
  }

  const valor = valorCentavos / 100
  const refer = montarReferenciaPlano(businessId, plan, billing)
  const vencimento = daquiA(3)

  try {
    const cliente = await createOrFindCustomer({
      name: biz.name ?? 'Negocio Vive',
      email: user.email ?? undefined,
      cpfCnpj: documentoValido ? documento : SEM_DOCUMENTO,
      externalReference: perfil.id,
    })

    if (billing === 'monthly') {
      // Assinatura recorrente. O checkout hospedado nao cobre recorrencia, entao
      // o caminho e o do balaio-digital: cria a assinatura e a primeira cobranca,
      // e devolve o invoiceUrl dessa primeira cobranca.
      const assinatura = await createSubscription({
        customer: cliente.id,
        billingType: 'PIX',
        value: valor,
        nextDueDate: vencimento,
        cycle: 'MONTHLY',
        description: `Plano ${plan} — mensal`,
        externalReference: refer,
      })

      const primeira = await createCharge({
        customer: cliente.id,
        billingType: 'PIX',
        value: valor,
        dueDate: vencimento,
        description: `Plano ${plan} — primeira cobranca da assinatura`,
        externalReference: refer,
      })

      return NextResponse.json({
        url: primeira.invoiceUrl,
        subscriptionId: assinatura.id,
        provider: 'asaas',
      })
    }

    // Anual: pagamento unico, sem renovacao automatica. O checkout hospedado
    // devolve a url de pagamento e o retorno para o painel.
    const checkout = await createCheckout({
      name: `Plano ${plan} — 12 meses`,
      value: valor,
      dueDate: vencimento,
      billingTypes: ['PIX', 'BOLETO', 'CREDIT_CARD'],
      description: 'Validade de 12 meses. Renovacao manual ao fim do periodo.',
      externalReference: refer,
      successUrl: `${request.nextUrl.origin}/cadastre/painel?associado=success`,
      notificationEnabled: true,
    })

    if (checkout.url) {
      return NextResponse.json({ url: checkout.url, provider: 'asaas' })
    }

    // Fallback: checkout sem url cai para cobranca avulsa, cujo invoiceUrl faz
    // o mesmo papel.
    const cobranca = await createCharge({
      customer: cliente.id,
      billingType: 'PIX',
      value: valor,
      dueDate: vencimento,
      description: `Plano ${plan} — 12 meses`,
      externalReference: refer,
    })
    return NextResponse.json({ url: cobranca.invoiceUrl, provider: 'asaas' })
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : String(err)
    console.error('[api/checkout] falha ao abrir cobranca Asaas:', mensagem)
    return NextResponse.json({ error: 'Nao foi possivel abrir a cobranca.' }, { status: 502 })
  }
}
