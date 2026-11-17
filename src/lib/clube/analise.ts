/* Aprovacao da vantagem do Passaporte pela equipe (KAN-917, Item 294). Logica pura da fila e da decisao;
   a chamada ao banco fica em src/hooks/useClubeAnalise.ts. As funcoes do banco sao
   gostoso_club_analise_fila() e gostoso_club_analise_decidir(), so para admin (migracao 20261117210000). */

export interface VantagemEmAnalise {
  partnerId: string
  businessId: string
  nome: string
  slug: string
  beneficio: string
  regra: string | null
  limiteMensal: number | null
  validoAte: string | null
  enviadoEm: string
  jaAprovadaAntes: boolean
  ultimoMotivo: string | null
}

export const MOTIVO_MIN = 5
export const MOTIVO_MAX = 300

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null)

/** Le a fila que o banco devolve. Linha sem id, nome ou beneficio e descartada: melhor sumir da fila do que
    quebrar a tela da equipe com um dado torto. */
export function lerFila(bruto: unknown): VantagemEmAnalise[] {
  if (!Array.isArray(bruto)) return []
  const saida: VantagemEmAnalise[] = []
  for (const l of bruto) {
    if (!l || typeof l !== 'object') continue
    const o = l as Record<string, unknown>
    const partnerId = texto(o.partner_id)
    const nome = texto(o.nome)
    const beneficio = texto(o.beneficio)
    if (!partnerId || !nome || !beneficio) continue
    saida.push({
      partnerId,
      businessId: texto(o.business_id) ?? '',
      nome,
      slug: texto(o.slug) ?? '',
      beneficio,
      regra: texto(o.regra),
      limiteMensal: typeof o.limite_mensal === 'number' ? o.limite_mensal : null,
      validoAte: texto(o.valido_ate),
      enviadoEm: texto(o.enviado_em) ?? '',
      jaAprovadaAntes: o.ja_aprovada_antes === true,
      ultimoMotivo: texto(o.ultimo_motivo),
    })
  }
  return saida
}

/** O motivo da recusa tem de dizer algo: de 5 a 300 letras, sem contar espacos nas pontas. */
export function motivoValido(motivo: string): boolean {
  const n = motivo.trim().length
  return n >= MOTIVO_MIN && n <= MOTIVO_MAX
}

export type ResultadoDecisao =
  | { ok: true; status: 'no_ar' | 'rejeitado' }
  | { ok: false; motivo: 'motivo_obrigatorio' | 'nao_encontrado' | 'nao_esta_em_analise' | 'desconhecido' }

/** Le o json que gostoso_club_analise_decidir devolve. */
export function lerDecisao(bruto: unknown): ResultadoDecisao {
  if (!bruto || typeof bruto !== 'object') return { ok: false, motivo: 'desconhecido' }
  const o = bruto as Record<string, unknown>
  if (o.ok === true && (o.status === 'no_ar' || o.status === 'rejeitado')) return { ok: true, status: o.status }
  if (o.motivo === 'motivo_obrigatorio' || o.motivo === 'nao_encontrado' || o.motivo === 'nao_esta_em_analise') {
    return { ok: false, motivo: o.motivo }
  }
  return { ok: false, motivo: 'desconhecido' }
}
