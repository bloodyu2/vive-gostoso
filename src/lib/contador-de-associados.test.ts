import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * KAN-92: zero associado com selo de associado na mesma tela se contradiz.
 *
 * Decisao do Victor em 17/09/2026: o contador sai, os selos ficam como
 * cortesia de pre-lancamento. Nenhum numero entra no lugar do contador.
 *
 * O teste olha o codigo-fonte e os tres locales porque o contador tinha tres
 * moradas: a chave de traducao, a prop do componente e a consulta no banco.
 * Tirar so uma delas deixa o defeito vivo em algum idioma ou volta pelo hook.
 */

const RAIZ = join(__dirname, '..')
const IDIOMAS = ['pt', 'en', 'es'] as const

function fonte(caminho: string): string {
  return readFileSync(join(RAIZ, caminho), 'utf8')
}

function locale(idioma: string): Record<string, Record<string, unknown>> {
  return JSON.parse(fonte(join('locales', `${idioma}.json`)))
}

describe('contador de associados fora da tela', () => {
  it.each(IDIOMAS)('%s nao tem chave de contagem de associados no fundo', (idioma) => {
    const fund = locale(idioma).fund ?? {}
    const chaves = Object.keys(fund).filter((k) => k.startsWith('raised_month'))
    expect(chaves).toEqual([])
  })

  it('fund-hero nao recebe nem imprime associadosCount', () => {
    expect(fonte('components/fund/fund-hero.tsx')).not.toMatch(/associadosCount|raised_month/)
  })

  it('a view do fundo nao passa contagem de associados', () => {
    expect(fonte('views/Apoie.tsx')).not.toMatch(/associadosCount|useAssociadosCount/)
  })

  it('nao sobra consulta de contagem de associados no hook do fundo', () => {
    expect(fonte('hooks/useFund.ts')).not.toMatch(/useAssociadosCount|associados-count/)
  })
})

describe('os selos continuam', () => {
  it('o cartao de negocio ainda desenha os dois selos', () => {
    const card = fonte('components/business/business-card.tsx')
    expect(card).toContain("t('filters.associado')")
    expect(card).toContain("t('filters.destaque')")
  })

  it.each(IDIOMAS)('%s ainda traduz os rotulos dos selos', (idioma) => {
    const filters = locale(idioma).filters ?? {}
    expect(typeof filters.associado).toBe('string')
    expect(typeof filters.destaque).toBe('string')
  })
})

describe('paridade entre os idiomas', () => {
  it('o namespace fund tem as mesmas chaves nos tres idiomas', () => {
    const [pt, en, es] = IDIOMAS.map((i) => Object.keys(locale(i).fund ?? {}).sort())
    expect(en).toEqual(pt)
    expect(es).toEqual(pt)
  })
})
