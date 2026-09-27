import { describe, expect, it } from 'vitest'
import { validarJsonLd } from './validar-json-ld'
import { jsonLdExplore, jsonLdMapa, jsonLdVitrine } from './seo-explore'
import { jsonLdMares } from '@/lib/mares/seo-mares'
import { webSiteSchema } from '@/lib/seo'
import { PONTOS_MAPA } from '@/data/pontos-mapa'
import { PRAIAS_MARES } from '@/data/praias-mares'
import { ITENS_VITRINE } from './vitrine'

const LANGS = ['pt', 'en', 'es'] as const

function nos(d: Record<string, unknown>): Array<Record<string, unknown>> {
  return (Array.isArray(d['@graph']) ? d['@graph'] : [d]) as Array<Record<string, unknown>>
}

describe('validador local de JSON-LD', () => {
  it('reprova tipo inventado, lista fora de ordem, coordenada fora do intervalo e Dataset sem autor', () => {
    expect(validarJsonLd({ '@context': 'https://schema.org', '@type': 'Praia', name: 'x' })).not.toEqual([])
    expect(
      validarJsonLd({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 2 }] }),
    ).not.toEqual([])
    expect(
      validarJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Beach',
        name: 'x',
        geo: { '@type': 'GeoCoordinates', latitude: 200, longitude: 0 },
      }),
    ).not.toEqual([])
    expect(validarJsonLd({ '@context': 'https://schema.org', '@type': 'Dataset', name: 'x' })).not.toEqual([])
  })
})

describe('JSON-LD das paginas tocadas', () => {
  it('home: ItemList da vitrine valido, um item por cartao', () => {
    for (const lang of LANGS) {
      const d = jsonLdVitrine(lang)
      expect(validarJsonLd(d)).toEqual([])
      expect(d['@type']).toBe('ItemList')
      expect((d.itemListElement as unknown[]).length).toBe(ITENS_VITRINE.length)
    }
  })

  it('home: WebSite sem SearchAction, porque o site nao tem pagina de busca por URL', () => {
    const w = webSiteSchema()
    expect(validarJsonLd(w)).toEqual([])
    expect(w.potentialAction).toBeUndefined()
  })

  it('explore: BreadcrumbList e ItemList validos', () => {
    for (const lang of LANGS) {
      const d = jsonLdExplore(lang)
      expect(validarJsonLd(d)).toEqual([])
      const tipos = nos(d).map((n) => n['@type'])
      expect(tipos).toContain('BreadcrumbList')
      expect(tipos).toContain('ItemList')
    }
  })

  it('mapa: trilha Explore > Mapa e um Beach/TouristAttraction/Place por ponto, com geo', () => {
    for (const lang of LANGS) {
      const d = jsonLdMapa(lang)
      expect(validarJsonLd(d)).toEqual([])
      const lista = nos(d).find((n) => n['@type'] === 'ItemList')!
      const lugares = (lista.itemListElement as Array<{ item: Record<string, unknown> }>).map((i) => i.item)
      expect(lugares.length).toBe(PONTOS_MAPA.length)
      for (const l of lugares) {
        expect(['Beach', 'TouristAttraction', 'Place']).toContain(l['@type'])
        expect(l.geo).toBeDefined()
      }
      expect(lugares.filter((l) => l['@type'] === 'Beach').length).toBe(PONTOS_MAPA.filter((p) => p.categoria === 'praias').length)
      const trilha = nos(d).find((n) => n['@type'] === 'BreadcrumbList')!
      expect((trilha.itemListElement as unknown[]).length).toBe(3)
    }
  })

  it('mares: Dataset citando a Marinha, valido', () => {
    for (const lang of LANGS) {
      const d = jsonLdMares(lang)
      expect(validarJsonLd(d)).toEqual([])
      const ds = nos(d).find((n) => n['@type'] === 'Dataset')
      expect(ds, lang).toBeDefined()
      expect(JSON.stringify(ds)).toContain('Marinha do Brasil')
    }
  })

  it('mares por praia: Beach valido', () => {
    for (const praia of PRAIAS_MARES) expect(validarJsonLd(jsonLdMares('pt', praia)), praia.slug).toEqual([])
  })
})
