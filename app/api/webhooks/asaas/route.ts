import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  parseWebhookPayload,
  traduzirEvento,
  validateWebhookToken,
} from '@/lib/asaas/webhook'

export const dynamic = 'force-dynamic'

/**
 * Webhook do Asaas (doacao e plano).
 *
 * Roda com a service role: e o unico caminho que pode ativar plano, porque o
 * trigger `gostoso_guard_business_update` barra a escrita de `plan`/`plan_expires_at`
 * pelo dono autenticado -- exatamente como ja acontecia com o stripe-webhook.
 *
 * O Stripe continua no ar: este handler nao toca em nada das colunas
 * `stripe_*` nem desliga o `stripe-webhook`.
 *
 * IDEMPOTENCIA: o Asaas reentrega o evento quando nao recebe 2xx. A ancora e a
 * linha de `gostoso_asaas_pagamentos`: se ela ja esta `confirmado`, o evento e
 * reconhecido com 200 e nao se aplica efeito de novo. Sem isso, uma reentrega
 * estenderia o plano duas vezes e duplicaria a notificacao.
 */

const STATUS_POR_EVENTO: Record<string, string> = {
  confirmado: 'confirmado',
  vencido: 'vencido',
  estornado: 'estornado',
  falhou: 'falhou',
}

export async function POST(request: Request) {
  const token = request.headers.get('asaas-access-token')
  if (!validateWebhookToken(token, process.env.ASAAS_WEBHOOK_TOKEN)) {
    // 401 e nao 200: token errado e sinal de configuracao, e precisa aparecer.
    return NextResponse.json({ error: 'token do webhook invalido' }, { status: 401 })
  }

  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'corpo invalido' }, { status: 400 })
  }

  const payload = parseWebhookPayload(corpo)
  if (!payload) {
    return NextResponse.json({ error: 'payload nao reconhecido' }, { status: 400 })
  }

  const evento = traduzirEvento(payload.event)
  if (!evento) {
    // Evento fora do escopo: reconhece e ignora, para o Asaas nao reentregar.
    return NextResponse.json({ received: true, ignored: payload.event })
  }

  const admin = createAdminClient()

  // Ancora: primeiro pelo payment id (ja conhecido em reentregas), depois pela
  // referencia externa (primeiro evento da cobranca).
  let linhas = await admin
    .from('gostoso_asaas_pagamentos')
    .select('id, tipo, external_reference, business_id, plan, billing, valor_centavos, status')
    .eq('asaas_payment_id', payload.payment.id)
    .limit(1)

  if (!linhas.data || linhas.data.length === 0) {
    const referencia = payload.payment.externalReference
    if (referencia) {
      linhas = await admin
        .from('gostoso_asaas_pagamentos')
        .select('id, tipo, external_reference, business_id, plan, billing, valor_centavos, status')
        .eq('external_reference', referencia)
        .limit(1)
    }
  }

  const linha = linhas.data?.[0]
  if (!linha) {
    // Sem ancora nao da para saber a que isso pertence. 200 para nao travar a
    // fila do Asaas; o log e o sinal para investigar.
    console.error(
      `[webhook/asaas] evento=${payload.event} payment=${payload.payment.id} ref=${payload.payment.externalReference ?? 'vazio'} sem cobranca correspondente`
    )
    return NextResponse.json({ received: true, unmatched: true })
  }

  // Idempotencia: confirmacao repetida nao reaplica nada.
  if (evento === 'confirmado' && linha.status === 'confirmado') {
    return NextResponse.json({ received: true, deduplicated: true })
  }

  const novoStatus = STATUS_POR_EVENTO[evento]
  const agora = new Date().toISOString()

  const update: Record<string, unknown> = {
    status: novoStatus,
    asaas_payment_id: payload.payment.id,
    updated_at: agora,
  }
  if (evento === 'confirmado') update.confirmado_em = agora

  const { error: erroUpdate } = await admin
    .from('gostoso_asaas_pagamentos')
    .update(update)
    .eq('id', linha.id)

  if (erroUpdate) {
    console.error(`[webhook/asaas] falha ao atualizar cobranca ${linha.id}:`, erroUpdate.message)
    // 500 para o Asaas reentregar: perder a confirmacao deixa cliente pagando
    // sem plano.
    return NextResponse.json({ error: 'falha ao registrar' }, { status: 500 })
  }

  if (evento !== 'confirmado') {
    console.warn(
      `[webhook/asaas] evento=${payload.event} payment=${payload.payment.id} tipo=${linha.tipo} status=${novoStatus}`
    )
    return NextResponse.json({ received: true })
  }

  // Daqui para baixo: pagamento confirmado.

  // Guarda de valor: o valor cobrado tem que bater com o registrado. Divergencia
  // nao ativa plano e fica visivel no log.
  const valorRecebidoCentavos = Math.round((payload.payment.value ?? 0) * 100)
  if (Math.abs(valorRecebidoCentavos - linha.valor_centavos) > 1) {
    console.error(
      `[webhook/asaas] DIVERGENCIA DE VALOR: payment=${payload.payment.id} asaas=${valorRecebidoCentavos} registrado=${linha.valor_centavos}`
    )
    return NextResponse.json({ received: true, status: 'value_mismatch' })
  }

  if (linha.tipo === 'plano' && linha.business_id && linha.plan) {
    const billing = linha.billing ?? 'monthly'
    const ativacao: Record<string, unknown> = { plan: linha.plan }

    if (billing === 'annual') {
      const expira = new Date()
      expira.setFullYear(expira.getFullYear() + 1)
      ativacao.plan_expires_at = expira.toISOString()
      ativacao.asaas_subscription_id = null
    } else {
      ativacao.plan_expires_at = null
      if (payload.payment.subscription) ativacao.asaas_subscription_id = payload.payment.subscription
    }

    const { error: erroPlano } = await admin
      .from('gostoso_businesses')
      .update(ativacao)
      .eq('id', linha.business_id)

    if (erroPlano) {
      console.error(
        `[webhook/asaas] falha ao ativar plano do negocio ${linha.business_id}:`,
        erroPlano.message
      )
      return NextResponse.json({ error: 'falha ao ativar plano' }, { status: 500 })
    }

    const { data: negocio } = await admin
      .from('gostoso_businesses')
      .select('profile_id')
      .eq('id', linha.business_id)
      .maybeSingle()

    if (negocio?.profile_id) {
      const rotulo = linha.plan === 'destaque' ? 'Destaque' : 'Associado'
      const sufixo = billing === 'annual' ? ' por 12 meses' : ''
      const { error: erroNotif } = await admin.from('gostoso_notifications').insert({
        profile_id: negocio.profile_id,
        type: 'plan_activated',
        title: `Plano ${rotulo} ativado${sufixo}!`,
        body: 'Seu negocio agora tem visibilidade ampliada na plataforma.',
        link: '/cadastre/painel',
      })
      if (erroNotif) {
        // Nao derruba o evento: o plano ja esta ativo, e reentregar nao ajuda.
        console.error('[webhook/asaas] falha ao notificar dono:', erroNotif.message)
      }
    }

    return NextResponse.json({ received: true, activated: linha.plan })
  }

  // Doacao: nao ha plano a ativar. A transparencia do fundo le o extrato, que e
  // alimentado fora deste fluxo; aqui so se registra que entrou.
  console.warn(
    `[webhook/asaas] doacao confirmada payment=${payload.payment.id} valor=${linha.valor_centavos}`
  )
  return NextResponse.json({ received: true, donation: true })
}
