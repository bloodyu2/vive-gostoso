// Vantagens do Passaporte Gostoso: tipos, leitura e textos de compartilhamento.
import { buildWhatsAppLink } from '@/lib/whatsapp'

export type StatusVantagem = 'no_ar' | 'em_combinacao'

export interface Vantagem {
  partnerId: string
  businessId: string
  nome: string
  slug: string
  logoUrl: string | null
  tipo: string | null
  beneficio: string
  regra: string | null
  limiteMensal: number | null
  validoAte: string | null
  status: StatusVantagem
  esgotada: boolean
}

/** Linha como a funcao gostoso_club_vantagens() devolve. */
export interface LinhaVantagem {
  partner_id: string
  business_id: string
  nome: string
  slug: string
  logo_url: string | null
  tipo: string | null
  beneficio: string
  regra: string | null
  limite_mensal: number | null
  valido_ate: string | null
  status: string
  esgotada: boolean
}

export function paraVantagem(l: LinhaVantagem): Vantagem {
  return {
    partnerId: l.partner_id,
    businessId: l.business_id,
    nome: l.nome,
    slug: l.slug,
    logoUrl: l.logo_url,
    tipo: l.tipo,
    beneficio: l.beneficio,
    regra: l.regra,
    limiteMensal: l.limite_mensal,
    validoAte: l.valido_ate,
    status: l.status === 'no_ar' ? 'no_ar' : 'em_combinacao',
    esgotada: !!l.esgotada,
  }
}

/** Origem da plaquinha: so dois digitos. Qualquer outra coisa vira null. */
export function origemValida(n: string | string[] | undefined): string | null {
  const v = Array.isArray(n) ? n[0] : n
  return v && /^\d{2}$/.test(v) ? v : null
}

/** Os tres parceiros fundadores, so para a pagina nao ficar vazia se o banco falhar. */
export const VANTAGENS_FUNDADORAS: Vantagem[] = [
  {
    partnerId: 'fundador-gostoso-expedicoes',
    businessId: '',
    nome: 'Gostoso Expedições',
    slug: 'gostoso-expedicoes',
    logoUrl: null,
    tipo: 'Passeios',
    beneficio: '5% de desconto no Pix ou em espécie, em qualquer passeio.',
    regra: 'Qualquer dia da semana. Mostre o código antes de pagar.',
    limiteMensal: null,
    validoAte: null,
    status: 'no_ar',
    esgotada: false,
  },
  {
    partnerId: 'fundador-pousada-parcel',
    businessId: '',
    nome: 'Pousada Parcel do Gostoso',
    slug: 'pousada-parcel-do-gostoso',
    logoUrl: null,
    tipo: 'Hospedagem',
    beneficio: 'Late check-out de cortesia.',
    regra: null,
    limiteMensal: null,
    validoAte: null,
    status: 'em_combinacao',
    esgotada: false,
  },
  {
    partnerId: 'fundador-casa-reduto',
    businessId: '',
    nome: 'Casa Reduto',
    slug: 'casa-reduto-artesanato',
    logoUrl: null,
    tipo: 'Artesanato',
    beneficio: 'Brinde feito pelas artesãs da casa.',
    regra: null,
    limiteMensal: null,
    validoAte: null,
    status: 'em_combinacao',
    esgotada: false,
  },
]

/** Link "Mandar para um amigo": wa.me sem numero (a pessoa escolhe o contato),
 *  com texto curto e o link da /clube. */
export function linkParaAmigo(texto: string): string {
  return buildWhatsAppLink('', texto)
}

export function textoParaAmigo(modelo: string, v: Pick<Vantagem, 'nome' | 'beneficio'>, link: string): string {
  // Uma passada só e com função: o texto do parceiro é livre e não pode ser lido
  // como padrão de substituição ($&) nem como outro marcador ({link}).
  const valores: Record<string, string> = {
    nome: v.nome,
    beneficio: v.beneficio.replace(/\.$/, ''),
    link,
  }
  return modelo.replace(/\{(nome|beneficio|link)\}/g, (_, chave: string) => valores[chave])
}

export type ResultadoUso =
  | { tipo: 'codigo'; codigo: string }
  | { tipo: 'erro'; motivo: 'esgotada' | 'muitos' | 'indisponivel' | 'erro' }

/** A resposta de gostoso_club_usar() em algo que a tela entende. So devolve codigo
 *  quando a resposta e ok e o codigo tem o formato certo; qualquer outra coisa e erro. */
export function interpretarUso(data: unknown, error: unknown): ResultadoUso {
  const r = data as { ok?: boolean; codigo?: unknown; motivo?: string } | null
  if (error || !r || typeof r !== 'object') return { tipo: 'erro', motivo: 'erro' }
  if (r.ok === true) {
    return typeof r.codigo === 'string' && /^GOSTOSO-\d{4}$/.test(r.codigo)
      ? { tipo: 'codigo', codigo: r.codigo }
      : { tipo: 'erro', motivo: 'erro' }
  }
  if (r.motivo === 'esgotada' || r.motivo === 'muitos') return { tipo: 'erro', motivo: r.motivo }
  return { tipo: 'erro', motivo: 'indisponivel' }
}
