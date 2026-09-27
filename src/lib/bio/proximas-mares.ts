import { dataLocal, formatarHora } from '@/lib/mares/tempo'

type Evento = { tipo: 'alta' | 'baixa'; iso: string; altura: number }
export type ProximaMare = { hora: string; altura: number; amanha: boolean }

/** A proxima baixa e a proxima alta a partir de `agora`. "amanha" compara o dia
 *  local de Gostoso (UTC-3), nao o do servidor. */
export function proximasMares(eventos: Evento[], agora: Date): { baixa: ProximaMare | null; alta: ProximaMare | null } {
  const hoje = dataLocal(agora)
  const futuros = eventos
    .map((e) => ({ ...e, instante: new Date(e.iso) }))
    .filter((e) => e.instante.getTime() >= agora.getTime())
    .sort((a, b) => a.instante.getTime() - b.instante.getTime())
  const achar = (tipo: Evento['tipo']): ProximaMare | null => {
    const e = futuros.find((x) => x.tipo === tipo)
    return e ? { hora: formatarHora(e.instante), altura: e.altura, amanha: dataLocal(e.instante) !== hoje } : null
  }
  return { baixa: achar('baixa'), alta: achar('alta') }
}
