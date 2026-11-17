import { describe, expect, it } from 'vitest'
import { TEXTOS_DO_INSTITUTO, VARIANTE, textoDoInstituto, type IdiomaDoTexto, type VarianteDoTexto } from './instituto-texto'
import { TERMOS } from '@/data/paginas-legais'

const IDIOMAS: IdiomaDoTexto[] = ['pt', 'en', 'es']
const VARIANTES = Object.keys(TEXTOS_DO_INSTITUTO) as VarianteDoTexto[]

describe('frase do Instituto Vive que acompanha a mensalidade', () => {
  it('existe nas duas redacoes e nos tres idiomas, sem travessao longo nem emoji', () => {
    for (const v of VARIANTES) {
      for (const i of IDIOMAS) {
        const t = TEXTOS_DO_INSTITUTO[v][i]
        expect(t.length, `${v}/${i}`).toBeGreaterThan(40)
        expect(t, `${v}/${i}`).not.toMatch(/—/)
        expect(t, `${v}/${i}`).not.toMatch(/\p{Extended_Pictographic}/u)
        expect(t, `${v}/${i}`).toMatch(/Instituto Vive/)
      }
    }
  })

  it('nenhuma redacao promete doacao com recibo nem diz associacao ou sem fins lucrativos (a entidade ainda nao existe)', () => {
    for (const v of VARIANTES) {
      for (const i of IDIOMAS) {
        const t = TEXTOS_DO_INSTITUTO[v][i].toLowerCase()
        expect(t, `${v}/${i}`).not.toMatch(/associa|sem fins|non-?profit|nonprofit|sin fines/)
        expect(t, `${v}/${i}`).not.toMatch(/dedu[cç]|tax deduct|recibo de doa[cç][aã]o.*(emitid|dado)/)
      }
    }
  })

  it('a redacao 232 diz que e pagamento, nao doacao, e que nao gera recibo; a 245 diz que a entidade esta em constituicao', () => {
    expect(TEXTOS_DO_INSTITUTO['pagamento-232'].pt).toMatch(/não é doação e não gera recibo de doação/)
    expect(TEXTOS_DO_INSTITUTO['pagamento-232'].en).toMatch(/not a donation/)
    expect(TEXTOS_DO_INSTITUTO['pagamento-232'].es).toMatch(/no es una donación/)
    expect(TEXTOS_DO_INSTITUTO['constituicao-245'].pt).toMatch(/em constituição/)
  })

  it('o texto vigente vai para os Termos nos tres idiomas, na secao de pagamento', () => {
    for (const i of IDIOMAS) {
      const termos = TERMOS[i]
      const pagamento = termos.secoes.find((s) => (s.paragrafos ?? []).some((p) => p.includes('5,99') || p.includes('5.99')))
      expect(pagamento, `secao de pagamento ${i}`).toBeTruthy()
      expect(pagamento!.paragrafos).toContain(textoDoInstituto(i))
    }
  })

  it('trocar a variante troca a frase em todos os idiomas', () => {
    for (const i of IDIOMAS) expect(textoDoInstituto(i, 'constituicao-245')).not.toBe(textoDoInstituto(i, 'pagamento-232'))
    expect(VARIANTES).toContain(VARIANTE)
  })
})
