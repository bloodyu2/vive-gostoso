import { describe, expect, it } from 'vitest'
import { rotasMares, slugsDasPraias, slugsIndexaveis } from '../../../scripts/mares-slugs.mjs'
import { PRAIAS_MARES, praiaSemDadoProprio } from '@/data/praias-mares'
import { metadadosDaPraia, urlMares, textosMares } from './seo-mares'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

/** Sem coordenada conferida nem dica: noindex ate alguem dar a fonte (KAN-860). */
const SEM_DADO = ['minhoto', 'ze-martins', 'malhada']
const NOVAS = ['minhoto', 'ze-martins', 'malhada', 'perobas', 'carnaubinha', 'farol-do-calcanhar', 'cajueiro']

describe('praias novas no sitemap e nos tres idiomas', () => {
  it('o sitemap le a mesma lista de praias da pagina', () => {
    expect(slugsDasPraias(process.cwd())).toEqual(PRAIAS_MARES.map((p) => p.slug))
  })

  it('o sitemap tem o indice e uma rota por praia nova que tem dado proprio', () => {
    const caminhos = rotasMares(process.cwd()).map((r) => r.path)
    expect(caminhos[0]).toBe('/explore/mares')
    for (const slug of NOVAS.filter((s) => !SEM_DADO.includes(s))) expect(caminhos).toContain(`/explore/mares/${slug}`)
  })

  it('praia sem coordenada e sem dica fica fora do sitemap e noindex (mesma regra nos dois)', () => {
    const noindex = PRAIAS_MARES.filter(praiaSemDadoProprio).map((p) => p.slug)
    expect(noindex).toEqual(SEM_DADO)
    // o sitemap (Node puro, le o texto) e a pagina (TypeScript) concordam sobre quem e indexavel
    expect(slugsIndexaveis(process.cwd())).toEqual(PRAIAS_MARES.filter((p) => !praiaSemDadoProprio(p)).map((p) => p.slug))
    const caminhos = rotasMares(process.cwd()).map((r) => r.path)
    for (const slug of noindex) expect(caminhos).not.toContain(`/explore/mares/${slug}`)
    for (const p of PRAIAS_MARES) {
      const robots = metadadosDaPraia(p, 'pt', null).robots
      if (praiaSemDadoProprio(p)) expect(robots).toEqual({ index: false, follow: true })
      else expect(robots).toBeUndefined()
    }
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
