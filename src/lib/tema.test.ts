import { describe, it, expect } from 'vitest'
import { decidirTema, SCRIPT_ANTI_FOUC, CHAVE_TEMA, CLASSE_ESCURO } from './tema'

/**
 * Roda o script inline num ambiente falso e devolve se ele ligou a classe de
 * tema escuro. É a única forma de comparar o script com a função: ele é
 * JavaScript solto, executado antes de qualquer módulo carregar.
 */
function rodarScript(guardado: string | null, sistemaPrefereEscuro: boolean): boolean {
  let ligou: boolean | null = null
  const localStorage = { getItem: (k: string) => (k === CHAVE_TEMA ? guardado : null) }
  const matchMedia = () => ({ matches: sistemaPrefereEscuro })
  const document = {
    documentElement: {
      classList: {
        toggle: (classe: string, valor: boolean) => {
          expect(classe).toBe(CLASSE_ESCURO)
          ligou = valor
        },
      },
    },
  }
  new Function('localStorage', 'matchMedia', 'document', SCRIPT_ANTI_FOUC)(
    localStorage, matchMedia, document
  )
  if (ligou === null) throw new Error('o script nao chamou classList.toggle')
  return ligou
}

const CENARIOS: Array<[string | null, boolean, string]> = [
  ['dark', false, 'escolheu escuro, sistema claro'],
  ['light', true, 'escolheu claro, sistema escuro'],
  [null, true, 'sem escolha, sistema escuro'],
  [null, false, 'sem escolha, sistema claro'],
]

describe('script anti-FOUC e decidirTema nao podem divergir', () => {
  /* Se estes dois discordarem, a pagina pinta um tema e o React desenha o
     outro: e o mesmo defeito de hidratacao que o useSyncExternalStore
     resolveu, reintroduzido por outra porta. */
  it('concordam nos quatro cenarios possiveis', () => {
    expect(CENARIOS).toHaveLength(4)
    for (const [guardado, sistema, nome] of CENARIOS) {
      const doScript = rodarScript(guardado, sistema)
      const daFuncao = decidirTema(guardado, sistema) === 'dark'
      expect(doScript, nome).toBe(daFuncao)
    }
  })

  it('cada cenario da o resultado certo, nao so o mesmo resultado', () => {
    expect(rodarScript('dark', false)).toBe(true)
    expect(rodarScript('light', true)).toBe(false)
    expect(rodarScript(null, true)).toBe(true)
    expect(rodarScript(null, false)).toBe(false)
  })

  /* Este teste existe porque o de cima NAO pega renomear a chave: o `rodarScript`
     monta o localStorage falso a partir do proprio CHAVE_TEMA, entao os dois
     lados mudam juntos e continuam concordando. Mas renomear a chave faz toda
     pessoa que ja escolheu um tema perder a escolha em silencio. Por isso o
     valor literal fica preso aqui. */
  it('a chave e literalmente vg-theme, e o script usa essa mesma', () => {
    expect(CHAVE_TEMA).toBe('vg-theme')
    expect(SCRIPT_ANTI_FOUC).toContain('"vg-theme"')
  })

  it('valor invalido no localStorage cai no sistema, nao quebra', () => {
    expect(rodarScript('lixo', true)).toBe(true)
    expect(rodarScript('lixo', false)).toBe(false)
    expect(decidirTema('lixo', true)).toBe('dark')
  })
})
