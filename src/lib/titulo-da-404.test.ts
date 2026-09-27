import { describe, it, expect } from 'vitest'
import { metadata as raiz } from '../../app/layout'
import { metadata } from '../../app/not-found'

/** A 404 fica fora de app/[lang] e nao recebe o idioma, entao o titulo e em
 *  portugues. Ele passa pelo template do layout raiz ('%s | Vive Gostoso'). */
describe('titulo da 404', () => {
  it('exporta o titulo e usa o sufixo da marca do layout raiz', () => {
    expect(metadata?.title).toBe('Página não encontrada')
    const tpl = (raiz.title as { template: string }).template
    expect(tpl.replace('%s', String(metadata.title))).toBe('Página não encontrada | Vive Gostoso')
  })
})
