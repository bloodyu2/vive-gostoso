import { describe, expect, it } from 'vitest'
import { dataLocal, paraInstante, formatarHora, somarDias, diasAPartirDe } from './tempo'

/* O servidor da Vercel roda em UTC. "Hoje" e "agora" do visitante sao de
   America/Fortaleza (UTC-3 fixo, sem horario de verao). */
describe('fuso America/Fortaleza', () => {
  it('23h30 UTC ainda e o mesmo dia em Gostoso', () => {
    expect(dataLocal(new Date('2026-09-27T23:30:00Z'))).toBe('2026-09-27')
  })

  it('02h00 UTC ainda e o dia anterior em Gostoso', () => {
    expect(dataLocal(new Date('2026-09-28T02:00:00Z'))).toBe('2026-09-27')
  })

  it('03h00 UTC ja e o dia seguinte em Gostoso', () => {
    expect(dataLocal(new Date('2026-09-28T03:00:00Z'))).toBe('2026-09-28')
  })

  it('hora da tabua (UTC-3) vira instante correto', () => {
    expect(paraInstante('2026-01-01', '0221').toISOString()).toBe('2026-01-01T05:21:00.000Z')
  })

  it('formata a hora local no padrao 9h10', () => {
    expect(formatarHora(new Date('2026-01-01T12:10:00Z'))).toBe('9h10')
    expect(formatarHora(new Date('2026-01-01T03:05:00Z'))).toBe('0h05')
  })

  it('soma dias sem depender do fuso do servidor', () => {
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('lista hoje e os proximos 7 dias', () => {
    const dias = diasAPartirDe('2026-09-27', 8)
    expect(dias).toHaveLength(8)
    expect(dias[0]).toBe('2026-09-27')
    expect(dias[7]).toBe('2026-10-04')
  })
})
