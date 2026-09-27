import { describe, expect, it } from 'vitest'
import { rotasMares, slugsDasPraias } from '../../../scripts/mares-slugs.mjs'
import { PRAIAS_MARES } from '@/data/praias-mares'
import { metadadosDaPraia, urlMares, textosMares } from './seo-mares'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const NOVAS = ['minhoto', 'praia-do-amor', 'ze-martins', 'malhada', 'perobas', 'carnaubinha', 'farol-do-calcanhar', 'cajueiro']

describe('praias novas no sitemap e nos tres idiomas', () => {
  it('o sitemap le a mesma lista de praias da pagina', () => {
    expect(slugsDasPraias(process.cwd())).toEqual(PRAIAS_MARES.map((p) => p.slug))
  })

  it('o sitemap tem o indice e uma rota por praia nova', () => {
    const caminhos = rotasMares(process.cwd()).map((r) => r.path)
    expect(caminhos[0]).toBe('/explore/mares')
    for (const slug of NOVAS) expect(caminhos).toContain(`/explore/mares/${slug}`)
  })

  it('cada praia nova tem URL e metadados em pt, en e es', () => {
    for (const slug of NOVAS) {
      const praia = PRAIAS_MARES.find((p) => p.slug === slug)!
      expect(urlMares('pt', slug)).toBe(`https://www.vivegostoso.com.br/explore/mares/${slug}`)
      expect(urlMares('en', slug)).toBe(`https://www.vivegostoso.com.br/en/explore/mares/${slug}`)
      expect(urlMares('es', slug)).toBe(`https://www.vivegostoso.com.br/es/explore/mares/${slug}`)
      for (const lang of ['pt', 'en', 'es'] as const) {
        const m = metadadosDaPraia(praia, lang, null)
        expect(Object.keys(m.alternates?.languages ?? {})).toEqual(['pt-BR', 'en', 'es', 'x-default'])
        expect((m.title as { absolute: string }).absolute).toContain(praia.nome)
      }
    }
  })

  it('os textos novos existem nos tres idiomas', () => {
    const chaves = ['fonte', 'aviso', 'estacao', 'estacao_sem_distancia', 'distancias_titulo', 'distancia_item', 'com_reserva', 'dados_do', 'admin_aviso']
    for (const d of [pt, en, es]) for (const k of chaves) expect((d.mares as Record<string, unknown>)[k]).toBeTruthy()
    expect(textosMares('pt').fonte.replace('{estacao}', 'Porto de Guamaré')).toBe(
      'Fonte: Tábuas de Maré da Marinha do Brasil (CHM/DHN), estação Porto de Guamaré',
    )
  })
})
