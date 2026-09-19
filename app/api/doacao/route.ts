import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { asaasLigado, createCharge, createCheckout, createOrFindCustomer, SEM_DOCUMENTO } from '@/lib/asaas/client'
import { montarReferenciaDoacao } from '@/lib/asaas/webhook'

export const dynamic = 'force-dynamic'

/**
 * Doacao de valor livre para o Fundo Publico, pelo Asaas.
 *
 * Mesma faixa da edge function do Stripe (minimo R$5,00, maximo
 * R$1.000.000,00), para a regra nao divergir entre os dois caminhos.
 *
 * O checkout hospedado devolve a url e o retorno para a /apoie. O nome traz o
 * apelido informado pelo doador, quando houver.
 */

const MIN_CENTAVOS = 500
const MAX_CENTAVOS = 100_000_000

interface CorpoDaDoacao {
  amountCents: number
  nome?: string
  cpfCnpj?: string
}

/** Validacao a mao: os repos Vive nao tem zod e quatro campos nao justificam a lib. */
function lerCorpo(corpo: unknown): CorpoDaDoacao | null {
  if (typeof corpo !== 'object' || corpo === null) return null
  const c = corpo as Record<string, unknown>
  const { amountCents } = c
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents)) return null
  if (amountCents < MIN_CENTAVOS || amountCents > MAX_CENTAVOS) return null
  const nome = typeof c.nome === 'string' && c.nome.length <= 120 ? c.nome : undefined
  const cpfCnpj = typeof c.cpfCnpj === 'string' ? c.cpfCnpj : undefined
  return { amountCents, nome, cpfCnpj }
}

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function daquiA(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { error: 'Valor invalido. Minimo R$5,00, maximo R$1.000.000,00.' },
      { status: 400 }
    )
  }

  const { amountCents } = dados
  const valor = amountCents / 100
  const id = randomUUID()
  const refer = montarReferenciaDoacao(id)

  // Doacao nao pede CPF na tela. O Asaas exige documento para criar cliente,
  // entao sem documento informado a cobranca avulsa nao acontece e o fluxo
  // continua no Stripe. A referencia fica pronta para quando o documento vier
  // do formulario.
  const documentoInformado = dados.cpfCnpj ? apenasDigitos(dados.cpfCnpj) : ''
  const temDocumento = documentoInformado.length === 11 || documentoInformado.length === 14

  try {
    const cliente = await createOrFindCustomer({
      name: dados.nome?.trim() || 'Doador Vive Gostoso',
      cpfCnpj: temDocumento ? documentoInformado : SEM_DOCUMENTO,
      externalReference: id,
    })

    const checkout = await createCheckout({
      name: 'Doacao — Vive Gostoso',
      value: valor,
      dueDate: daquiA(3),
      billingTypes: ['PIX', 'BOLETO', 'CREDIT_CARD'],
      description: 'Apoio a plataforma comunitaria de Paraty, RJ. Cada real fica na cidade.',
      externalReference: refer,
      successUrl: `${request.nextUrl.origin}/apoie?doacao=success`,
      notificationEnabled: true,
    })

    if (checkout.url) {
      return NextResponse.json({ url: checkout.url, provider: 'asaas' })
    }

    const cobranca = await createCharge({
      customer: cliente.id,
      billingType: 'PIX',
      value: valor,
      dueDate: daquiA(3),
      description: 'Doacao — Vive Gostoso',
      externalReference: refer,
    })
    return NextResponse.json({ url: cobranca.invoiceUrl, provider: 'asaas' })
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : String(err)
    console.error('[api/doacao] falha ao abrir cobranca Asaas:', mensagem)
    return NextResponse.json({ error: 'Nao foi possivel abrir a doacao.' }, { status: 502 })
  }
}
