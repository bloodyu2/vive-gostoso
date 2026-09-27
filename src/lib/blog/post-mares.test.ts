import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { articleSchema } from '@/lib/seo'
import { validarJsonLd } from '@/lib/explore/validar-json-ld'
import { urlDoPost, inLanguageDoPost } from './traducoes'
import { textosCapaMares } from './capa-mares'

const SQL = readFileSync(path.resolve(import.meta.dirname, '../../../scripts/blog/2026-09-27-tabua-de-mares.sql'), 'utf8')
const SLUGS = {
  pt: 'tabua-de-mares-sao-miguel-do-gostoso',
  es: 'tabla-de-mareas-sao-miguel-do-gostoso',
  en: 'tide-table-sao-miguel-do-gostoso',
} as const

/** Conteudo de cada versao, entre os delimitadores $POST_XX$. */
function corpo(lang: 'pt' | 'es' | 'en'): string {
  const tag = `$POST_${lang.toUpperCase()}$`
  const ini = SQL.indexOf(tag)
  const fim = SQL.indexOf(tag, ini + tag.length)
  expect(ini).toBeGreaterThan(-1)
  expect(fim).toBeGreaterThan(ini)
  return SQL.slice(ini + tag.length, fim)
}

function hrefsInternos(html: string): string[] {
  return [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1])
}

describe('SQL do post da tabua de mares', () => {
  it('tem os tres slugs e grava so se nao existir', () => {
    for (const s of Object.values(SLUGS)) expect(SQL).toContain(`'${s}'`)
    expect(SQL).toContain('WHERE NOT EXISTS')
  })

  it('nao tem UPDATE nem DELETE fora de linha comentada', () => {
    const ativas = SQL.split('\n').filter((l) => !l.trim().startsWith('--'))
    for (const l of ativas) expect(l).not.toMatch(/\b(UPDATE|DELETE)\b/i)
  })

  it('autor, data e capa de cada versao', () => {
    expect(SQL).toContain(`'Vive Gostoso'`)
    expect(SQL).toMatch(/'2026-09-27[ T]/)
    for (const lang of ['pt', 'es', 'en'] as const) {
      const fim = SQL.indexOf(`$POST_${lang.toUpperCase()}$,`)
      const depois = SQL.slice(fim, fim + 200)
      expect(depois).toContain(`'https://www.vivegostoso.com.br/api/og/blog-mares?lang=${lang}'`)
    }
  })

  it('links internos seguem o idioma da versao', () => {
    const pt = hrefsInternos(corpo('pt'))
    const es = hrefsInternos(corpo('es'))
    const en = hrefsInternos(corpo('en'))
    expect(pt.length).toBeGreaterThan(0)
    expect(es.length).toBeGreaterThan(0)
    expect(en.length).toBeGreaterThan(0)
    for (const h of es) expect(h).toMatch(/^\/es\//)
    for (const h of en) expect(h).toMatch(/^\/en\//)
    for (const h of pt) expect(h).not.toMatch(/^\/(es|en)(\/|$)/)
  })

  it('sem travessao nem Unicode invisivel', () => {
    const travessao = String.fromCharCode(0x2014)
    const invisiveis = [0x00ad, 0xfeff, ...[0x200b, 0x200c, 0x200d, 0x200e, 0x200f], ...[0x2060, 0x2061, 0x2062, 0x2063, 0x2064]]
    expect(SQL.includes(travessao)).toBe(false)
    for (const c of invisiveis) expect(SQL.includes(String.fromCharCode(c)), c.toString(16)).toBe(false)
  })

  it('passeio de Perobas pela Gostosense e Boulevard apontando para a Caju Paradise', () => {
    expect(SQL).toContain('https://gostosense.com.br/passeios/perobas-de-buggy')
    const mapa = [...SQL.matchAll(/<a href="[^"]*\/explore\/mapa"[^>]*>([^<]*)<\/a>/g)].map((m) => m[1])
    for (const texto of mapa) expect(texto).not.toMatch(/Cajueiro Boulevard/i)
    const boulevard = [...SQL.matchAll(/<a href="([^"]*)"[^>]*>Cajueiro Boulevard<\/a>/g)].map((m) => m[1])
    expect(boulevard.length).toBe(3)
    for (const h of boulevard) expect(h).toMatch(/^https:\/\/www\.cajuparadise\.com\.br\//)
  })
})

describe('JSON-LD do post', () => {
  const base = {
    title: 'Tabla de mareas de São Miguel do Gostoso: la marea de hoy, playa por playa',
    description: 'Hora y altura de la marea alta y baja en 14 playas de Gostoso, Touros y Pedra Grande.',
    url: urlDoPost(SLUGS.es, 'es'),
    image: 'https://www.vivegostoso.com.br/api/og/blog-mares?lang=es',
    author: 'Vive Gostoso',
    publishedTime: '2026-09-27T12:00:00.000Z',
    inLanguage: inLanguageDoPost(SLUGS.es, 'es'),
  }

  it('BlogPosting da versao es e valido', () => {
    const d = articleSchema(base)
    expect(d['@type']).toBe('BlogPosting')
    expect(d.inLanguage).toBe('es')
    expect(String(d.datePublished)).toMatch(/^2026-09-27/)
    expect((d.author as Record<string, unknown>).name).toBe('Vive Gostoso')
    expect(validarJsonLd(d)).toEqual([])
  })

  it('o validador reprova BlogPosting sem headline, sem data ou com URL relativa', () => {
    expect(validarJsonLd({ ...articleSchema(base), headline: undefined })).not.toEqual([])
    expect(validarJsonLd(articleSchema({ ...base, publishedTime: null }))).not.toEqual([])
    expect(validarJsonLd(articleSchema({ ...base, url: '/es/blog/x' }))).not.toEqual([])
  })
})

describe('capa do post pela rota OG', () => {
  it('titulo e subtitulo nos tres idiomas', () => {
    expect(textosCapaMares('pt')).toEqual({ titulo: 'Tábua de marés de São Miguel do Gostoso', subtitulo: 'A maré de hoje, praia por praia' })
    expect(textosCapaMares('es')).toEqual({ titulo: 'Tabla de mareas de São Miguel do Gostoso', subtitulo: 'La marea de hoy, playa por playa' })
    expect(textosCapaMares('en')).toEqual({ titulo: 'São Miguel do Gostoso tide table', subtitulo: "Today's tide, beach by beach" })
  })
})
