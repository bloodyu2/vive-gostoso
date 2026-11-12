import { describe, expect, it } from 'vitest'
import grupos from '@/data/blog-traducoes.json'
import { visivelNoIdioma } from './traducoes'

type Grupo = { pt: string; es: string; en: string }
const GRUPOS = grupos as Grupo[]

/* 08/11/2026: o trio do Réveillon ficou fora do arquivo e o blog em português
   mostrava o mesmo artigo nos três idiomas. Estes testes travam o arquivo; o
   script `npm run checar:blog` confere os posts publicados no banco. */
describe('dados de traducao do blog', () => {
  it('todo grupo tem os tres idiomas, todos diferentes', () => {
    for (const g of GRUPOS) {
      expect(g.pt, JSON.stringify(g)).toBeTruthy()
      expect(g.es, JSON.stringify(g)).toBeTruthy()
      expect(g.en, JSON.stringify(g)).toBeTruthy()
      expect(new Set([g.pt, g.es, g.en]).size).toBe(3)
    }
  })

  it('nenhum slug aparece em dois grupos', () => {
    const todos = GRUPOS.flatMap((g) => [g.pt, g.es, g.en])
    expect(new Set(todos).size).toBe(todos.length)
  })

  it('o trio do Reveillon esta registrado e so aparece no proprio idioma', () => {
    const pt = 'reveillon-sao-miguel-do-gostoso-2026'
    const es = 'nochevieja-sao-miguel-do-gostoso-2026'
    const en = 'new-years-eve-sao-miguel-do-gostoso-2026'
    expect(GRUPOS.some((g) => g.pt === pt && g.es === es && g.en === en)).toBe(true)
    expect(visivelNoIdioma(pt, 'pt')).toBe(true)
    expect(visivelNoIdioma(es, 'pt')).toBe(false)
    expect(visivelNoIdioma(en, 'pt')).toBe(false)
  })

  it('o guia dos reveillons de 2027 esta registrado e so aparece no proprio idioma', () => {
    const pt = 'reveillon-sao-miguel-do-gostoso-2027-festas-e-ingressos'
    const es = 'nochevieja-sao-miguel-do-gostoso-2027-fiestas-y-entradas'
    const en = 'new-years-eve-sao-miguel-do-gostoso-2027-parties-and-tickets'
    expect(GRUPOS.some((g) => g.pt === pt && g.es === es && g.en === en)).toBe(true)
    expect(visivelNoIdioma(pt, 'pt')).toBe(true)
    expect(visivelNoIdioma(es, 'pt')).toBe(false)
    expect(visivelNoIdioma(en, 'es')).toBe(false)
  })

  it('os posts de ventos e da Mostra de 2026 estao registrados e so aparecem no proprio idioma', () => {
    const trios = [
      ['copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso', 'copa-dos-ventos-y-sertoes-kitesurf-noviembre-2026-gostoso', 'copa-dos-ventos-and-sertoes-kitesurf-november-2026-gostoso'],
      ['mostra-de-cinema-de-gostoso-2026-filmes-e-programacao', 'mostra-de-cine-de-gostoso-2026-peliculas-y-programacion', 'gostoso-film-festival-2026-films-and-schedule'],
    ]
    for (const [pt, es, en] of trios) {
      expect(GRUPOS.some((g) => g.pt === pt && g.es === es && g.en === en), pt).toBe(true)
      expect(visivelNoIdioma(pt, 'pt')).toBe(true)
      expect(visivelNoIdioma(es, 'pt')).toBe(false)
      expect(visivelNoIdioma(en, 'es')).toBe(false)
    }
  })
})
