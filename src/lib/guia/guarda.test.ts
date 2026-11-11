import { describe, expect, it } from 'vitest'
import { GUIA } from './config'
import { chaveDoVisitante, criarGuarda } from './guarda'

const HORA = 60 * 60 * 1000
const DIA = 24 * HORA

function relogio(inicio = 1_800_000_000_000) {
  let t = inicio
  return { agora: () => t, avancar: (ms: number) => { t += ms } }
}

describe('guarda do guia', () => {
  it('libera ate o limite por hora e barra a mensagem seguinte', () => {
    const r = relogio()
    const g = criarGuarda(r.agora)
    for (let i = 0; i < GUIA.limiteHora; i++) expect(g.permitir('a')).toEqual({ ok: true })
    const d = g.permitir('a')
    expect(d.ok).toBe(false)
    if (!d.ok) {
      expect(d.motivo).toBe('hora')
      expect(d.tentarEmSegundos).toBeGreaterThan(0)
      expect(d.tentarEmSegundos).toBeLessThanOrEqual(3600)
    }
  })

  it('a janela da hora corre: passada 1 hora, volta a liberar', () => {
    const r = relogio()
    const g = criarGuarda(r.agora)
    for (let i = 0; i < GUIA.limiteHora; i++) g.permitir('a')
    r.avancar(HORA + 1000)
    expect(g.permitir('a')).toEqual({ ok: true })
  })

  it('limite por dia vale mesmo com as horas livres', () => {
    const r = relogio()
    const g = criarGuarda(r.agora, 10_000)
    let liberadas = 0
    for (let h = 0; h < 24; h++) {
      for (let i = 0; i < GUIA.limiteHora; i++) {
        if (g.permitir('a').ok) liberadas++
      }
      r.avancar(HORA + 1000)
    }
    expect(liberadas).toBe(GUIA.limiteDia)
  })

  it('cada visitante tem o seu contador', () => {
    const g = criarGuarda(relogio().agora)
    for (let i = 0; i < GUIA.limiteHora; i++) g.permitir('a')
    expect(g.permitir('a').ok).toBe(false)
    expect(g.permitir('b')).toEqual({ ok: true })
  })

  it('teto diario do site desliga para todos e volta no dia seguinte', () => {
    const r = relogio(Math.floor(1_800_000_000_000 / DIA) * DIA + 1000)
    const g = criarGuarda(r.agora, 3)
    expect(g.permitir('a').ok).toBe(true)
    expect(g.permitir('b').ok).toBe(true)
    expect(g.permitir('c').ok).toBe(true)
    const d = g.permitir('d')
    expect(d.ok).toBe(false)
    if (!d.ok) expect(d.motivo).toBe('teto')
    r.avancar(DIA)
    expect(g.permitir('d').ok).toBe(true)
  })

  it('abusos repetidos bloqueiam o visitante por 1 hora', () => {
    const r = relogio()
    const g = criarGuarda(r.agora)
    for (let i = 0; i < GUIA.limiteAbusos - 1; i++) expect(g.registrarAbuso('x')).toBe(false)
    expect(g.registrarAbuso('x')).toBe(true)
    const d = g.permitir('x')
    expect(d.ok).toBe(false)
    if (!d.ok) expect(d.motivo).toBe('bloqueado')
    r.avancar(GUIA.bloqueioMs + 1000)
    expect(g.permitir('x')).toEqual({ ok: true })
  })

  it('abusos espalhados por mais de 1 hora nao bloqueiam', () => {
    const r = relogio()
    const g = criarGuarda(r.agora)
    g.registrarAbuso('x')
    r.avancar(HORA + 1000)
    g.registrarAbuso('x')
    r.avancar(HORA + 1000)
    expect(g.registrarAbuso('x')).toBe(false)
  })

  it('o identificador do visitante e um hash: nao contem o IP e muda com o sal', () => {
    const a = chaveDoVisitante('203.0.113.9', 'Mozilla/5.0', 'sal1')
    expect(a).not.toContain('203')
    expect(a).toHaveLength(24)
    expect(chaveDoVisitante('203.0.113.9', 'Mozilla/5.0', 'sal2')).not.toBe(a)
    expect(chaveDoVisitante('203.0.113.9', 'Mozilla/5.0', 'sal1')).toBe(a)
  })
})
