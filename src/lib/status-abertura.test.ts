import { describe, it, expect } from 'vitest'
import { statusDeAbertura, relogioNoFuso, estaAbertoAgora, type Horarios } from './status-abertura'

// Gostoso e UTC-3 o ano todo (America/Fortaleza, sem horario de verao).
// 2026-10-07 e uma quarta-feira.
const em = (iso: string) => new Date(iso)

const jantar: Horarios = {
  seg: { open: '', close: '', closed: true },
  ter: { open: '18:00', close: '23:00', closed: false },
  qua: { open: '18:00', close: '23:00', closed: false },
  qui: { open: '18:00', close: '23:00', closed: false },
  sex: { open: '18:00', close: '23:00', closed: false },
  sab: { open: '18:00', close: '23:00', closed: false },
  dom: { open: '18:00', close: '22:00', closed: false },
}

describe('relogioNoFuso', () => {
  it('le o dia e o minuto no fuso de Gostoso, nao no do aparelho', () => {
    // 01:30 UTC de quinta = 22:30 de quarta em Gostoso
    expect(relogioNoFuso(em('2026-10-08T01:30:00Z'))).toEqual({ dia: 'qua', minuto: 22 * 60 + 30 })
  })
})

describe('statusDeAbertura', () => {
  it('aberto, com o horario de fechar', () => {
    const s = statusDeAbertura(jantar, em('2026-10-07T22:00:00Z')) // 19:00 qua
    expect(s).toMatchObject({ estado: 'aberto', ate: '23:00', fechaEmBreve: false, hoje: 'qua' })
  })

  it('avisa quando falta pouco para fechar', () => {
    const s = statusDeAbertura(jantar, em('2026-10-08T01:30:00Z')) // 22:30 qua
    expect(s).toMatchObject({ estado: 'aberto', fechaEmBreve: true })
  })

  it('fechado antes de abrir: abre hoje', () => {
    const s = statusDeAbertura(jantar, em('2026-10-07T17:00:00Z')) // 14:00 qua
    expect(s).toEqual({ estado: 'fechado', proxima: { quando: 'hoje', hora: '18:00' }, hoje: 'qua' })
  })

  it('fechado depois de fechar: abre amanha', () => {
    const s = statusDeAbertura(jantar, em('2026-10-08T03:00:00Z')) // 00:00 qui... ainda qua 24h -> 00:00 qui
    expect(s).toMatchObject({ estado: 'fechado', proxima: { quando: 'hoje', hora: '18:00' } })
    const tarde = statusDeAbertura(jantar, em('2026-10-08T02:30:00Z')) // 23:30 qua
    expect(tarde).toEqual({ estado: 'fechado', proxima: { quando: 'amanha', hora: '18:00' }, hoje: 'qua' })
  })

  it('dia fechado: aponta o proximo dia com expediente, pelo nome', () => {
    // domingo 22:30 em Gostoso: segunda fecha, terca abre -> "ter"
    const s = statusDeAbertura(jantar, em('2026-10-12T01:30:00Z'))
    expect(s).toEqual({ estado: 'fechado', proxima: { quando: 'ter', hora: '18:00' }, hoje: 'dom' })
  })

  it('expediente que passa da meia-noite continua aberto no dia seguinte', () => {
    const bar: Horarios = { sex: { open: '20:00', close: '02:00', closed: false } }
    const s = statusDeAbertura(bar, em('2026-10-10T03:30:00Z')) // sab 00:30 em Gostoso
    expect(s).toMatchObject({ estado: 'aberto', ate: '02:00', hoje: 'sab' })
    const antes = statusDeAbertura(bar, em('2026-10-10T00:00:00Z')) // sex 21:00
    expect(antes).toMatchObject({ estado: 'aberto', ate: '02:00', hoje: 'sex' })
  })

  it('sem horarios cadastrados', () => {
    expect(statusDeAbertura(null, em('2026-10-07T22:00:00Z'))).toMatchObject({ estado: 'sem-horario' })
    expect(statusDeAbertura({}, em('2026-10-07T22:00:00Z'))).toMatchObject({ estado: 'sem-horario' })
  })

  it('00:00 a 00:00 em todos os dias e horario nunca preenchido: sem status', () => {
    const vazio: Horarios = Object.fromEntries(
      ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((d) => [d, { open: '00:00', close: '00:00', closed: false }]),
    )
    expect(statusDeAbertura(vazio, em('2026-10-07T22:00:00Z'))).toMatchObject({ estado: 'sem-horario' })
  })

  it('horario mal formado nao quebra: trata como fechado', () => {
    const ruim: Horarios = { qua: { open: 'x', close: 'y', closed: false } }
    expect(statusDeAbertura(ruim, em('2026-10-07T22:00:00Z'))).toMatchObject({ estado: 'fechado', proxima: null })
  })
})

describe('estaAbertoAgora (filtro "Aberto agora" das listas)', () => {
  it('concorda com o selo: aberto so dentro do expediente, no fuso de Gostoso', () => {
    expect(estaAbertoAgora(jantar, em('2026-10-07T22:00:00Z'))).toBe(true) // 19:00 qua
    expect(estaAbertoAgora(jantar, em('2026-10-07T17:00:00Z'))).toBe(false) // 14:00 qua
    expect(estaAbertoAgora(jantar, em('2026-10-06T22:00:00Z'))).toBe(true) // 19:00 ter
  })

  it('sem horario nao conta como aberto', () => {
    expect(estaAbertoAgora(null, em('2026-10-07T22:00:00Z'))).toBe(false)
  })
})
