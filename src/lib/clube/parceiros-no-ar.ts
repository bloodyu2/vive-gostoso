// Quais negocios tem vantagem do Passaporte no ar (para o selo do clube).
//
// UMA leitura leve para o site inteiro, no servidor, pelo cliente publico com cache de
// 5 minutos (KAN-463): o anon le gostoso_club_partners pela politica
// `club_partners_public_read` (status no_ar ou em_combinacao, de negocio ativo e
// publicado). Nada de consulta por cartao e nada de funcao nova no banco.
import { CLUBE_PUBLICO } from '@/lib/clube/config'
import { clientePublico } from '@/lib/supabase/publico'

export interface LinhaParceiro {
  business_id: string
  status: string
  valido_ate: string | null
}

/** Dia no fuso de Gostoso (AAAA-MM-DD), o mesmo que o banco usa em gostoso_club_hoje(). */
export function hojeEmGostoso(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(agora)
}

/** Ids dos negocios com vantagem NO AR e nao vencida. "Em combinacao" e "pausado" nao contam;
 *  a validade vale ate o proprio dia (igual ao banco: valido_ate >= hoje). */
export function idsNoAr(linhas: readonly LinhaParceiro[], hoje: string): string[] {
  const ids = new Set<string>()
  for (const l of linhas) {
    if (l.status !== 'no_ar') continue
    if (l.valido_ate && l.valido_ate < hoje) continue
    ids.add(l.business_id)
  }
  return [...ids]
}

/** Para o layout. Com a flag desligada nem consulta o banco: nada do clube chega ao HTML.
 *  Se o banco falhar, devolve vazio (sem selo), nunca derruba a pagina. */
export async function carregarIdsDoClube(): Promise<string[]> {
  if (!CLUBE_PUBLICO) return []
  try {
    const { data, error } = await clientePublico()
      .from('gostoso_club_partners')
      .select('business_id, status, valido_ate')
      .eq('status', 'no_ar')
    if (error) return []
    return idsNoAr((data ?? []) as LinhaParceiro[], hojeEmGostoso())
  } catch {
    return []
  }
}
