/** Tempo da tabua de mares.
 *
 *  A Marinha publica a tabua de Natal em "Fuso UTC -03.0 horas", e Gostoso usa
 *  America/Fortaleza, que e UTC-3 fixo desde 2019 (sem horario de verao). Por
 *  isso o deslocamento e constante e nao depende do fuso do servidor: a Vercel
 *  roda em UTC, e "hoje" calculado com new Date() puro erraria entre 21h e 0h. */
export const FUSO = 'America/Fortaleza'
const DESLOCAMENTO_MS = -3 * 60 * 60 * 1000

/** Data local (AAAA-MM-DD) de um instante. */
export function dataLocal(instante: Date): string {
  return new Date(instante.getTime() + DESLOCAMENTO_MS).toISOString().slice(0, 10)
}

/** Minutos desde a meia-noite local. */
export function minutosLocais(instante: Date): number {
  const d = new Date(instante.getTime() + DESLOCAMENTO_MS)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

/** Instante de uma hora da tabua ("0221") numa data local. */
export function paraInstante(data: string, hhmm: string): Date {
  return new Date(`${data}T${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00-03:00`)
}

/** Inicio do dia local como instante. */
export function inicioDoDia(data: string): Date {
  return new Date(`${data}T00:00:00-03:00`)
}

/** "9h10": o jeito brasileiro de escrever hora, igual nos tres idiomas. */
export function formatarHora(instante: Date): string {
  const m = minutosLocais(instante)
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}

export function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function diasAPartirDe(data: string, quantidade: number): string[] {
  return Array.from({ length: quantidade }, (_, i) => somarDias(data, i))
}
