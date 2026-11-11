import { describe, expect, it } from 'vitest'
import { preencher, textosMares, tituloDoIndice, urlMares, metadadosDaPraia, jsonLdMares } from './seo-mares'
import { praiaPorSlug } from '@/data/praias-mares'

const cardeiro = praiaPorSlug('cardeiro')!

describe('textos e urls da tabua', () => {
  it('preenche variaveis do texto', () => {
    expect(preencher('{rotulo}: melhor entre {inicio} e {fim}', { rotulo: 'Piscinas', inicio: '9h10', fim: '11h40' }))
      .toBe('Piscinas: melhor entre 9h10 e 11h40')
  })

  it('tem os textos nos tres idiomas', () => {
    expect(textosMares('pt').titulo).toBe('Tábua de marés')
    expect(textosMares('en').titulo).toBe('Tide table')
    expect(textosMares('es').titulo).toBe('Tabla de mareas')
  })

  it('h1 do indice leva o nome da cidade', () => {
    expect(tituloDoIndice('pt')).toBe('Tábua de marés de São Miguel do Gostoso: maré hoje')
    expect(tituloDoIndice('en')).toContain('São Miguel do Gostoso')
  })

  it('url sem prefixo no pt e com prefixo em en/es', () => {
    expect(urlMares('pt')).toBe('https://www.vivegostoso.com.br/explore/mares')
    expect(urlMares('en', 'cardeiro')).toBe('https://www.vivegostoso.com.br/en/explore/mares/cardeiro')
    expect(urlMares('es', 'cardeiro')).toBe('https://www.vivegostoso.com.br/es/explore/mares/cardeiro')
  })
})

describe('metadados da praia', () => {
  const m = metadadosDaPraia(cardeiro, 'en', 'Low 10h23 (0.14 m), high 16h46 (2.44 m)')

  it('canonical do proprio idioma e hreflang nos tres', () => {
    expect(m.alternates?.canonical).toBe('https://www.vivegostoso.com.br/en/explore/mares/cardeiro')
    const langs = m.alternates?.languages as Record<string, string>
    expect(langs['pt-BR']).toBe('https://www.vivegostoso.com.br/explore/mares/cardeiro')
    expect(langs.es).toBe('https://www.vivegostoso.com.br/es/explore/mares/cardeiro')
    expect(langs['x-default']).toBe(langs['pt-BR'])
  })

  it('open graph leva a mare do dia na descricao', () => {
    expect(String(m.openGraph?.description)).toContain('Low 10h23')
    expect(m.openGraph?.url).toBe(m.alternates?.canonical)
  })

  it('titulo com o nome da praia', () => {
    const t = m.title as { absolute: string }
    expect(t.absolute).toBe('Tide table: Praia do Cardeiro')
  })
})

describe('JSON-LD', () => {
  const ld = jsonLdMares('pt', cardeiro) as { '@graph': Array<Record<string, unknown>> }
  const tipos = ld['@graph'].map((n) => n['@type'])

  it('declara pagina, praia com coordenadas e trilha', () => {
    expect(tipos).toEqual(['WebPage', ['Beach', 'TouristAttraction'], 'BreadcrumbList'])
    const praia = ld['@graph'][1] as { geo: { latitude: number; longitude: number } }
    expect(praia.geo.latitude).toBe(-5.12024)
  })

  it('praia: municipio em containedInPlace e mapa pela coordenada; sem avaliacao nem preco', () => {
    const praia = ld['@graph'][1] as Record<string, unknown>
    expect(praia.containedInPlace).toMatchObject({ '@type': 'City', name: 'São Miguel do Gostoso' })
    expect(praia.hasMap).toBe('https://www.google.com/maps/search/?api=1&query=-5.12024,-35.62901')
    for (const campo of ['aggregateRating', 'review', 'priceRange', 'offers']) expect(praia).not.toHaveProperty(campo)
  })

  it('praia sem coordenada: sem geo e sem mapa, mas com municipio', () => {
    const minhoto = praiaPorSlug('minhoto')!
    const praia = (jsonLdMares('pt', minhoto) as { '@graph': Array<Record<string, unknown>> })['@graph'][1]
    expect(praia).not.toHaveProperty('geo')
    expect(praia).not.toHaveProperty('hasMap')
    expect(praia.containedInPlace).toMatchObject({ name: minhoto.municipio })
  })

  it('cita a Marinha como base', () => {
    const pagina = ld['@graph'][0] as { isBasedOn: { url: string } }
    expect(pagina.isBasedOn.url).toBe('https://www.marinha.mil.br/chm/tabuas-de-mare-6')
  })

  it('pagina indice nao tem praia', () => {
    const indice = jsonLdMares('es') as { '@graph': Array<Record<string, unknown>> }
    expect(indice['@graph'].map((n) => n['@type'])).toEqual(['WebPage', 'Dataset', 'BreadcrumbList'])
  })
})
