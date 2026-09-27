/** Fase da lua por calculo local, sem API.
 *
 *  Idade media da lua a partir da lua nova de referencia de 06/01/2000 18h14
 *  UTC, com o mes sinodico medio de 29,530588853 dias. O erro da lua media
 *  contra a verdadeira chega a cerca de 14 horas, bem menos que a largura de
 *  cada uma das oito fases (3,7 dias). Calculada ao meio-dia local da data. */
const LUA_NOVA_REFERENCIA = Date.UTC(2000, 0, 6, 18, 14)
const MES_SINODICO = 29.530588853

export type NomeFase =
  | 'nova'
  | 'crescente'
  | 'quarto_crescente'
  | 'gibosa_crescente'
  | 'cheia'
  | 'gibosa_minguante'
  | 'quarto_minguante'
  | 'minguante'

const FASES: NomeFase[] = [
  'nova',
  'crescente',
  'quarto_crescente',
  'gibosa_crescente',
  'cheia',
  'gibosa_minguante',
  'quarto_minguante',
  'minguante',
]

export type FaseDaLua = { fase: NomeFase; idadeDias: number; fracao: number; iluminacao: number }

export function faseDaLua(data: string): FaseDaLua {
  const meioDia = new Date(`${data}T12:00:00-03:00`).getTime()
  const dias = (meioDia - LUA_NOVA_REFERENCIA) / 86_400_000
  const idadeDias = ((dias % MES_SINODICO) + MES_SINODICO) % MES_SINODICO
  const fracao = idadeDias / MES_SINODICO
  const fase = FASES[Math.floor(fracao * 8 + 0.5) % 8]
  const iluminacao = (1 - Math.cos(2 * Math.PI * fracao)) / 2
  return { fase, idadeDias, fracao, iluminacao }
}
