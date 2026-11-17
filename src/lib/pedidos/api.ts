// Chamadas do painel de pedidos do dono (KAN-907). Nenhuma regra nasce aqui: pedido, loja e
// cardapio sao as tabelas e funcoes que o Super App ja usa (vg_app_*), protegidas por RLS e por
// gostoso_club_sou_dono(business_id). O painel so liga a tela a elas. Se o servidor negar, o erro
// sobe como ErroPainel; nada e contornado.
//
// Um cuidado que o PostgREST pede: UPDATE e DELETE que a RLS nega NAO devolvem erro, devolvem
// zero linhas. Por isso as escritas pedem `select('id')` de volta e tratam lista vazia como negado.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { FormaPagto, ItemDoCardapio, ItemDoPedido, LojaDoDono, PedidoDoDono, StatusPedido } from './painel'

export type MotivoDoErro = 'sem_acesso' | 'passo_invalido' | 'falha'

export class ErroPainel extends Error {
  constructor(
    public readonly motivo: MotivoDoErro,
    detalhe?: string,
  ) {
    super(detalhe ?? motivo)
    this.name = 'ErroPainel'
  }
}

interface ErroSupabase {
  code?: string
  message?: string
  status?: number
}

/** 42501 (permissao) e 401/403 viram sem_acesso; 22023 (passo invalido nas funcoes) vira passo_invalido. */
export function traduzirErro(e: ErroSupabase | null | undefined): ErroPainel {
  const code = e?.code ?? ''
  if (code === '42501' || e?.status === 401 || e?.status === 403 || code === 'PGRST301') return new ErroPainel('sem_acesso', e?.message)
  if (code === '22023') return new ErroPainel('passo_invalido', e?.message)
  return new ErroPainel('falha', e?.message)
}

/** O PostgrestError nao traz o status HTTP; ele vem na resposta. Junta os dois para 401 e 403 sem codigo tambem virarem sem_acesso. */
const comStatus = (e: ErroSupabase, status?: number): ErroSupabase => ({ ...e, status: e.status ?? status })

function conferir<T>(r: { data: T | null; error: ErroSupabase | null; status?: number }): T {
  if (r.error) throw traduzirErro(comStatus(r.error, r.status))
  return r.data as T
}

/** Escrita que a RLS pode negar em silencio: sem linha de volta, nao aconteceu. */
function conferirLinhas(r: { data: unknown[] | null; error: ErroSupabase | null; status?: number }): void {
  if (r.error) throw traduzirErro(comStatus(r.error, r.status))
  if (!r.data || r.data.length === 0) throw new ErroPainel('sem_acesso', 'nenhuma linha alterada')
}

const num = (v: unknown): number => Number(v)

/* ---------- leitura ---------- */

interface LinhaPedido {
  id: string
  status: StatusPedido
  total: number | string
  subtotal: number | string
  taxa_entrega: number | string
  forma_pagto: FormaPagto
  troco_para: number | string | null
  endereco: string
  mesa: string | null
  criado_em: string
  vg_app_pedido_itens: { nome: string; opcao: string | null; qtd: number; preco: number | string }[] | null
}

export const COLUNAS_PEDIDO =
  'id,status,total,subtotal,taxa_entrega,forma_pagto,troco_para,endereco,mesa,criado_em,vg_app_pedido_itens(nome,opcao,qtd,preco)'

export function pedidoDaLinha(l: LinhaPedido): PedidoDoDono {
  const itens: ItemDoPedido[] = (l.vg_app_pedido_itens ?? []).map((i) => ({ nome: i.nome, opcao: i.opcao, qtd: i.qtd, preco: num(i.preco) }))
  return {
    id: l.id,
    status: l.status,
    total: num(l.total),
    subtotal: num(l.subtotal),
    taxaEntrega: num(l.taxa_entrega),
    formaPagto: l.forma_pagto,
    trocoPara: l.troco_para == null ? null : num(l.troco_para),
    endereco: l.endereco,
    mesa: l.mesa,
    criadoEm: l.criado_em,
    itens,
  }
}

/** Os 100 pedidos mais recentes do negocio. A RLS so deixa passar quem e dono dele. */
export async function listarPedidos(c: SupabaseClient, businessId: string, limite = 100): Promise<PedidoDoDono[]> {
  const r = await c.from('vg_app_pedidos').select(COLUNAS_PEDIDO).eq('business_id', businessId).order('criado_em', { ascending: false }).limit(limite)
  return (conferir(r as { data: LinhaPedido[] | null; error: ErroSupabase | null }) ?? []).map(pedidoDaLinha)
}

interface LinhaLoja {
  business_id: string
  entrega_ativa: boolean
  mesa_ativa: boolean
  aberto: boolean
  tempo_min: number
  tempo_max: number
  pedido_minimo: number | string
  taxa_entrega: number | string
  horario: string | null
}

/** A configuracao da loja no Super App, ou null se a Vive ainda nao criou. */
export async function lerLoja(c: SupabaseClient, businessId: string): Promise<LojaDoDono | null> {
  const r = await c
    .from('vg_app_loja')
    .select('business_id,entrega_ativa,mesa_ativa,aberto,tempo_min,tempo_max,pedido_minimo,taxa_entrega,horario')
    .eq('business_id', businessId)
    .maybeSingle()
  const l = conferir(r as { data: LinhaLoja | null; error: ErroSupabase | null })
  if (!l) return null
  return {
    businessId: l.business_id,
    entregaAtiva: l.entrega_ativa,
    mesaAtiva: l.mesa_ativa,
    aberto: l.aberto,
    tempoMin: l.tempo_min,
    tempoMax: l.tempo_max,
    pedidoMinimo: num(l.pedido_minimo),
    taxaEntrega: num(l.taxa_entrega),
    horario: l.horario,
  }
}

/** Em que pe esta a busca de entregador de um pedido pronto: ofertando | geral | aguardando_pronto | atribuido | encerrado. */
export async function faseDoDespacho(c: SupabaseClient, pedidoId: string): Promise<string | null> {
  const r = await c.rpc('vg_app_despacho_resumo', { p_tipo: 'pedido', p_ref: pedidoId })
  const d = conferir(r as { data: { fase?: string } | null; error: ErroSupabase | null })
  return d?.fase ?? null
}

/* ---------- pedido ---------- */

export async function avancarPedido(c: SupabaseClient, pedidoId: string, para: 'aceito' | 'preparo' | 'pronto' | 'entregue'): Promise<void> {
  const r = await c.rpc('vg_app_pedido_avancar', { p_pedido: pedidoId, p_para: para })
  conferir(r as { data: unknown; error: ErroSupabase | null })
}

export async function recusarPedido(c: SupabaseClient, pedidoId: string): Promise<void> {
  const r = await c.rpc('vg_app_pedido_recusar', { p_pedido: pedidoId })
  conferir(r as { data: unknown; error: ErroSupabase | null })
}

/* ---------- loja ---------- */

export async function definirAberto(c: SupabaseClient, businessId: string, aberto: boolean): Promise<void> {
  const r = await c.from('vg_app_loja').update({ aberto }).eq('business_id', businessId).select('business_id')
  conferirLinhas(r as { data: unknown[] | null; error: ErroSupabase | null })
}

export async function salvarHorarioETempo(
  c: SupabaseClient,
  businessId: string,
  v: { horario: string | null; tempoMin: number; tempoMax: number },
): Promise<void> {
  const r = await c
    .from('vg_app_loja')
    .update({ horario: v.horario, tempo_min: v.tempoMin, tempo_max: v.tempoMax })
    .eq('business_id', businessId)
    .select('business_id')
  conferirLinhas(r as { data: unknown[] | null; error: ErroSupabase | null })
}

/* ---------- cardapio ---------- */

interface LinhaCardapio {
  id: string
  secao: string
  nome: string
  descricao: string | null
  preco: number | string
  ativo: boolean
  ordem: number
}

export async function listarCardapio(c: SupabaseClient, businessId: string): Promise<ItemDoCardapio[]> {
  const r = await c.from('vg_app_cardapio').select('id,secao,nome,descricao,preco,ativo,ordem').eq('business_id', businessId).order('ordem', { ascending: true })
  return (conferir(r as { data: LinhaCardapio[] | null; error: ErroSupabase | null }) ?? []).map((i) => ({ ...i, preco: num(i.preco) }))
}

export async function mudarPreco(c: SupabaseClient, itemId: string, preco: number): Promise<void> {
  const r = await c.from('vg_app_cardapio').update({ preco }).eq('id', itemId).select('id')
  conferirLinhas(r as { data: unknown[] | null; error: ErroSupabase | null })
}

export async function definirAtivo(c: SupabaseClient, itemId: string, ativo: boolean): Promise<void> {
  const r = await c.from('vg_app_cardapio').update({ ativo }).eq('id', itemId).select('id')
  conferirLinhas(r as { data: unknown[] | null; error: ErroSupabase | null })
}

export async function criarItem(c: SupabaseClient, businessId: string, i: { secao: string; nome: string; preco: number; ordem?: number }): Promise<void> {
  const r = await c
    .from('vg_app_cardapio')
    .insert({ business_id: businessId, secao: i.secao, nome: i.nome, preco: i.preco, ...(i.ordem === undefined ? {} : { ordem: i.ordem }) })
    .select('id')
  conferirLinhas(r as { data: unknown[] | null; error: ErroSupabase | null })
}

export async function removerItem(c: SupabaseClient, itemId: string): Promise<void> {
  const r = await c.from('vg_app_cardapio').delete().eq('id', itemId).select('id')
  conferirLinhas(r as { data: unknown[] | null; error: ErroSupabase | null })
}
