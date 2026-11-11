// KAN-686: filtro de saida. O que o modelo escreveu so chega ao visitante depois daqui.

import { GUIA } from './config'
import { classificar, normalizarTexto } from './filtro'
import { CANARIO, RECUSA_FORA_DO_TEMA } from './prompt'

export type RespostaFinal = {
  texto: string
  /** Negocios citados por link, para o site e o app desenharem o cartao. */
  links: { slug: string }[]
  /** true quando a saida foi trocada por alguma barreira (vazamento, conteudo vetado). */
  trocada: boolean
  motivoDaTroca?: 'vazamento' | 'segredo' | 'codigo' | 'vazia'
}

const PADROES_DE_SEGREDO = [
  /\bsk-[a-z0-9_-]{16,}/i,
  /\bbearer\s+[a-z0-9._-]{16,}/i,
  /\b(eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,})/,
  /(api[\s_-]?key|cmd_api_key|service[\s_-]?role|supabase_[a-z_]+)\s*[:=]/i,
  /\bpostgres(ql)?:\/\//i,
]

/** Mantem so o link /pt/negocio/SLUG com slug conhecido (devolvido por ferramenta); qualquer outra URL, imagem ou e-mail sai. */
export function limparResposta(bruto: string, slugsConhecidos: ReadonlySet<string>, canario = CANARIO, trechoDoPrompt?: string): RespostaFinal {
  const original = String(bruto ?? '')

  if (original.includes(canario) || (trechoDoPrompt && vazouTrecho(original, trechoDoPrompt))) {
    return { texto: RECUSA_FORA_DO_TEMA, links: [], trocada: true, motivoDaTroca: 'vazamento' }
  }
  if (PADROES_DE_SEGREDO.some((r) => r.test(original))) {
    return { texto: RECUSA_FORA_DO_TEMA, links: [], trocada: true, motivoDaTroca: 'segredo' }
  }
  if (/```|<\s*(script|iframe|img|svg|style)\b/i.test(original)) {
    return { texto: RECUSA_FORA_DO_TEMA, links: [], trocada: true, motivoDaTroca: 'codigo' }
  }

  const links: { slug: string }[] = []
  let texto = original
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // imagem markdown
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_m, rotulo: string, alvo: string) => {
      const slug = slugDoLink(alvo)
      if (slug && slugsConhecidos.has(slug)) {
        if (!links.some((l) => l.slug === slug)) links.push({ slug })
        return rotulo
      }
      return rotulo
    })
    .replace(/(?:https?:\/\/[^\s)]+|\bwww\.[^\s)]+)/gi, (url) => {
      const slug = slugDoLink(url)
      if (slug && slugsConhecidos.has(slug)) {
        if (!links.some((l) => l.slug === slug)) links.push({ slug })
        return `/pt/negocio/${slug}`
      }
      return ''
    })
    .replace(/\/(?:pt|en|es)\/negocio\/([a-z0-9-]+)/g, (m, slug: string) => {
      if (slugsConhecidos.has(slug)) {
        if (!links.some((l) => l.slug === slug)) links.push({ slug })
        return m
      }
      return ''
    })
    .replace(/\S+@\S+\.\S+/g, '')
    .replace(/<[^>]*>/g, '')

  texto = normalizarTexto(texto.replace(/[*_`#>]+/g, ' ').replace(/ +\n/g, '\n'))
  // normalizarTexto junta quebras de linha; recoloca quebra simples antes de "Dia N" para o roteiro ficar legivel
  texto = texto.replace(/\s+(Dia \d+\b)/g, '\n$1')
  if (texto.length > GUIA.maxCharsResposta) texto = `${texto.slice(0, GUIA.maxCharsResposta).replace(/\s+\S*$/, '')}...`
  if (texto.length === 0) return { texto: RECUSA_FORA_DO_TEMA, links: [], trocada: true, motivoDaTroca: 'vazia' }

  // a saida tambem passa pelo filtro de injecao/segredo/codigo (nao pelo de tema: o guia fala de bar, praia, festa)
  const v = classificar(texto)
  if (!v.ok && (v.motivo === 'segredo' || v.motivo === 'codigo')) {
    return { texto: RECUSA_FORA_DO_TEMA, links: [], trocada: true, motivoDaTroca: v.motivo }
  }
  return { texto, links, trocada: false }
}

function slugDoLink(url: string): string | null {
  const m = /(?:vivegostoso\.com\.br)?\/(?:pt|en|es)\/negocio\/([a-z0-9-]+)/i.exec(url)
  return m ? m[1].toLowerCase() : null
}

/** Vazou se a resposta repete 80 caracteres seguidos do prompt (comparacao sem acento e sem espaco duplo).
 *  80 e acima da maior lista de assuntos que o proprio guia cita ao se apresentar. */
function vazouTrecho(resposta: string, prompt: string): boolean {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
  const r = norm(resposta)
  const p = norm(prompt)
  const janela = 80
  for (let i = 0; i + janela <= p.length; i += 20) {
    if (r.includes(p.slice(i, i + janela))) return true
  }
  return false
}
