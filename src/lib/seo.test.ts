import { describe, it, expect } from 'vitest'
import { itemListSchema, localizedUrl, articleSchema, localBusinessSchema, touristDestinationSchema, organizationSchema } from './seo'
import { OFFICIAL_WHATSAPP } from './whatsapp'

const LOCALES = ['pt', 'en', 'es'] as const

/* O Search Console reportou ~428 URLs fora do indice com motivo de canonical.
   O canonical e o og:url ja foram corrigidos em page-metadata.ts, mas o
   JSON-LD (itemListSchema de come/fique/passeie, e os itens que ele lista)
   continuava apontando sempre para a versao em portugues, contradizendo o
   hreflang. localizedUrl() e a funcao que as paginas [lang]/come, fique e
   passeie usam para montar tanto a url da pagina quanto a url de cada item
   da lista — este teste cobre exatamente essa funcao e o schema que a
   consome, e nao so uma reconstrucao paralela da logica. */
describe('localizedUrl', () => {
  it('nao prefixa o portugues, mas prefixa en e es', () => {
    expect(localizedUrl('/come', 'pt')).toBe('https://www.vivegostoso.com.br/come')
    expect(localizedUrl('/come', 'en')).toBe('https://www.vivegostoso.com.br/en/come')
    expect(localizedUrl('/come', 'es')).toBe('https://www.vivegostoso.com.br/es/come')
  })

  it('cada locale e distinto do pt, nunca cai de volta pra raiz', () => {
    const pt = localizedUrl('/negocio/pousada-x', 'pt')
    for (const lang of ['en', 'es'] as const) {
      const url = localizedUrl('/negocio/pousada-x', lang)
      expect(url, `${lang}`).toContain(`/${lang}/`)
      expect(url, `${lang}`).not.toBe(pt)
    }
  })
})

/* itemListSchema fica em come/fique/passeie: a url da pagina E a url de cada
   item precisam acompanhar o locale corrente (numa pagina /en/come, os itens
   devem apontar para /en/negocio/<slug>, nao /negocio/<slug>). */
describe('itemListSchema com locale', () => {
  const businesses = [
    { name: 'Restaurante A', slug: 'restaurante-a' },
    { name: 'Restaurante B', slug: 'restaurante-b' },
  ]

  it('a url da pagina e a url de cada item do JSON-LD levam o prefixo do locale', () => {
    for (const lang of LOCALES) {
      const schema = itemListSchema({
        name: 'Restaurantes em Sao Miguel do Gostoso',
        description: 'desc',
        url: localizedUrl('/come', lang),
        items: businesses.map(b => ({ name: b.name, url: localizedUrl(`/negocio/${b.slug}`, lang) })),
      })

      const items = schema.itemListElement as Array<{ url: string }>
      // laco sobre colecao vazia passaria sem checar nada: garante que ha itens de fato
      expect(items.length).toBe(businesses.length)

      if (lang === 'pt') {
        expect(schema.url).toBe('https://www.vivegostoso.com.br/come')
        for (const item of items) {
          expect(item.url).not.toContain('/en/')
          expect(item.url).not.toContain('/es/')
        }
      } else {
        expect(schema.url, lang).toContain(`/${lang}/come`)
        for (const item of items) {
          expect(item.url, lang).toContain(`/${lang}/negocio/`)
        }
      }
    }
  })
})

/* articleSchema e localBusinessSchema (blog/[slug] e negocio/[slug]) ja
   recebem a url pronta com o prefixo do locale calculada na propria pagina;
   aqui garantimos que o schema apenas ecoa essa url sem reescreve-la para a
   raiz em pt (o que apagaria o locale recebido). */
describe('articleSchema e localBusinessSchema ecoam a url recebida', () => {
  it('articleSchema usa a mesma url no campo url e em mainEntityOfPage.@id', () => {
    for (const lang of LOCALES) {
      const url = localizedUrl('/blog/post-x', lang)
      const schema = articleSchema({ title: 't', description: 'd', url })
      expect(schema.url).toBe(url)
      expect((schema.mainEntityOfPage as { '@id': string })['@id']).toBe(url)
      if (lang !== 'pt') expect(String(schema.url)).toContain(`/${lang}/`)
    }
  })

  it('localBusinessSchema usa a url recebida sem normalizar para a raiz pt', () => {
    for (const lang of LOCALES) {
      const url = localizedUrl('/negocio/pousada-x', lang)
      const schema = localBusinessSchema({ name: 'n', description: 'd', url })
      expect(schema.url).toBe(url)
      if (lang !== 'pt') expect(String(schema.url)).toContain(`/${lang}/`)
    }
  })
})

type TouristDestinationShape = {
  '@type': string
  name: string
  geo: { latitude: number; longitude: number }
  containedInPlace: { name: string; containedInPlace: { name: string } }
  subjectOf: Array<{ url: string }>
}

type OrganizationWithContactPointShape = {
  contactPoint?: { '@type': string; telephone: string }
}

describe('touristDestinationSchema', () => {
  it('declara o tipo, a geo e o estado que contem a cidade', () => {
    const s = touristDestinationSchema() as unknown as TouristDestinationShape
    expect(s['@type']).toBe('TouristDestination')
    expect(s.name).toBe('São Miguel do Gostoso')
    expect(s.geo.latitude).toBeCloseTo(-5.1189, 3)
    expect(s.geo.longitude).toBeCloseTo(-35.3583, 3)
    expect(s.containedInPlace.name).toBe('Rio Grande do Norte')
    expect(s.containedInPlace.containedInPlace.name).toBe('Brasil')
  })

  it('aponta para as paginas dos modulos, todas absolutas', () => {
    const s = touristDestinationSchema() as unknown as TouristDestinationShape
    expect(Array.isArray(s.subjectOf)).toBe(true)
    expect(s.subjectOf.length).toBeGreaterThanOrEqual(5)
    const urls = s.subjectOf.map((x) => x.url)
    for (const p of ['/come', '/fique', '/passeie', '/explore', '/participe']) {
      expect(urls).toContain(`https://www.vivegostoso.com.br${p}`)
    }
    for (const u of urls) expect(u).toMatch(/^https:\/\//)
  })
})

describe('organizationSchema contactPoint', () => {
  it('inclui o WhatsApp oficial como contactPoint, batendo com OFFICIAL_WHATSAPP', () => {
    const s = organizationSchema() as unknown as OrganizationWithContactPointShape
    expect(s.contactPoint).toBeDefined()
    expect(s.contactPoint?.['@type']).toBe('ContactPoint')
    expect(s.contactPoint?.telephone).toBe(`+${OFFICIAL_WHATSAPP}`)
    expect(s.contactPoint?.telephone).toBe('+5584936180839')
  })
})
