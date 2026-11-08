// Painel do parceiro em abas (/cadastre/painel). Tudo aqui e puro (sem rede, sem React):
// a lista de abas, a aba que vale na URL, a navegacao pelo teclado, as janelas de 7 e 30
// dias do resumo, o filtro da lista de contatos, o nome do CSV e o destino das rotas
// antigas (/cadastre/passaporte, /cadastre/negocios, /cadastre/perfil, /cadastre/preview).

import { PLAQUINHAS } from '@/lib/plaquinhas'
import type { LinhaLead } from '@/lib/clube/resgate'

export const ABAS = ['resumo', 'perfil', 'passaporte', 'contatos', 'plaquinha'] as const
export type AbaId = (typeof ABAS)[number]
export const ABA_PADRAO: AbaId = 'resumo'

export const ROTA_PAINEL = '/cadastre/painel'

/** A aba pedida na URL (?aba=contatos ou #contatos), ou null se nao existe. */
export function abaValida(valor: string | null | undefined): AbaId | null {
  const v = (valor ?? '').replace(/^#/, '').trim().toLowerCase()
  return (ABAS as readonly string[]).includes(v) ? (v as AbaId) : null
}

/** A aba que a tela mostra: a do ?aba=, senao a do #hash, senao a primeira. */
export function abaDaUrl(aba: string | null | undefined, hash?: string | null): AbaId {
  return abaValida(aba) ?? abaValida(hash) ?? ABA_PADRAO
}

/** Navegacao das abas pelo teclado (padrao WAI-ARIA de tablist com ativacao automatica):
 *  setas andam e dao a volta, Home vai para a primeira, End para a ultima. Outra tecla: null. */
export function abaPorTecla(atual: AbaId, tecla: string, abas: readonly AbaId[] = ABAS): AbaId | null {
  const i = abas.indexOf(atual)
  if (i < 0 || abas.length === 0) return null
  switch (tecla) {
    case 'ArrowRight':
    case 'ArrowDown':
      return abas[(i + 1) % abas.length]
    case 'ArrowLeft':
    case 'ArrowUp':
      return abas[(i - 1 + abas.length) % abas.length]
    case 'Home':
      return abas[0]
    case 'End':
      return abas[abas.length - 1]
    default:
      return null
  }
}

/** Monta ?aba=...&outros=... a partir dos parametros que ja estao na URL, trocando so a aba.
 *  Parametros que so fazem sentido em outra aba saem junto (ex.: vista=previa). */
export function queryDaAba(atual: URLSearchParams | string, aba: AbaId): string {
  const p = new URLSearchParams(typeof atual === 'string' ? atual : atual.toString())
  p.set('aba', aba)
  if (aba !== 'perfil') p.delete('vista')
  if (aba !== 'resumo') p.delete('new')
  const s = p.toString()
  return s ? `?${s}` : ''
}

/* ---------- resumo: janelas de 7 e 30 dias ---------- */

export const JANELAS_DIAS = [7, 30] as const

const DIA_MS = 86_400_000

/** O instante (ISO) a partir do qual um cupom conta na janela de `dias` dias: agora menos
 *  N * 24 h. E o que vai no filtro `created_at >= corte` / `usado_em >= corte`. */
export function corteDaJanela(agora: Date, dias: number): string {
  return new Date(agora.getTime() - dias * DIA_MS).toISOString()
}

export interface VistaDia {
  dia: string
  n: number
}

/** Hoje no fuso de Gostoso (AAAA-MM-DD), a mesma conta do resto da area do parceiro. */
export function hojeNoFuso(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(agora)
}

/** AAAA-MM-DD menos N dias (so calendario, sem fuso). */
export function diaMenos(dia: string, dias: number): string {
  const [a, m, d] = dia.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d - dias)).toISOString().slice(0, 10)
}

/** Soma de vistas da vantagem nos ultimos `dias` dias, contando o dia de hoje
 *  (7 dias = hoje e os 6 anteriores). Linha com n invalido nao entra. */
export function somarVistas(linhas: readonly VistaDia[], hoje: string, dias: number): number {
  const desde = diaMenos(hoje, dias - 1)
  let total = 0
  for (const l of linhas) {
    if (l.dia >= desde && l.dia <= hoje && Number.isFinite(l.n) && l.n > 0) total += l.n
  }
  return total
}

/* ---------- contatos: busca e CSV ---------- */

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Filtra a lista de contatos por nome, e-mail, telefone ou codigo do cupom. Ignora acento,
 *  caixa, mascara do telefone e o "GP-" do codigo. Busca vazia devolve a lista inteira. */
export function filtrarLeads<T extends LinhaLead>(linhas: readonly T[], busca: string): T[] {
  const q = semAcento(busca).trim()
  if (q === '') return [...linhas]
  const qDigitos = q.replace(/\D/g, '')
  const qCodigo = q.replace(/[^a-z0-9]/g, '').replace(/^gp(?=[a-z0-9]{3,})/, '')
  return linhas.filter((l) => {
    if (semAcento(l.nome).includes(q) || semAcento(l.email).includes(q)) return true
    if (qDigitos.length >= 3 && l.telefone.replace(/\D/g, '').includes(qDigitos)) return true
    return qCodigo.length >= 4 && l.codigo.toLowerCase().includes(qCodigo)
  })
}

/** Nome do arquivo baixado: passaporte-contatos-<slug>-AAAA-MM-DD.csv, sem caractere estranho. */
export function nomeDoArquivoCsv(slug: string, hoje: string): string {
  const s = semAcento(slug).replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  return `passaporte-contatos${s ? `-${s}` : ''}-${hoje}.csv`
}

/* ---------- plaquinha ---------- */

export const URL_BASE_PLAQUINHA = 'https://www.vivegostoso.com.br/p'

/** Os codigos das plaquinhas (01 a 99) que apontam para o negocio, principal ou extra, em ordem. */
export function codigosDaPlaquinha(slug: string): string[] {
  return Object.entries(PLAQUINHAS)
    .filter(([, p]) => p.slug === slug || (p.extras ?? []).some((e) => e.slug === slug))
    .map(([codigo]) => codigo)
    .sort()
}

export function urlDaPlaquinha(codigo: string): string {
  return `${URL_BASE_PLAQUINHA}/${codigo}`
}

/* ---------- rotas antigas ---------- */

export type RotaAntiga = 'passaporte' | 'negocios' | 'perfil' | 'preview'

type Parametros = Record<string, string | string[] | undefined>

function um(v: string | string[] | undefined): string | null {
  const x = Array.isArray(v) ? v[0] : v
  return x && x.trim() !== '' ? x : null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Para onde cada tela antiga vai dentro do painel. `perfil` sem bizId e a tela de CRIAR
 *  negocio: continua onde esta (null). Um bizId que nao e um UUID e descartado. */
export function destinoDaRotaAntiga(rota: RotaAntiga, params: Parametros = {}): string | null {
  const q = new URLSearchParams()
  const biz = um(params.bizId)
  const bizOk = biz && UUID.test(biz) ? biz : null
  switch (rota) {
    case 'passaporte':
      q.set('aba', 'passaporte')
      break
    case 'negocios':
      q.set('aba', 'resumo')
      if (um(params.new) === '1') q.set('new', '1')
      break
    case 'perfil':
      if (!bizOk) return null
      q.set('aba', 'perfil')
      break
    case 'preview':
      q.set('aba', 'perfil')
      q.set('vista', 'previa')
      break
  }
  if (bizOk) q.set('bizId', bizOk)
  return `${ROTA_PAINEL}?${q.toString()}`
}
