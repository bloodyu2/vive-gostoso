import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Idioma } from '@/data/praias-mares'
import type { DiaDeMare } from '@/lib/mares/semana'
import { carregarSemana } from '@/lib/mares/carregar'
import { formatarAltura } from '@/lib/mares/formato'
import { textosMares } from '@/lib/mares/seo-mares'

/** Mare de hoje no Cardeiro, lida no servidor. A leitura do Supabase fica 1 h
 *  no cache de dados do Next (fetchComCache em src/lib/mares/consulta.ts), a
 *  mesma da pagina de mares: o HTML e dinamico por causa do nonce de CSP, entao
 *  o `revalidate` da pagina sozinho nao seguraria nada. */
export async function lerMareDeHojeNoCardeiro(): Promise<DiaDeMare | null> {
  try {
    const { semana, vazia } = await carregarSemana('cardeiro')
    return vazia || !semana[0]?.temDados ? null : semana[0]
  } catch {
    return null
  }
}

/** As mares do dia em linha: tipo, hora e altura. Sem dado, nao mostra nada. */
export function MaresDoDia({ dia, lang, claro = false }: { dia: DiaDeMare | null; lang: Idioma; claro?: boolean }) {
  if (!dia) return null
  const t = textosMares(lang)
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {dia.eventos.map((e) => {
        const alta = e.tipo === 'alta'
        const Icone = alta ? ArrowUp : ArrowDown
        return (
          <li key={e.iso} className="flex items-baseline gap-1.5">
            <Icone aria-hidden="true" className={`w-3.5 h-3.5 self-center ${alta ? (claro ? 'text-teal-light' : 'text-teal') : 'text-ocre'}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${claro ? 'text-white/70' : 'text-fg-3'}`}>
              {alta ? t.alta_curta : t.baixa_curta}
            </span>
            <span className={`font-display text-xl font-semibold tabular-nums ${claro ? 'text-white' : 'text-fg-1'}`}>{e.hora}</span>
            <span className={`text-xs tabular-nums ${claro ? 'text-white/70' : 'text-fg-3'}`}>{formatarAltura(e.altura, lang)}</span>
          </li>
        )
      })}
    </ul>
  )
}
