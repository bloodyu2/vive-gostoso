import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/* Toda leitura publica de negocio por slug ou por busca pede negocio ativo E
   publicado. O banco ja exige os dois (migracao 20261007100100); o filtro no
   codigo mantem a regra legivel onde a consulta e escrita. */
const ARQUIVOS = [
  'src/lib/supabase/queries.ts',
  'src/lib/supabase/build-queries.ts',
  'src/components/search/global-search.tsx',
]

describe('leituras publicas de gostoso_businesses', () => {
  for (const arquivo of ARQUIVOS) {
    it(`${arquivo}: quem filtra por active tambem filtra por is_published`, () => {
      const codigo = readFileSync(resolve(process.cwd(), arquivo), 'utf8')
      const inicios = [...codigo.matchAll(/from\('gostoso_businesses'\)/g)].map((m) => m.index ?? 0)
      expect(inicios.length).toBeGreaterThan(0)
      for (const inicio of inicios) {
        // A cadeia da consulta termina no primeiro `await`/`return`/`;` ou 600 caracteres depois.
        const trecho = codigo.slice(inicio, inicio + 600)
        if (trecho.includes(".eq('active', true)")) {
          expect(trecho, `consulta em ${arquivo} sem is_published`).toContain(".eq('is_published', true)")
        }
      }
    })
  }
})
