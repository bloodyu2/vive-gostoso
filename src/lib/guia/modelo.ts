// KAN-686: chamada ao modelo (API compativel com OpenAI) com ate N rodadas de ferramenta.
// A chave vem do ambiente do servidor e nunca sai daqui.

import { GUIA, type ConfigDoGuia } from './config'
import { DEFINICOES_DE_FERRAMENTA, type ResultadoDeFerramenta } from './ferramentas'
import { envelopeDeDado, SISTEMA } from './prompt'
import type { Mensagem } from './entrada'

export class GuiaIndisponivel extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'GuiaIndisponivel'
  }
}

type MensagemApi =
  | { role: 'system' | 'user' | 'assistant'; content: string | null; tool_calls?: ChamadaDeFerramenta[] }
  | { role: 'tool'; tool_call_id: string; content: string }

type ChamadaDeFerramenta = { id: string; type: 'function'; function: { name: string; arguments: string } }

export type ResultadoDoModelo = { texto: string; slugs: Set<string>; rodadas: number }

export type Executor = (nome: string, argumentos: unknown) => Promise<ResultadoDeFerramenta>

export async function conversar(
  mensagens: Mensagem[],
  executar: Executor,
  config: Pick<ConfigDoGuia, 'base' | 'modelo' | 'chave'>,
  chamar: typeof fetch = fetch,
): Promise<ResultadoDoModelo> {
  if (!config.chave) throw new GuiaIndisponivel('sem_chave')

  const conversa: MensagemApi[] = [{ role: 'system', content: SISTEMA }, ...mensagens.map((m) => ({ role: m.role, content: m.content }) as MensagemApi)]
  const slugs = new Set<string>()

  for (let rodada = 0; rodada <= GUIA.rodadasDeFerramenta; rodada++) {
    const podeUsarFerramenta = rodada < GUIA.rodadasDeFerramenta
    const controle = new AbortController()
    const tempo = setTimeout(() => controle.abort(), GUIA.prazoDoModeloMs)
    let resposta: Response
    try {
      resposta = await chamar(`${config.base}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${config.chave}` },
        body: JSON.stringify({
          model: config.modelo,
          messages: conversa,
          max_tokens: GUIA.maxTokensSaida,
          temperature: 0.3,
          ...(podeUsarFerramenta ? { tools: DEFINICOES_DE_FERRAMENTA, tool_choice: 'auto' } : {}),
        }),
        signal: controle.signal,
      })
    } catch {
      throw new GuiaIndisponivel('rede')
    } finally {
      clearTimeout(tempo)
    }
    if (!resposta.ok) throw new GuiaIndisponivel(`http_${resposta.status}`)

    let corpo: { choices?: { message?: { content?: string | null; tool_calls?: ChamadaDeFerramenta[] } }[] }
    try {
      corpo = await resposta.json()
    } catch {
      throw new GuiaIndisponivel('resposta_ilegivel')
    }
    const msg = corpo.choices?.[0]?.message
    if (!msg) throw new GuiaIndisponivel('sem_mensagem')

    const chamadas = (msg.tool_calls ?? []).slice(0, 3)
    if (chamadas.length === 0 || !podeUsarFerramenta) {
      return { texto: String(msg.content ?? ''), slugs, rodadas: rodada }
    }

    conversa.push({ role: 'assistant', content: msg.content ?? null, tool_calls: chamadas })
    for (const c of chamadas) {
      let argumentos: unknown
      try {
        argumentos = JSON.parse(c.function.arguments || '{}')
      } catch {
        argumentos = {}
      }
      const r = await executar(c.function.name, argumentos)
      r.slugs.forEach((s) => slugs.add(s))
      conversa.push({ role: 'tool', tool_call_id: c.id, content: envelopeDeDado(c.function.name, r.json) })
    }
  }
  throw new GuiaIndisponivel('rodadas_esgotadas')
}
