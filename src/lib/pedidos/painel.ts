// Painel de pedidos do dono do negocio (aba Pedidos de /cadastre/painel, KAN-907).
// Tudo aqui e puro (sem rede e sem React): estados do pedido, o proximo passo, os grupos da tela,
// quais pedidos sao novos desde a ultima leitura, preco digitado, titulo da aba e resumo do dia.
// A regra de negocio (preco, abertura, quem pode avancar) continua no banco; este arquivo so
// decide o que mostrar e o que oferecer. O servidor recusa o que nao for permitido.

export type StatusPedido = 'recebido' | 'aceito' | 'preparo' | 'pronto' | 'a_caminho' | 'entregue' | 'cancelado'
export type FormaPagto = 'pix' | 'cartao_entrega' | 'dinheiro'

export interface ItemDoPedido {
  nome: string
  opcao: string | null
  qtd: number
  preco: number
}

export interface PedidoDoDono {
  id: string
  status: StatusPedido
  total: number
  subtotal: number
  taxaEntrega: number
  formaPagto: FormaPagto
  trocoPara: number | null
  endereco: string
  mesa: string | null
  criadoEm: string
  itens: ItemDoPedido[]
}

export interface LojaDoDono {
  businessId: string
  entregaAtiva: boolean
  mesaAtiva: boolean
  aberto: boolean
  tempoMin: number
  tempoMax: number
  pedidoMinimo: number
  taxaEntrega: number
  horario: string | null
}

export interface ItemDoCardapio {
  id: string
  secao: string
  nome: string
  descricao: string | null
  preco: number
  ativo: boolean
  ordem: number
}

export const ESTADOS_ABERTOS: readonly StatusPedido[] = ['recebido', 'aceito', 'preparo', 'pronto', 'a_caminho']

/** O proximo passo que o dono pode dar, ou null. Espelha as regras de vg_app_pedido_avancar:
 *  recebido -> aceito -> preparo -> pronto; so pedido de mesa passa de pronto para entregue
 *  (o de entrega segue com o entregador). O servidor confere de novo. */
export function passoSeguinte(p: Pick<PedidoDoDono, 'status' | 'mesa'>): { para: 'aceito' | 'preparo' | 'pronto' | 'entregue'; chave: string } | null {
  switch (p.status) {
    case 'recebido':
      return { para: 'aceito', chave: 'aceitar' }
    case 'aceito':
      return { para: 'preparo', chave: 'preparar' }
    case 'preparo':
      return { para: 'pronto', chave: 'pronto' }
    case 'pronto':
      return p.mesa ? { para: 'entregue', chave: 'entregue_mesa' } : null
    default:
      return null
  }
}

/** So o pedido recem-chegado pode ser recusado pelo dono (vg_app_pedido_recusar). */
export const podeRecusar = (p: Pick<PedidoDoDono, 'status'>): boolean => p.status === 'recebido'

export interface GruposDePedidos {
  novos: PedidoDoDono[]
  preparo: PedidoDoDono[]
  prontos: PedidoDoDono[]
  encerrados: PedidoDoDono[]
}

const HORA_MS = 3_600_000

/** Separa a lista em quatro grupos. Os mais antigos primeiro nos tres grupos de trabalho (quem
 *  espera ha mais tempo aparece no topo) e os encerrados do mais novo para o mais velho, so as
 *  ultimas 24 horas. */
export function agrupar(pedidos: readonly PedidoDoDono[], agora: Date = new Date()): GruposDePedidos {
  const mais_antigo = (a: PedidoDoDono, b: PedidoDoDono) => Date.parse(a.criadoEm) - Date.parse(b.criadoEm)
  const mais_novo = (a: PedidoDoDono, b: PedidoDoDono) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm)
  const corte = agora.getTime() - 24 * HORA_MS
  return {
    novos: pedidos.filter((p) => p.status === 'recebido').sort(mais_antigo),
    preparo: pedidos.filter((p) => p.status === 'aceito' || p.status === 'preparo').sort(mais_antigo),
    prontos: pedidos.filter((p) => p.status === 'pronto' || p.status === 'a_caminho').sort(mais_antigo),
    encerrados: pedidos
      .filter((p) => (p.status === 'entregue' || p.status === 'cancelado') && Date.parse(p.criadoEm) >= corte)
      .sort(mais_novo),
  }
}

/** Ids dos pedidos "recebido" que nao estavam na leitura anterior. Na primeira leitura
 *  (anteriores = null) nada e novo: abrir o painel nao toca o alarme dos pedidos que ja estavam la. */
export function idsNovos(anteriores: ReadonlySet<string> | null, atuais: readonly PedidoDoDono[]): string[] {
  if (!anteriores) return []
  return atuais.filter((p) => p.status === 'recebido' && !anteriores.has(p.id)).map((p) => p.id)
}

/** Os ids dos pedidos "recebido" de uma leitura, para guardar como "visto". */
export const idsRecebidos = (pedidos: readonly PedidoDoDono[]): Set<string> =>
  new Set(pedidos.filter((p) => p.status === 'recebido').map((p) => p.id))

/** Titulo da aba do navegador: "(2) Pedidos" quando ha pedido novo esperando, para chamar a
 *  atencao de quem esta em outra aba. */
export function tituloDaAba(base: string, novos: number): string {
  return novos > 0 ? `(${novos}) ${base}` : base
}

/** Minutos desde o pedido (nunca negativo, para relogio do aparelho adiantado). */
export function minutosDesde(criadoEm: string, agora: Date = new Date()): number {
  const t = Date.parse(criadoEm)
  if (Number.isNaN(t)) return 0
  return Math.max(0, Math.floor((agora.getTime() - t) / 60_000))
}

/** Reais em portugues: R$ 12,50. */
export function brl(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export const PRECO_MAXIMO = 5000

/** Le o que a pessoa digitou como preco ("12,5", "12.50", "R$ 12,50"). Devolve o numero com ate
 *  duas casas, ou null se nao for um valor entre 0,01 e 5.000 (o limite do banco). */
export function lerPreco(texto: string): number | null {
  const limpo = texto.replace(/R\$/gi, '').replace(/\s/g, '')
  if (!limpo) return null
  // "1.234,50" (milhar com ponto e virgula decimal) ou "1234.50" / "1234,50"
  const normal = /,/.test(limpo) ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return null
  const n = Number(normal)
  if (!Number.isFinite(n) || n <= 0 || n > PRECO_MAXIMO) return null
  return Math.round(n * 100) / 100
}

export interface ItemNovoDigitado {
  nome: string
  secao: string
  preco: string
}

/** Confere o item novo do cardapio. Devolve o que vai ao banco ou o motivo da recusa. */
export function validarItemNovo(i: ItemNovoDigitado): { ok: true; nome: string; secao: string; preco: number } | { ok: false; motivo: 'nome' | 'secao' | 'preco' } {
  const nome = i.nome.trim()
  const secao = i.secao.trim()
  if (nome.length < 1 || nome.length > 120) return { ok: false, motivo: 'nome' }
  if (secao.length < 1 || secao.length > 40) return { ok: false, motivo: 'secao' }
  const preco = lerPreco(i.preco)
  if (preco === null) return { ok: false, motivo: 'preco' }
  return { ok: true, nome, secao, preco }
}

export interface HorarioETempo {
  horario: string
  tempoMin: string
  tempoMax: string
}

/** Confere horario e tempo de preparo da loja. O banco limita horario a 60 caracteres,
 *  tempo a 5 a 240 (minimo) e 5 a 300 (maximo), com maximo >= minimo. */
export function validarLoja(v: HorarioETempo): { ok: true; horario: string | null; tempoMin: number; tempoMax: number } | { ok: false; motivo: 'horario' | 'tempo' } {
  const horario = v.horario.trim()
  if (horario.length > 60) return { ok: false, motivo: 'horario' }
  const min = Number(v.tempoMin)
  const max = Number(v.tempoMax)
  if (!Number.isInteger(min) || !Number.isInteger(max)) return { ok: false, motivo: 'tempo' }
  if (min < 5 || min > 240 || max < 5 || max > 300 || max < min) return { ok: false, motivo: 'tempo' }
  return { ok: true, horario: horario === '' ? null : horario, tempoMin: min, tempoMax: max }
}

/** Itens do cardapio por secao, na ordem do banco; secao sem nome cai em "Outros". */
export function cardapioPorSecao(itens: readonly ItemDoCardapio[]): { secao: string; itens: ItemDoCardapio[] }[] {
  const mapa = new Map<string, ItemDoCardapio[]>()
  for (const i of [...itens].sort((a, b) => a.ordem - b.ordem)) {
    const chave = i.secao.trim() || 'Outros'
    mapa.set(chave, [...(mapa.get(chave) ?? []), i])
  }
  return [...mapa.entries()].map(([secao, lista]) => ({ secao, itens: lista }))
}

/** Dia (AAAA-MM-DD) no fuso de Gostoso, para contar "hoje". */
function diaNoFuso(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(d)
}

/** Pedidos entregues hoje (fuso de Gostoso), o que somaram em ITENS (subtotal: a taxa de entrega e de quem entrega, nao
 *  e venda da loja) e os cancelados de hoje. "Hoje" e o dia em que o pedido foi feito. */
export function resumoDeHoje(pedidos: readonly PedidoDoDono[], agora: Date = new Date()): { entregues: number; receita: number; cancelados: number } {
  const hoje = diaNoFuso(agora)
  let entregues = 0
  let receita = 0
  let cancelados = 0
  for (const p of pedidos) {
    if (diaNoFuso(new Date(p.criadoEm)) !== hoje) continue
    if (p.status === 'entregue') {
      entregues += 1
      receita += p.subtotal
    } else if (p.status === 'cancelado') {
      cancelados += 1
    }
  }
  return { entregues, receita: Math.round(receita * 100) / 100, cancelados }
}

/** A loja recebe pedidos pelo app? Sem linha em vg_app_loja ou sem entrega e mesa ligadas, nao:
 *  quem liga e a Vive. A tela explica em vez de mostrar uma lista vazia que parece quebrada. */
export function lojaRecebePedidos(loja: LojaDoDono | null): boolean {
  return !!loja && (loja.entregaAtiva || loja.mesaAtiva)
}
