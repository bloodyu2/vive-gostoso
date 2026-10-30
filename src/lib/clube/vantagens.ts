// Vantagens do Passaporte Gostoso: tipos, leitura e textos de compartilhamento.
import { buildWhatsAppLink } from '@/lib/whatsapp'

export type StatusVantagem = 'no_ar' | 'em_combinacao'

/** Categoria do negocio no guia (gostoso_categories), com o nome ja no idioma da pagina.
 *  Serve so ao filtro da /clube; `tipo` (o rotulo do cartao) segue como estava. */
export interface CategoriaDaVantagem {
  id: string
  slug: string
  /** nome no idioma da pagina (cai no nome do banco quando nao ha traducao) */
  nome: string
  ordem: number
}

export interface Vantagem {
  partnerId: string
  businessId: string
  nome: string
  slug: string
  logoUrl: string | null
  /** foto do estabelecimento (capa, ou a primeira da galeria); null quando nao tem */
  capaUrl: string | null
  tipo: string | null
  beneficio: string
  regra: string | null
  limiteMensal: number | null
  validoAte: string | null
  status: StatusVantagem
  esgotada: boolean
  /** Preenchida pela pagina depois da leitura; ausente = sem categoria (so aparece em "Todos"). */
  categoria?: CategoriaDaVantagem | null
}

/** Linha como a funcao gostoso_club_vantagens() devolve. */
export interface LinhaVantagem {
  partner_id: string
  business_id: string
  nome: string
  slug: string
  logo_url: string | null
  capa_url?: string | null
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
    capaUrl: l.capa_url ?? null,
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

/** Os parceiros de hoje, so para a pagina nao ficar vazia se o banco falhar (sem botao
 *  Resgatar nesse caso, e sem foto: a foto vem do banco). */
function fundador(
  id: string,
  nome: string,
  slug: string,
  tipo: string,
  beneficio: string,
  regra: string | null,
  status: StatusVantagem,
): Vantagem {
  return {
    partnerId: `fundador-${id}`,
    businessId: '',
    nome,
    slug,
    logoUrl: null,
    capaUrl: null,
    tipo,
    beneficio,
    regra,
    limiteMensal: null,
    validoAte: null,
    status,
    esgotada: false,
  }
}

export const VANTAGENS_FUNDADORAS: Vantagem[] = [
  fundador('gostoso-expedicoes', 'Gostoso Expedições', 'gostoso-expedicoes', 'Passeios',
    '5% de desconto no Pix ou em espécie, em qualquer passeio.', 'Qualquer dia da semana. Mostre o cupom antes de pagar.', 'no_ar'),
  fundador('pousada-parcel', 'Pousada Parcel do Gostoso', 'pousada-parcel-do-gostoso', 'Hospedagem',
    'Late check-out de cortesia até as 16h.', 'Não vale para diária que termina na sexta ou no sábado. Sujeito à disponibilidade.', 'no_ar'),
  fundador('casa-gostoso-mar', 'Casa Gostoso Mar', 'casa-gostoso-mar', 'Hospedagem',
    'Late check-out de cortesia.', 'Sujeito à disponibilidade. Consulte o horário na recepção.', 'no_ar'),
  fundador('damy', 'Café com Biscoitos Damy', 'cafe-com-biscoitos-damy', 'Café', 'Um cafezinho de cortesia.', null, 'no_ar'),
  fundador('casa-reduto', 'Casa Reduto', 'casa-reduto-artesanato', 'Artesanato',
    'Brinde feito pelas artesãs da casa.', null, 'em_combinacao'),
  fundador('serido-praia', 'Seridó Praia', 'serido-praia', 'Passeios',
    'Vantagem em combinação com a casa.', null, 'em_combinacao'),
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
