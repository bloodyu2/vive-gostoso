// app/api/clube/perguntar/route.ts
// KAN-896: envia, por e-mail, a pergunta "voce usou o cupom?" um dia depois do resgate, so a
// quem marcou a caixa propria da pergunta. Quem chama e o Vercel Cron (vercel.json), uma vez
// por dia as 09:00 de Gostoso, com `Authorization: Bearer $CRON_SECRET`.
//
// DESLIGADA POR PADRAO. So envia com CLUBE_PERGUNTA_ATIVA=1, e so se as credenciais de e-mail
// e a chave de servico estiverem no ambiente. Sem elas a rota responde o que falta e nao faz
// nada. `?seco=1` conta quem entraria na fila sem reservar nem enviar.
//
// A rota nao grava dado pessoal em log nem na resposta: so contagens.
import { createHash, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { dentroDaJanela, idiomaDaPergunta, linhaValida, montarEmail, urlDaResposta } from '@/lib/clube/pergunta'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const SITE = 'https://www.vivegostoso.com.br'
const POR_RODADA = 50
const PAUSA_MS = 1000

const resposta = (corpo: Record<string, unknown>, status = 200) =>
  Response.json(corpo, { status, headers: { 'cache-control': 'no-store' } })

/** Compara o segredo sem vazar o tamanho nem o ponto da diferenca. */
function segredoConfere(recebido: string | null, esperado: string): boolean {
  if (!recebido) return false
  const a = createHash('sha256').update(recebido).digest()
  const b = createHash('sha256').update(`Bearer ${esperado}`).digest()
  return timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET
  // Sem CRON_SECRET a rota esta desligada: responde 200 sem tocar em nada, para o cron diario
  // nao falhar enquanto as variaveis nao foram postas. Com ele, so quem manda o segredo passa.
  if (!segredo) return resposta({ estado: 'desligado' })
  if (!segredoConfere(req.headers.get('authorization'), segredo)) {
    return resposta({ erro: 'nao_autorizado' }, 401)
  }

  const seco = new URL(req.url).searchParams.get('seco') === '1'
  const ativa = process.env.CLUBE_PERGUNTA_ATIVA === '1'
  if (!ativa && !seco) return resposta({ estado: 'desligado' })

  const faltam = [
    'SUPABASE_SERVICE_ROLE_KEY',
    ...(seco ? [] : ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CLUBE_PERGUNTA_REMETENTE']),
  ].filter((n) => !process.env[n])
  if (faltam.length) return resposta({ estado: 'sem_configuracao', faltam })

  const agora = new Date()
  if (!seco && !dentroDaJanela(agora)) return resposta({ estado: 'fora_da_janela' })

  const banco = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (seco) {
    const { data, error } = await banco.rpc('gostoso_club_pergunta_contar')
    if (error) return resposta({ estado: 'erro_banco' }, 500)
    return resposta({ estado: 'seco', na_fila: data, ativa })
  }

  const { data: fila, error } = await banco.rpc('gostoso_club_pergunta_reservar', { p_limite: POR_RODADA })
  if (error || !Array.isArray(fila)) return resposta({ estado: 'erro_banco' }, 500)

  const porta = Number(process.env.SMTP_PORT)
  const transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: porta,
    secure: porta === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  const remetente = process.env.CLUBE_PERGUNTA_REMETENTE!

  let enviados = 0
  let falhas = 0
  for (const linha of fila as unknown[]) {
    if (!linhaValida(linha)) {
      falhas += 1
      const id = (linha as { id?: unknown } | null)?.id
      if (typeof id === 'string') await banco.rpc('gostoso_club_pergunta_falhou', { p_id: id })
      continue
    }
    const idioma = idiomaDaPergunta(linha.idioma)
    const email = montarEmail({
      idioma,
      nome: linha.nome,
      negocio: linha.negocio,
      beneficio: linha.beneficio,
      url: urlDaResposta(SITE, idioma, linha.resposta_token),
    })
    try {
      await transporte.sendMail({
        from: remetente,
        to: linha.email,
        replyTo: 'contato@vivegostoso.com.br',
        subject: email.assunto,
        text: email.texto,
        html: email.html,
      })
      enviados += 1
    } catch {
      falhas += 1
      await banco.rpc('gostoso_club_pergunta_falhou', { p_id: linha.id })
    }
    await new Promise((r) => setTimeout(r, PAUSA_MS))
  }

  return resposta({ estado: 'enviado', reservados: fila.length, enviados, falhas })
}
