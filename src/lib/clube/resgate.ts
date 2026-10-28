// Resgate do Passaporte Gostoso: o turista informa nome, e-mail e telefone, autoriza o
// repasse ao estabelecimento e recebe um cupom de uso unico. Tudo aqui e puro (sem
// rede, sem banco) e tem o espelho em SQL na migration 20261028100000: o servidor
// valida de novo, porque o navegador nao e confiavel.

/** Versao da politica de privacidade que o consentimento aceita (AAAA-MM-DD).
 *  Muda quando o texto da politica muda; vai gravada em cada resgate. */
export const POLITICA_VERSAO = '2026-10-28'

/** Alfabeto do codigo curto: sem 0, O, 1, I e L, para ler e digitar sem erro. */
export const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODIGO = new RegExp(`^[${ALFABETO_CODIGO}]{8}$`)

export function limparNome(nome: string): string {
  return nome.replace(/\s+/g, ' ').trim()
}

export function nomeValido(nome: string): boolean {
  const n = limparNome(nome)
  return n.length >= 2 && n.length <= 80
}

export function primeiroNome(nome: string): string {
  return limparNome(nome).split(' ')[0] ?? ''
}

export function emailValido(email: string): boolean {
  const e = email.trim()
  if (e.length < 5 || e.length > 254) return false
  if (/\s/.test(e) || e.includes('..')) return false
  return /^[^@\s]+@[^@\s.][^@\s]*\.[^@\s.]+$/.test(e)
}

/** Telefone brasileiro so com digitos, DDD mais numero (10 ou 11 digitos), ou null.
 *  Aceita mascara, espacos e o +55 na frente. Celular (11 digitos) comeca com 9. */
export function normalizarTelefone(bruto: string): string | null {
  let d = bruto.replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (d.length !== 10 && d.length !== 11) return null
  const ddd = Number(d.slice(0, 2))
  if (ddd < 11 || ddd > 99) return null
  if (d.length === 11 && d[2] !== '9') return null
  return d
}

/** Mascara progressiva: (84) 99999-1234 ou (84) 3236-1234. */
export function mascararTelefone(bruto: string): string {
  let d = bruto.replace(/\D/g, '')
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  d = d.slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (d.length <= 6) return `(${ddd}) ${resto}`
  if (d.length <= 10) return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`
}

export interface EntradaResgate {
  nome: string
  email: string
  telefone: string
  consentimento: boolean
}

export type ResultadoValidacao =
  | { ok: true; dados: { nome: string; email: string; telefone: string } }
  | { ok: false; campo: 'nome' | 'email' | 'telefone' | 'consentimento' }

/** Valida na ordem em que a pessoa preenche e devolve os dados ja limpos. */
export function validarResgate(e: EntradaResgate): ResultadoValidacao {
  if (!nomeValido(e.nome)) return { ok: false, campo: 'nome' }
  if (!emailValido(e.email)) return { ok: false, campo: 'email' }
  const telefone = normalizarTelefone(e.telefone)
  if (!telefone) return { ok: false, campo: 'telefone' }
  if (!e.consentimento) return { ok: false, campo: 'consentimento' }
  return {
    ok: true,
    dados: { nome: limparNome(e.nome), email: e.email.trim().toLowerCase(), telefone },
  }
}

/** O texto exato que a pessoa le ao lado da caixa de consentimento. Em uma passada e com
 *  funcao, para o nome do negocio nunca ser lido como padrao de substituicao. */
export function textoConsentimento(modelo: string, negocio: string): string {
  return modelo.replace(/\{negocio\}/g, () => negocio)
}

/** O que o dono digita (GP-7K4Q-9XMB, gp 7k4q 9xmb...) vira os 8 caracteres do codigo,
 *  ou null se nao for um codigo possivel. */
export function codigoCurtoNormalizado(entrada: string): string | null {
  let c = entrada.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (c.length === 10 && c.startsWith('GP')) c = c.slice(2)
  return CODIGO.test(c) ? c : null
}

export function formatarCodigo(c8: string): string {
  return `GP-${c8.slice(0, 4)}-${c8.slice(4)}`
}

export interface LinhaLead {
  nome: string
  email: string
  telefone: string
  codigo: string
  status: string
  created_at: string
  expira_em: string
}

function dataHoraDeGostoso(iso: string): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? ''
  return `${p('year')}-${p('month')}-${p('day')} ${p('hour')}:${p('minute')}`
}

/** Uma celula do CSV: aspas quando preciso e, no comeco, um apostrofo em quem a planilha
 *  leria como formula (=, +, -, @), que e o jeito de alguem plantar comando no nome. */
function celula(valor: string): string {
  let v = valor
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** Marca de ordem de bytes: faz o Excel abrir o CSV como UTF-8, com acento certo. */
export const BOM = String.fromCharCode(0xfeff)

const CABECALHO ='nome,email,telefone,codigo,status,resgatado_em,valido_ate'

/** Lista de resgates em CSV (com BOM, para o Excel abrir com acento). */
export function csvDeLeads(linhas: LinhaLead[]): string {
  const corpo = linhas.map((l) =>
    [
      l.nome,
      l.email,
      mascararTelefone(l.telefone),
      formatarCodigo(l.codigo),
      l.status,
      dataHoraDeGostoso(l.created_at),
      l.expira_em,
    ]
      .map(celula)
      .join(','),
  )
  return `${BOM}${[CABECALHO, ...corpo].join('\r\n')}`
}

export type MotivoResgate =
  | 'consentimento'
  | 'nome'
  | 'email'
  | 'telefone'
  | 'indisponivel'
  | 'ja_tem'
  | 'esgotada'
  | 'muitos'
  | 'erro'

export type ResultadoResgate =
  | { tipo: 'ok'; token: string; codigo: string }
  | { tipo: 'erro'; motivo: MotivoResgate }

const MOTIVOS: ReadonlySet<string> = new Set([
  'consentimento',
  'nome',
  'email',
  'telefone',
  'indisponivel',
  'ja_tem',
  'esgotada',
  'muitos',
])

/** A resposta de gostoso_club_resgatar() em algo que a tela entende. So devolve cupom quando
 *  o token e o codigo tem o formato certo; qualquer outra coisa e erro. */
export function interpretarResgate(data: unknown, error: unknown): ResultadoResgate {
  const r = data as { ok?: boolean; token?: unknown; codigo?: unknown; motivo?: unknown } | null
  if (error || !r || typeof r !== 'object') return { tipo: 'erro', motivo: 'erro' }
  if (r.ok === true) {
    return typeof r.token === 'string' && /^[0-9a-f]{64}$/.test(r.token) && typeof r.codigo === 'string' && CODIGO.test(r.codigo)
      ? { tipo: 'ok', token: r.token, codigo: r.codigo }
      : { tipo: 'erro', motivo: 'erro' }
  }
  return typeof r.motivo === 'string' && MOTIVOS.has(r.motivo)
    ? { tipo: 'erro', motivo: r.motivo as MotivoResgate }
    : { tipo: 'erro', motivo: 'erro' }
}
