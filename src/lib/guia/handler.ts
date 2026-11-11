// KAN-686: o que a rota /api/guia faz, com tudo injetavel para teste.
// Ordem das barreiras: metodo e tipo, origem, ligado, tamanho, JSON, forma da entrada, limite do visitante,
// filtro de entrada (inclusive historico forjado), modelo com ferramentas de leitura, filtro de saida.

import { classificar, type MotivoDeRecusa } from './filtro'
import { GUIA, type ConfigDoGuia } from './config'
import { validarEntrada } from './entrada'
import { chaveDoVisitante, type Guarda } from './guarda'
import { conversar, GuiaIndisponivel, type Executor } from './modelo'
import { MENSAGEM_BLOQUEIO, MENSAGEM_INDISPONIVEL, MENSAGEM_LIMITE, RECUSA_FORA_DO_TEMA, RECUSA_REGRAS, SISTEMA } from './prompt'
import { limparResposta } from './resposta'

export type EventoDeLog = {
  evento: 'guia_abuso' | 'guia_bloqueio' | 'guia_vazamento' | 'guia_falha' | 'guia_limite'
  visitante: string
  motivo: string
  trecho?: string
}

export type DepsDoGuia = {
  config: ConfigDoGuia
  guarda: Guarda
  executor: Executor
  chamar?: typeof fetch
  log?: (e: EventoDeLog) => void
}

const CABECALHOS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
} as const

function json(corpo: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CABECALHOS, ...extra } })
}

/** Trecho para o registro do abuso: sem e-mail, sem sequencia longa de numero, no maximo 80 caracteres. */
export function mascarar(texto: string): string {
  return texto.replace(/\S+@\S+\.\S+/g, '[email]').replace(/\d[\d\s.\-()]{4,}\d/g, '[numero]').replace(/\s+/g, ' ').slice(0, 80)
}

function recusaPara(motivo: MotivoDeRecusa): string {
  return motivo === 'injecao' || motivo === 'segredo' ? RECUSA_REGRAS : RECUSA_FORA_DO_TEMA
}

function ipDe(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  return (xff ? xff.split(',')[0] : req.headers.get('x-real-ip') ?? 'desconhecido').trim()
}

/** Trecho do prompt sem as frases de recusa, para o detector de vazamento nao acusar a propria recusa. */
const PROMPT_SEM_RECUSAS = SISTEMA.split(RECUSA_FORA_DO_TEMA).join('').split(RECUSA_REGRAS).join('')

export function criarHandler(deps: DepsDoGuia) {
  const log = deps.log ?? ((e: EventoDeLog) => console.warn(JSON.stringify(e)))

  async function post(req: Request): Promise<Response> {
    const { config } = deps

    const origem = req.headers.get('origin')
    if (origem && !config.origensPermitidas.includes(origem)) return json({ erro: 'origem_nao_permitida' }, 403)
    const cors: Record<string, string> = origem ? { 'access-control-allow-origin': origem, vary: 'origin' } : {}

    if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return json({ erro: 'tipo_invalido' }, 415, cors)
    if (!config.ativo) return json({ erro: 'indisponivel', mensagem: MENSAGEM_INDISPONIVEL }, 503, cors)

    const declarado = Number(req.headers.get('content-length') ?? 0)
    if (declarado > GUIA.maxBytesCorpo) return json({ erro: 'corpo_grande' }, 413, cors)
    const texto = await req.text()
    if (new TextEncoder().encode(texto).length > GUIA.maxBytesCorpo) return json({ erro: 'corpo_grande' }, 413, cors)

    let corpo: unknown
    try {
      corpo = JSON.parse(texto)
    } catch {
      return json({ erro: 'json_invalido' }, 400, cors)
    }

    const entrada = validarEntrada(corpo)
    if (!entrada.ok) return json({ erro: entrada.erro }, 400, cors)

    const visitante = chaveDoVisitante(ipDe(req), req.headers.get('user-agent') ?? '', config.sal)

    const decisao = deps.guarda.permitir(visitante)
    if (!decisao.ok) {
      log({ evento: decisao.motivo === 'bloqueado' ? 'guia_bloqueio' : 'guia_limite', visitante, motivo: decisao.motivo })
      const mensagem = decisao.motivo === 'bloqueado' ? MENSAGEM_BLOQUEIO : MENSAGEM_LIMITE
      return json({ erro: decisao.motivo, mensagem }, 429, { ...cors, 'retry-after': String(decisao.tentarEmSegundos) })
    }

    // historico forjado: turno antigo com ordem escondida
    for (const m of entrada.mensagens.slice(0, -1)) {
      const v = classificar(m.content)
      const grave = !v.ok && (v.motivo === 'injecao' || v.motivo === 'segredo' || v.motivo === 'codigo')
      const baixo = !v.ok && m.role === 'user'
      if (grave || baixo) {
        log({ evento: 'guia_abuso', visitante, motivo: `historico_${v.ok ? 'x' : v.motivo}`, trecho: mascarar(m.content) })
        deps.guarda.registrarAbuso(visitante)
        return json({ erro: 'historico_invalido', mensagem: RECUSA_FORA_DO_TEMA }, 400, cors)
      }
    }

    const ultimo = classificar(entrada.ultimaDoUsuario)
    if (!ultimo.ok) {
      log({ evento: 'guia_abuso', visitante, motivo: ultimo.motivo, trecho: mascarar(entrada.ultimaDoUsuario) })
      const bloqueado = deps.guarda.registrarAbuso(visitante)
      if (bloqueado) {
        log({ evento: 'guia_bloqueio', visitante, motivo: 'abusos_repetidos' })
        return json({ erro: 'bloqueado', mensagem: MENSAGEM_BLOQUEIO }, 429, { ...cors, 'retry-after': String(GUIA.bloqueioMs / 1000) })
      }
      return json({ texto: recusaPara(ultimo.motivo), links: [], recusado: true }, 200, cors)
    }

    try {
      const r = await conversar(entrada.mensagens, deps.executor, config, deps.chamar)
      const final = limparResposta(r.texto, r.slugs, undefined, PROMPT_SEM_RECUSAS)
      if (final.trocada) {
        log({ evento: 'guia_vazamento', visitante, motivo: final.motivoDaTroca ?? 'desconhecido', trecho: mascarar(entrada.ultimaDoUsuario) })
        deps.guarda.registrarAbuso(visitante)
      }
      return json({ texto: final.texto, links: final.links, recusado: final.trocada }, 200, cors)
    } catch (e) {
      log({ evento: 'guia_falha', visitante, motivo: e instanceof GuiaIndisponivel ? e.message : 'erro_inesperado' })
      return json({ erro: 'indisponivel', mensagem: MENSAGEM_INDISPONIVEL }, 503, cors)
    }
  }

  function opcoes(req: Request): Response {
    const origem = req.headers.get('origin')
    if (!origem || !deps.config.origensPermitidas.includes(origem)) return new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } })
    return new Response(null, {
      status: 204,
      headers: {
        allow: 'POST, OPTIONS',
        'access-control-allow-origin': origem,
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
        vary: 'origin',
      },
    })
  }

  return { post, opcoes }
}
