import { describe, expect, it } from 'vitest'
import { preencher, textosMares, urlMares, metadadosDaPraia, jsonLdMares } from './seo-mares'
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
    expect(tipos).toEqual(['WebPage', 'Beach', 'BreadcrumbList'])
    const praia = ld['@graph'][1] as { geo: { latitude: number; longitude: number } }
    expect(praia.geo.latitude).toBe(-5.12024)
  })

  it('cita a Marinha como base', () => {
    const pagina = ld['@graph'][0] as { isBasedOn: { url: string } }
    expect(pagina.isBasedOn.url).toBe('https://www.marinha.mil.br/chm/tabuas-de-mare-6')
  })

  it('pagina indice nao tem praia', () => {
    const indice = jsonLdMares('es') as { '@graph': Array<Record<string, unknown>> }
    expect(indice['@graph'].map((n) => n['@type'])).toEqual(['WebPage', 'BreadcrumbList'])
  })
})
