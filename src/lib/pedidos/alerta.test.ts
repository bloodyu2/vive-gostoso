import { describe, expect, it } from 'vitest'
import { NOTAS_DO_ALARME, criarAlarme } from './alerta'

function ambiente(opcoes: { semAudio?: boolean; semWake?: boolean; audioSuspenso?: boolean; wakeFalha?: boolean; wakeManual?: boolean } = {}) {
  const log: string[] = []
  const audios: { state: string }[] = []
  const pedidosDeWake: (() => void)[] = []
  const ouvintes = new Map<string, () => void>()
  const doc = {
    visibilityState: 'visible',
    addEventListener: (e: string, f: () => void) => {
      log.push(`doc+${e}`)
      ouvintes.set(e, f)
    },
    removeEventListener: (e: string) => {
      log.push(`doc-${e}`)
      ouvintes.delete(e)
    },
  }
  class Audio {
    state = opcoes.audioSuspenso ? 'suspended' : 'running'
    constructor() {
      audios.push(this)
    }
    currentTime = 10
    destination = {}
    async resume() {
      log.push('resume')
      this.state = 'running'
    }
    async close() {
      log.push('close')
      this.state = 'closed'
    }
    createOscillator() {
      const o = { type: '', frequency: { value: 0 }, connect: () => undefined, start: (t: number) => log.push(`osc.start@${t.toFixed(2)}:${o.frequency.value}`), stop: () => undefined }
      return o
    }
    createGain() {
      return { gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined }, connect: () => undefined }
    }
  }
  const env = {
    ...(opcoes.semAudio ? {} : { AudioContext: Audio }),
    navigator: opcoes.semWake
      ? {}
      : {
          wakeLock: {
            request: async () => {
              if (opcoes.wakeFalha) throw new Error('negado')
              if (opcoes.wakeManual) await new Promise<void>((ok) => pedidosDeWake.push(ok))
              log.push('wake.on')
              return { release: async () => void log.push('wake.off') }
            },
          },
        },
    document: doc,
  }
  return { env, log, ouvintes, doc, audios, pedidosDeWake }
}

describe('alarme de pedido novo', () => {
  it('liga som e tela com um toque e so toca depois de ligado', async () => {
    const { env, log } = ambiente()
    const a = criarAlarme(env)
    a.tocar()
    expect(log.filter((l) => l.startsWith('osc'))).toEqual([])
    const r = await a.ligar()
    expect(r).toEqual({ som: true, tela: true })
    expect(a.ligado).toBe(true)
    a.tocar()
    const toques = log.filter((l) => l.startsWith('osc.start'))
    expect(toques).toHaveLength(NOTAS_DO_ALARME.length)
    expect(toques[0]).toContain(':880')
    expect(toques[1]).toContain(':1175')
  })

  it('acorda o audio suspenso (politica de autoplay)', async () => {
    const { env, log } = ambiente({ audioSuspenso: true })
    await criarAlarme(env).ligar()
    expect(log).toContain('resume')
  })

  it('sem Web Audio liga so a tela; sem Wake Lock liga so o som; nenhum dos dois nao quebra', async () => {
    expect(await criarAlarme(ambiente({ semAudio: true }).env).ligar()).toEqual({ som: false, tela: true })
    expect(await criarAlarme(ambiente({ semWake: true }).env).ligar()).toEqual({ som: true, tela: false })
    expect(await criarAlarme(ambiente({ semAudio: true, semWake: true }).env).ligar()).toEqual({ som: false, tela: false })
    expect(await criarAlarme(ambiente({ wakeFalha: true }).env).ligar()).toEqual({ som: true, tela: false })
  })

  it('sem som, tocar nao faz nada nem lanca erro', async () => {
    const { env, log } = ambiente({ semAudio: true })
    const a = criarAlarme(env)
    await a.ligar()
    expect(() => a.tocar()).not.toThrow()
    expect(log.filter((l) => l.startsWith('osc'))).toEqual([])
  })

  it('desligar solta a tela, fecha o audio e para de ouvir a visibilidade', async () => {
    const { env, log } = ambiente()
    const a = criarAlarme(env)
    await a.ligar()
    a.desligar()
    expect(a.ligado).toBe(false)
    expect(log).toContain('wake.off')
    expect(log).toContain('close')
    expect(log).toContain('doc-visibilitychange')
    a.tocar()
    expect(log.filter((l) => l.startsWith('osc.start'))).toEqual([])
  })

  it('ao voltar para a aba pede a tela de novo, mas so enquanto ligado', async () => {
    const { env, log, ouvintes } = ambiente()
    const a = criarAlarme(env)
    await a.ligar()
    const antes = log.filter((l) => l === 'wake.on').length
    ouvintes.get('visibilitychange')?.()
    await Promise.resolve()
    await Promise.resolve()
    expect(log.filter((l) => l === 'wake.on').length).toBe(antes + 1)
  })

  it('desligar no meio do ligar nao deixa Wake Lock preso nem alarme "ligado" fantasma', async () => {
    const { env, log, ouvintes, pedidosDeWake } = ambiente({ wakeManual: true })
    const a = criarAlarme(env)
    const ligando = a.ligar()
    await Promise.resolve()
    await Promise.resolve()
    a.desligar() // a pessoa clicou de novo antes de o navegador liberar a tela
    pedidosDeWake.forEach((ok) => ok()) // agora o navegador entrega o Wake Lock
    const r = await ligando
    expect(r).toEqual({ som: false, tela: false })
    expect(a.ligado).toBe(false)
    expect(log.filter((l) => l === 'wake.on')).toHaveLength(1)
    expect(log.filter((l) => l === 'wake.off')).toHaveLength(1) // o que chegou tarde foi solto
    expect(ouvintes.has('visibilitychange')).toBe(false)
    a.tocar()
    expect(log.filter((l) => l.startsWith('osc.start'))).toEqual([])
  })

  it('ligar de novo depois de desligar funciona do zero', async () => {
    const { env, log } = ambiente()
    const a = criarAlarme(env)
    await a.ligar()
    a.desligar()
    expect(await a.ligar()).toEqual({ som: true, tela: true })
    a.tocar()
    expect(log.filter((l) => l.startsWith('osc.start')).length).toBe(NOTAS_DO_ALARME.length)
  })

  it('contexto suspenso depois de ligado (tela apagou no iPad): acorda e so entao toca', async () => {
    const { env, log, audios } = ambiente()
    const a = criarAlarme(env)
    await a.ligar()
    audios[0].state = 'suspended'
    log.length = 0
    a.tocar()
    expect(log.filter((l) => l.startsWith('osc.start'))).toEqual([]) // ainda nao: espera o resume
    await Promise.resolve()
    await Promise.resolve()
    expect(log).toContain('resume')
    expect(log.filter((l) => l.startsWith('osc.start')).length).toBe(NOTAS_DO_ALARME.length)
  })

  it('contexto que nao acorda nao agenda nota', async () => {
    const { env, log, audios } = ambiente()
    const a = criarAlarme(env)
    await a.ligar()
    const ctx = audios[0] as unknown as { state: string; resume: () => Promise<void> }
    ctx.state = 'interrupted'
    ctx.resume = async () => undefined // continua interrompido
    log.length = 0
    a.tocar()
    await Promise.resolve()
    await Promise.resolve()
    expect(log.filter((l) => l.startsWith('osc.start'))).toEqual([])
  })
})
