// Alerta de pedido novo no navegador (KAN-907): um som curto e a tela do aparelho acesa enquanto
// o painel esta aberto. So roda no navegador e so depois de um toque da pessoa (o navegador nao
// libera som nem Wake Lock sem gesto). Se o aparelho nao suportar, o aviso continua no titulo da
// aba e na tela; nada aqui e obrigatorio para o painel funcionar.

interface WakeLockLike {
  release: () => Promise<void>
}

interface AmbienteDeAlerta {
  AudioContext?: new () => AudioContextLike
  webkitAudioContext?: new () => AudioContextLike
  navigator?: { wakeLock?: { request: (tipo: 'screen') => Promise<WakeLockLike> } }
  document?: { visibilityState?: string; addEventListener: (e: string, f: () => void) => void; removeEventListener: (e: string, f: () => void) => void }
}

interface AudioContextLike {
  state: string
  currentTime: number
  destination: unknown
  resume: () => Promise<void>
  close: () => Promise<void>
  createOscillator: () => { type: string; frequency: { value: number }; connect: (n: unknown) => void; start: (t: number) => void; stop: (t: number) => void }
  createGain: () => { gain: { setValueAtTime: (v: number, t: number) => void; exponentialRampToValueAtTime: (v: number, t: number) => void }; connect: (n: unknown) => void }
}

export interface ResultadoDoAlarme {
  /** o som esta liberado */
  som: boolean
  /** a tela fica acesa */
  tela: boolean
}

export interface Alarme {
  ligar: () => Promise<ResultadoDoAlarme>
  desligar: () => void
  /** toca o aviso; sem efeito se o alarme esta desligado ou sem som */
  tocar: () => void
  readonly ligado: boolean
}

/** Dois toques curtos e agudos, repetidos duas vezes: da para ouvir da cozinha sem assustar. */
export const NOTAS_DO_ALARME: readonly { inicio: number; hz: number; duracao: number }[] = [
  { inicio: 0, hz: 880, duracao: 0.18 },
  { inicio: 0.26, hz: 1175, duracao: 0.18 },
  { inicio: 0.9, hz: 880, duracao: 0.18 },
  { inicio: 1.16, hz: 1175, duracao: 0.18 },
]

function tocarNotas(c: AudioContextLike): void {
  try {
    for (const n of NOTAS_DO_ALARME) {
      const osc = c.createOscillator()
      const ganho = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = n.hz
      const t0 = c.currentTime + n.inicio
      ganho.gain.setValueAtTime(0.0001, t0)
      ganho.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02)
      ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + n.duracao)
      osc.connect(ganho)
      ganho.connect(c.destination)
      osc.start(t0)
      osc.stop(t0 + n.duracao + 0.02)
    }
  } catch {
    /* sem som: o aviso visual continua */
  }
}

export function criarAlarme(env: AmbienteDeAlerta = globalThis as unknown as AmbienteDeAlerta): Alarme {
  let ctx: AudioContextLike | null = null
  let wake: WakeLockLike | null = null
  let ligado = false
  // Cada ligar e cada desligar troca a geracao. Um ligar que ainda esperava o Wake Lock quando a
  // pessoa desligou (ou a aba fechou) solta o que pegou em vez de deixar o lock preso para sempre.
  let geracao = 0

  const pegarTela = async (minhaGeracao: number): Promise<boolean> => {
    try {
      const lock = env.navigator?.wakeLock
      if (!lock) return false
      const novo = await lock.request('screen')
      if (minhaGeracao !== geracao || !ligado) {
        void novo.release().catch(() => undefined)
        return false
      }
      const velho = wake
      wake = novo
      void velho?.release().catch(() => undefined)
      return true
    } catch {
      return false
    }
  }

  // O navegador solta o Wake Lock quando a aba some; ao voltar, pede de novo.
  const aoVoltar = () => {
    if (ligado && env.document?.visibilityState === 'visible') void pegarTela(geracao)
  }

  return {
    get ligado() {
      return ligado
    },
    async ligar() {
      ligado = true
      const minha = ++geracao
      let som = false
      try {
        const Ctor = env.AudioContext ?? env.webkitAudioContext
        if (Ctor) {
          ctx = ctx ?? new Ctor()
          if (ctx.state !== 'running') await ctx.resume()
          som = ctx.state === 'running'
        }
      } catch {
        som = false
      }
      const tela = await pegarTela(minha)
      // desligou (ou ligou de novo) enquanto esperava: este ligar ficou velho e nao deixa rastro
      if (minha !== geracao || !ligado) return { som: false, tela: false }
      env.document?.addEventListener('visibilitychange', aoVoltar)
      return { som, tela }
    },
    desligar() {
      ligado = false
      geracao += 1
      env.document?.removeEventListener('visibilitychange', aoVoltar)
      void wake?.release().catch(() => undefined)
      wake = null
      void ctx?.close().catch(() => undefined)
      ctx = null
    },
    tocar() {
      if (!ligado || !ctx) return
      const c = ctx
      // O Safari (iPad e iPhone) suspende ou "interrompe" o audio quando a tela apaga ou o app
      // muda: acorda antes de tocar; se nao acordar, nao agenda nota em contexto parado.
      if (c.state !== 'running') {
        void c.resume().then(
          () => {
            if (ligado && ctx === c && c.state === 'running') tocarNotas(c)
          },
          () => undefined,
        )
        return
      }
      tocarNotas(c)
    },
  }
}
