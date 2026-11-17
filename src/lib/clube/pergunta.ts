// Pergunta "voce usou o cupom?" do Passaporte Gostoso (KAN-896). Tudo aqui e puro: monta o
// e-mail, decide a janela de envio e interpreta as respostas do banco. O envio e a chamada
// ao banco ficam na rota app/api/clube/perguntar, que so liga com o ambiente configurado.

import { primeiroNome } from './resgate'

/** Versao do consentimento da pergunta (AAAA-MM-DD). Muda quando o texto muda. Vai gravada
 *  junto com o texto exato que a pessoa leu. */
export const PERGUNTA_VERSAO = '2026-11-16'

export type IdiomaPergunta = 'pt' | 'en' | 'es'

export function idiomaDaPergunta(valor: string | null | undefined): IdiomaPergunta {
  return valor === 'en' || valor === 'es' ? valor : 'pt'
}

/** Janela de envio: das 9h as 20h (hora de Gostoso, UTC-3, sem horario de verao). Fora dela
 *  a rota nao envia, para ninguem receber a pergunta de madrugada. */
export const HORA_INICIO = 9
export const HORA_FIM = 20

export function horaEmGostoso(agora: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Fortaleza', hour: '2-digit', hourCycle: 'h23' }).format(agora),
  )
}

export function dentroDaJanela(agora: Date): boolean {
  const h = horaEmGostoso(agora)
  return h >= HORA_INICIO && h < HORA_FIM
}

export function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

/** Endereco da pagina de resposta. O token e o da pergunta (64 hex), nunca o do cupom. */
export function urlDaResposta(base: string, idioma: IdiomaPergunta, token: string): string {
  const raiz = base.replace(/\/+$/, '')
  return `${raiz}${idioma === 'pt' ? '' : `/${idioma}`}/clube/usei/${token}`
}

export interface DadosEmail {
  idioma: IdiomaPergunta
  nome: string
  negocio: string
  beneficio: string
  url: string
}

export interface EmailPergunta {
  assunto: string
  texto: string
  html: string
}

interface Modelo {
  assunto: string
  saudacao: string
  corpo: string
  chamada: string
  botao: string
  porque: string
  assinatura: string
  duvida: string
}

const MODELOS: Record<IdiomaPergunta, Modelo> = {
  pt: {
    assunto: 'Você usou o cupom do {negocio}?',
    saudacao: 'Oi, {nome}.',
    corpo: 'Você pegou um cupom do Passaporte Gostoso em {negocio}. Vantagem: {beneficio}.',
    chamada: 'Já usou? Conta para a gente, é um toque só.',
    botao: 'Responder',
    porque:
      'Você recebeu este e-mail porque marcou a caixa para o Vive Gostoso perguntar se você usou o cupom. Não vamos escrever de novo sobre ele.',
    assinatura: 'Vive Gostoso',
    duvida: 'Dúvidas: contato@vivegostoso.com.br',
  },
  en: {
    assunto: 'Did you use the {negocio} coupon?',
    saudacao: 'Hi, {nome}.',
    corpo: 'You picked up a Gostoso Passport coupon at {negocio}. Perk: {beneficio}.',
    chamada: 'Did you use it? Tell us, it takes one tap.',
    botao: 'Answer',
    porque:
      'You got this e-mail because you ticked the box asking Vive Gostoso to check whether you used the coupon. We will not write again about it.',
    assinatura: 'Vive Gostoso',
    duvida: 'Questions: contato@vivegostoso.com.br',
  },
  es: {
    assunto: '¿Usaste el cupón de {negocio}?',
    saudacao: 'Hola, {nome}.',
    corpo: 'Recogiste un cupón del Pasaporte Gostoso en {negocio}. Ventaja: {beneficio}.',
    chamada: '¿Ya lo usaste? Cuéntanos, es un solo toque.',
    botao: 'Responder',
    porque:
      'Recibiste este correo porque marcaste la casilla para que Vive Gostoso te pregunte si usaste el cupón. No volveremos a escribirte sobre él.',
    assinatura: 'Vive Gostoso',
    duvida: 'Dudas: contato@vivegostoso.com.br',
  },
}

const preencher = (modelo: string, v: Record<string, string>) =>
  modelo.replace(/\{(\w+)\}/g, (_m, k: string) => v[k] ?? '')

/** O texto do e-mail. O assunto e o corpo em texto puro saem sem escape; o HTML escapa tudo
 *  que veio de fora (nome, negocio, vantagem). Sem emoji, sem travessao. */
export function montarEmail(d: DadosEmail): EmailPergunta {
  const m = MODELOS[d.idioma]
  const nome = primeiroNome(d.nome)
  const v ={ nome, negocio: d.negocio, beneficio: d.beneficio.replace(/[.\s]+$/, '') }

  const linhas = [preencher(m.saudacao, v), preencher(m.corpo, v), m.chamada, `${m.botao}: ${d.url}`, m.porque, m.assinatura, m.duvida]
  const texto = linhas.join('\n\n')

  const e = (s: string) => escaparHtml(preencher(s, v))
  const html = `<!doctype html><html lang="${d.idioma}"><body style="margin:0;background:#F5F2EE;font-family:Arial,Helvetica,sans-serif;color:#1A1A1A">
<div style="max-width:480px;margin:0 auto;padding:24px 20px">
<p style="font-size:16px;line-height:1.5;margin:0 0 16px">${e(m.saudacao)}</p>
<p style="font-size:16px;line-height:1.5;margin:0 0 16px">${e(m.corpo)}</p>
<p style="font-size:16px;line-height:1.5;margin:0 0 20px">${escaparHtml(m.chamada)}</p>
<p style="margin:0 0 24px"><a href="${escaparHtml(d.url)}" style="display:inline-block;background:#0D7C7C;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:12px 24px;border-radius:8px">${escaparHtml(m.botao)}</a></p>
<p style="font-size:13px;line-height:1.5;color:#555555;margin:0 0 16px">${escaparHtml(m.porque)}</p>
<p style="font-size:13px;line-height:1.5;color:#555555;margin:0">${escaparHtml(m.assinatura)}<br>${escaparHtml(m.duvida)}</p>
</div></body></html>`

  return { assunto: preencher(m.assunto, v), texto, html }
}

/** Uma linha da fila, como a funcao gostoso_club_pergunta_reservar devolve. */
export interface LinhaFila {
  id: string
  nome: string
  email: string
  idioma: string | null
  resposta_token: string
  negocio: string
  beneficio: string
  codigo: string
  expira_em: string
}

export function linhaValida(l: unknown): l is LinhaFila {
  if (!l || typeof l !== 'object') return false
  const r = l as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.nome === 'string' &&
    typeof r.email === 'string' &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email) &&
    typeof r.resposta_token === 'string' &&
    /^[0-9a-f]{64}$/.test(r.resposta_token) &&
    typeof r.negocio === 'string' &&
    typeof r.beneficio === 'string'
  )
}

export type RespostaUso = 'sim' | 'nao'

export type ResultadoResposta =
  | { tipo: 'ok'; resposta: RespostaUso }
  | { tipo: 'erro'; motivo: 'invalido' | 'cancelado' | 'erro' }

/** A resposta de gostoso_club_responder_uso() em algo que a tela entende. */
export function interpretarResposta(data: unknown, error: unknown): ResultadoResposta {
  const r = data as { ok?: boolean; resposta?: unknown; motivo?: unknown } | null
  if (error || !r || typeof r !== 'object') return { tipo: 'erro', motivo: 'erro' }
  if (r.ok === true && (r.resposta === 'sim' || r.resposta === 'nao')) return { tipo: 'ok', resposta: r.resposta }
  if (r.motivo === 'invalido' || r.motivo === 'cancelado') return { tipo: 'erro', motivo: r.motivo }
  return { tipo: 'erro', motivo: 'erro' }
}
