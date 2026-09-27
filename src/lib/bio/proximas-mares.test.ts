import { describe, expect, it } from 'vitest'
import { proximasMares } from './proximas-mares'

const ev = (tipo: 'alta' | 'baixa', iso: string, altura = 1) => ({ tipo, iso, altura })
// 27/09 e 28/09, horario de Fortaleza (UTC-3)
const eventos = [
  ev('baixa', '2026-09-27T05:10:00-03:00', 0.3),
  ev('alta', '2026-09-27T11:20:00-03:00', 2.4),
  ev('baixa', '2026-09-27T17:30:00-03:00', 0.4),
  ev('alta', '2026-09-27T23:40:00-03:00', 2.3),
  ev('baixa', '2026-09-28T06:00:00-03:00', 0.2),
]

describe('proximasMares', () => {
  it('acha a proxima baixa e a proxima alta a partir de agora', () => {
    const r = proximasMares(eventos, new Date('2026-09-27T10:00:00-03:00'))
    expect(r.baixa).toEqual({ hora: '17h30', altura: 0.4, amanha: false })
    expect(r.alta).toEqual({ hora: '11h20', altura: 2.4, amanha: false })
  })

  it('cruza para amanha e marca', () => {
    const r = proximasMares(eventos, new Date('2026-09-27T18:00:00-03:00'))
    expect(r.baixa).toEqual({ hora: '6h00', altura: 0.2, amanha: true })
    expect(r.alta).toEqual({ hora: '23h40', altura: 2.3, amanha: false })
  })

  it('amanha segue o dia local, nao o UTC', () => {
    // 22h local de 27/09 ja e 28/09 em UTC
    const r = proximasMares(eventos, new Date('2026-09-27T22:00:00-03:00'))
    expect(r.alta?.amanha).toBe(false)
  })

  it('sem evento futuro devolve null', () => {
    const r = proximasMares(eventos, new Date('2026-09-29T00:00:00-03:00'))
    expect(r).toEqual({ baixa: null, alta: null })
    expect(proximasMares([], new Date())).toEqual({ baixa: null, alta: null })
  })
})
