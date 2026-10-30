// 1a leva do Passaporte: "7 de 20 estabelecimentos no ar, restam 13 vagas de estabelecimento".
//
// SO INFORMA. Conta estabelecimentos parceiros com vantagem no ar, nunca resgates, e nao
// impede ninguem de entrar: zero ou negativo vira "leva completa", sem erro.
import { LEVA_ESTABELECIMENTOS } from '@/lib/clube/config'

export interface Leva {
  /** Estabelecimentos com vantagem no ar. */
  noAr: number
  /** Tamanho da leva (LEVA_ESTABELECIMENTOS). */
  total: number
  /** total - noAr, nunca abaixo de zero. */
  restantes: number
  completa: boolean
  /** 0 a 100, para a barra. */
  percentual: number
}

export function levaDoClube(noAr: number, total: number = LEVA_ESTABELECIMENTOS): Leva {
  const n = Number.isFinite(noAr) ? Math.max(0, Math.floor(noAr)) : 0
  const restantes = Math.max(0, total - n)
  return {
    noAr: n,
    total,
    restantes,
    completa: restantes === 0,
    percentual: total > 0 ? Math.min(100, Math.round((n / total) * 100)) : 100,
  }
}

/** Quantos ESTABELECIMENTOS tem vantagem no ar (um negocio conta uma vez, mesmo com mais de uma linha). */
export function contarEstabelecimentosNoAr(vantagens: ReadonlyArray<{ businessId: string; status: string }>): number {
  return new Set(vantagens.filter((v) => v.status === 'no_ar' && v.businessId).map((v) => v.businessId)).size
}

export interface TextosLeva {
  leva_titulo: string
  leva_contagem: string
  leva_restam: string
  leva_resta: string
  leva_completa: string
  leva_nota: string
}

export interface LevaEmTexto {
  titulo: string
  /** "7 de 20 estabelecimentos no ar" (vazio quando a leva esta completa: a frase completa diz tudo). */
  contagem: string
  /** "Restam 13 vagas de estabelecimento" ou a frase de leva completa. */
  situacao: string
  nota: string
}

const preencher = (modelo: string, valores: Record<string, number>) =>
  modelo.replace(/\{(\w+)\}/g, (_, chave: string) => String(valores[chave] ?? ''))

export function textosDaLeva(t: TextosLeva, leva: Leva): LevaEmTexto {
  const valores = { n: leva.noAr, total: leva.total, restantes: leva.restantes }
  return {
    titulo: preencher(t.leva_titulo, valores),
    contagem: leva.completa ? '' : preencher(t.leva_contagem, valores),
    situacao: leva.completa
      ? preencher(t.leva_completa, valores)
      : preencher(leva.restantes === 1 ? t.leva_resta : t.leva_restam, valores),
    nota: t.leva_nota,
  }
}
