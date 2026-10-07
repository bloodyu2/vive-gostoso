import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { safeExternalUrl } from '@/lib/utils'

describe('safeExternalUrl', () => {
  it('aceita http e https', () => {
    expect(safeExternalUrl('https://exemplo.test/a?b=1')).toBe('https://exemplo.test/a?b=1')
    expect(safeExternalUrl('http://exemplo.test/')).toBe('http://exemplo.test/')
  })

  it('completa endereco sem esquema com https', () => {
    expect(safeExternalUrl('exemplo.test/cardapio')).toBe('https://exemplo.test/cardapio')
  })

  it('recusa esquemas que executam ou embutem codigo', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeExternalUrl('  JaVaScRiPt:alert(1)')).toBeUndefined()
    expect(safeExternalUrl('java\nscript:alert(1)')).toBeUndefined()
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(safeExternalUrl('vbscript:msgbox(1)')).toBeUndefined()
  })

  it('vazio ou nulo nao gera link', () => {
    expect(safeExternalUrl('')).toBeUndefined()
    expect(safeExternalUrl('   ')).toBeUndefined()
    expect(safeExternalUrl(null)).toBeUndefined()
    expect(safeExternalUrl(undefined)).toBeUndefined()
  })
})

/* Endereco de evento vem de formulario aberto ao publico. Todo href que o usa
   passa por safeExternalUrl. */
const ARQUIVOS_QUE_MOSTRAM_LINK_DE_EVENTO = [
  'src/views/Evento.tsx',
  'src/components/events/event-card.tsx',
  'src/views/cadastre/AdminEvents.tsx',
]

describe('link de fonte do evento', () => {
  for (const arquivo of ARQUIVOS_QUE_MOSTRAM_LINK_DE_EVENTO) {
    it(`${arquivo} so monta href a partir de safeExternalUrl`, () => {
      const codigo = readFileSync(resolve(process.cwd(), arquivo), 'utf8')
      expect(codigo).toContain('safeExternalUrl')
      const hrefsDoEndereco = codigo.match(/href=\{[^}]*source_url[^}]*\}/g) ?? []
      expect(hrefsDoEndereco.length).toBeGreaterThan(0)
      expect(hrefsDoEndereco.filter((h) => !h.includes('safeExternalUrl'))).toEqual([])
    })
  }
})
