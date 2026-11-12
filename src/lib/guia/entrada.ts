// KAN-686: valida e limpa o corpo do pedido ao guia. Nada que venha do navegador ou do app e confiado.

import { GUIA } from './config'
import { normalizarTexto } from './filtro'

export type Mensagem = { role: 'user' | 'assistant'; content: string }

export const PERFIS = ['casal', 'familia', 'amigos', 'sozinho'] as const
export const INTERESSES = ['praias', 'kitesurf', 'passeios', 'gastronomia', 'calmaria', 'festas', 'cultura'] as const
export const ORCAMENTOS = ['economico', 'medio', 'sem_limite'] as const

export type PedidoDeRoteiro = {
  tipo: 'roteiro'
  dias: number
  perfil: (typeof PERFIS)[number]
  interesses: (typeof INTERESSES)[number][]
  orcamento: (typeof ORCAMENTOS)[number]
}

export type EntradaValida = { ok: true; mensagens: Mensagem[]; ultimaDoUsuario: string } | { ok: false; erro: string }

/** Pedido estruturado do botao Montar roteiro: so valores da lista, nunca texto livre. Vira uma frase montada aqui. */
export function pedidoDeRoteiroParaTexto(p: PedidoDeRoteiro): string {
  const nomesPerfil: Record<PedidoDeRoteiro['perfil'], string> = { casal: 'um casal', familia: 'uma familia', amigos: 'um grupo de amigos', sozinho: 'uma pessoa viajando sozinha' }
  const nomesOrc: Record<PedidoDeRoteiro['orcamento'], string> = { economico: 'orcamento economico', medio: 'orcamento medio', sem_limite: 'sem limite de orcamento' }
  return `Monte um roteiro de ${p.dias} dia${p.dias > 1 ? 's' : ''} em Sao Miguel do Gostoso para ${nomesPerfil[p.perfil]}, interessados em ${p.interesses.join(', ')}, com ${nomesOrc[p.orcamento]}. Organize por dia e cite so o que as ferramentas devolverem.`
}

function validarRoteiro(c: Record<string, unknown>): PedidoDeRoteiro | null {
  const dias = Number(c.dias)
  if (!Number.isInteger(dias) || dias < 1 || dias > 10) return null
  const perfil = PERFIS.find((p) => p === c.perfil)
  const orcamento = ORCAMENTOS.find((o) => o === c.orcamento)
  if (!perfil || !orcamento) return null
  if (!Array.isArray(c.interesses) || c.interesses.length < 1 || c.interesses.length > INTERESSES.length) return null
  const interesses: PedidoDeRoteiro['interesses'] = []
  for (const i of c.interesses) {
    const ok = INTERESSES.find((x) => x === i)
    if (!ok) return null
    if (!interesses.includes(ok)) interesses.push(ok)
  }
  return { tipo: 'roteiro', dias, perfil, interesses, orcamento }
}

export function validarEntrada(corpo: unknown): EntradaValida {
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) return { ok: false, erro: 'corpo_invalido' }
  const c = corpo as Record<string, unknown>

  if (c.tipo === 'roteiro') {
    const p = validarRoteiro(c)
    if (!p) return { ok: false, erro: 'roteiro_invalido' }
    const texto = pedidoDeRoteiroParaTexto(p)
    return { ok: true, mensagens: [{ role: 'user', content: texto }], ultimaDoUsuario: texto }
  }

  if (!Array.isArray(c.mensagens) || c.mensagens.length === 0) return { ok: false, erro: 'sem_mensagens' }
  if (c.mensagens.length > GUIA.maxTurnos * 2) return { ok: false, erro: 'historico_longo' }

  const mensagens: Mensagem[] = []
  for (const m of c.mensagens) {
    if (typeof m !== 'object' || m === null) return { ok: false, erro: 'mensagem_invalida' }
    const { role, content } = m as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return { ok: false, erro: 'papel_invalido' }
    if (typeof content !== 'string') return { ok: false, erro: 'mensagem_invalida' }
    if (content.length > GUIA.maxCharsMensagem * 3) return { ok: false, erro: 'mensagem_longa' }
    const limpo = normalizarTexto(content)
    if (limpo.length === 0) return { ok: false, erro: 'mensagem_vazia' }
    if (limpo.length > GUIA.maxCharsMensagem) return { ok: false, erro: 'mensagem_longa' }
    mensagens.push({ role, content: limpo })
  }
  if (mensagens[mensagens.length - 1].role !== 'user') return { ok: false, erro: 'ultima_nao_e_do_usuario' }
  const turnosDoUsuario = mensagens.filter((m) => m.role === 'user').length
  if (turnosDoUsuario > GUIA.maxTurnos) return { ok: false, erro: 'historico_longo' }
  return { ok: true, mensagens, ultimaDoUsuario: mensagens[mensagens.length - 1].content }
}
