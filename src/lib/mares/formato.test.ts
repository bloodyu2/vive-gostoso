import { describe, expect, it } from 'vitest'
import { formatarAltura, rotuloDoDia, resumoDoDia } from './formato'

describe('formato da tabua', () => {
  it('altura com virgula em pt e es, ponto em en', () => {
    expect(formatarAltura(0.14, 'pt')).toBe('0,14 m')
    expect(formatarAltura(2.5, 'es')).toBe('2,50 m')
    expect(formatarAltura(2.44, 'en')).toBe('2.44 m')
  })

  it('hoje e amanha pelo nome, os outros pelo dia da semana', () => {
    expect(rotuloDoDia('2026-09-27', '2026-09-27', 'pt')).toEqual({ nome: 'Hoje', data: '27/9' })
    expect(rotuloDoDia('2026-09-28', '2026-09-27', 'en')).toEqual({ nome: 'Tomorrow', data: '9/28' })
    expect(rotuloDoDia('2026-09-29', '2026-09-27', 'pt')).toEqual({ nome: 'Ter', data: '29/9' })
    expect(rotuloDoDia('2026-09-29', '2026-09-27', 'es')).toEqual({ nome: 'Mar', data: '29/9' })
  })

  it('resume o dia para o Open Graph', () => {
    const eventos = [
      { hora: '4h25', altura: 2.51, tipo: 'alta' as const, iso: '' },
      { hora: '10h23', altura: 0.14, tipo: 'baixa' as const, iso: '' },
    ]
    expect(resumoDoDia(eventos, 'pt')).toBe('alta 4h25 (2,51 m), baixa 10h23 (0,14 m)')
    expect(resumoDoDia(eventos, 'en')).toBe('high 4h25 (2.51 m), low 10h23 (0.14 m)')
    expect(resumoDoDia([], 'pt')).toBeNull()
  })
})
