/**
 * Estado de funcionamento de um negocio num instante, no fuso de Gostoso.
 *
 * Existe porque `isBusinessOpen` usa o relogio do aparelho: um turista em
 * outro fuso veria "aberto" para um lugar que ja fechou, e o HTML gerado no
 * servidor (ISR de 1 h) congelaria a resposta de quando a pagina foi montada.
 * Aqui o instante entra por parametro e o fuso e fixo.
 */

export type HorarioDia = { open: string; close: string; closed: boolean }
export type Horarios = Record<string, HorarioDia>

export const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const
export type DiaKey = (typeof DIAS)[number]

export const FUSO_GOSTOSO = 'America/Fortaleza'

/** Quantos minutos antes de fechar o status vira "fecha em breve". */
const MINUTOS_FECHA_EM_BREVE = 45

export type StatusAbertura =
  | { estado: 'aberto'; ate: string; fechaEmBreve: boolean; hoje: DiaKey }
  | { estado: 'fechado'; proxima: { quando: 'hoje' | 'amanha' | DiaKey; hora: string } | null; hoje: DiaKey }
  | { estado: 'sem-horario'; hoje: DiaKey }

function minutos(hhmm: string | undefined): number | null {
  const partes = hhmm?.split(':').map(Number)
  if (!partes || partes.length < 2 || Number.isNaN(partes[0]) || Number.isNaN(partes[1])) return null
  return partes[0] * 60 + partes[1]
}

/** Dia da semana e minuto do dia em `fuso` para o instante `agora`. */
export function relogioNoFuso(agora: Date, fuso: string = FUSO_GOSTOSO): { dia: DiaKey; minuto: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: fuso,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(agora)
  const pega = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ''
  const dia = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).indexOf(
    pega('weekday').slice(0, 3).toLowerCase() as 'sun',
  )
  return { dia: DIAS[dia < 0 ? 0 : dia], minuto: Number(pega('hour')) * 60 + Number(pega('minute')) }
}

function abertoNoDia(h: HorarioDia | undefined): { abre: number; fecha: number } | null {
  if (!h || h.closed) return null
  const abre = minutos(h.open)
  const fecha = minutos(h.close)
  if (abre === null || fecha === null) return null
  return { abre, fecha }
}

export function statusDeAbertura(horarios: Horarios | null | undefined, agora: Date, fuso: string = FUSO_GOSTOSO): StatusAbertura {
  const { dia, minuto } = relogioNoFuso(agora, fuso)
  const idx = DIAS.indexOf(dia)
  if (!horarios || Object.keys(horarios).length === 0) return { estado: 'sem-horario', hoje: dia }
  // "00:00 a 00:00" em todos os dias e o valor de quem nunca preencheu: nao
  // diz que abre as zero hora nem que fica aberto 24 h, so que nao se sabe.
  const valores = Object.values(horarios)
  if (valores.every((h) => h.closed || h.open === h.close)) return { estado: 'sem-horario', hoje: dia }

  const hoje = abertoNoDia(horarios[dia])
  // Passou da meia-noite: o expediente de ontem ainda vale ate o horario de fechar.
  const ontem = abertoNoDia(horarios[DIAS[(idx + 6) % 7]])

  if (ontem && ontem.fecha < ontem.abre && minuto < ontem.fecha) {
    return { estado: 'aberto', ate: horarios[DIAS[(idx + 6) % 7]].close, fechaEmBreve: ontem.fecha - minuto <= MINUTOS_FECHA_EM_BREVE, hoje: dia }
  }
  if (hoje) {
    const viraNoite = hoje.fecha < hoje.abre
    const dentro = viraNoite ? minuto >= hoje.abre : minuto >= hoje.abre && minuto < hoje.fecha
    if (dentro) {
      const falta = viraNoite ? 24 * 60 - minuto + hoje.fecha : hoje.fecha - minuto
      return { estado: 'aberto', ate: horarios[dia].close, fechaEmBreve: falta <= MINUTOS_FECHA_EM_BREVE, hoje: dia }
    }
    if (minuto < hoje.abre) {
      return { estado: 'fechado', proxima: { quando: 'hoje', hora: horarios[dia].open }, hoje: dia }
    }
  }
  // Fechado agora: procura o proximo dia com expediente.
  for (let passo = 1; passo <= 7; passo++) {
    const key = DIAS[(idx + passo) % 7]
    if (abertoNoDia(horarios[key])) {
      return { estado: 'fechado', proxima: { quando: passo === 1 ? 'amanha' : key, hora: horarios[key].open }, hoje: dia }
    }
  }
  return { estado: 'fechado', proxima: null, hoje: dia }
}

/** Aberto neste instante? Mesma regra e mesmo fuso do selo, para o filtro
 *  "Aberto agora" e o cartao nunca discordarem. */
export function estaAbertoAgora(horarios: Horarios | null | undefined, agora: Date = new Date()): boolean {
  return statusDeAbertura(horarios, agora).estado === 'aberto'
}
