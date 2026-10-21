import { describe, expect, it } from 'vitest'
import { DESTINO_PADRAO, PLAQUINHAS, destinoDaPlaquinha } from './plaquinhas'

describe('destinoDaPlaquinha', () => {
  it('codigo sem destino cai na home', () => {
    expect(destinoDaPlaquinha('01')).toBe(DESTINO_PADRAO)
  })
  it('codigo invalido cai na home', () => {
    expect(destinoDaPlaquinha('1')).toBe(DESTINO_PADRAO)
    expect(destinoDaPlaquinha('abc')).toBe(DESTINO_PADRAO)
    expect(destinoDaPlaquinha('../x')).toBe(DESTINO_PADRAO)
  })
  it('usa o destino cadastrado quando e https', () => {
    PLAQUINHAS['99'] = 'https://g.page/r/abc/review'
    expect(destinoDaPlaquinha('99')).toBe('https://g.page/r/abc/review')
    PLAQUINHAS['98'] = 'http://inseguro.example'
    expect(destinoDaPlaquinha('98')).toBe(DESTINO_PADRAO)
    PLAQUINHAS['97'] = 'javascript:alert(1)'
    expect(destinoDaPlaquinha('97')).toBe(DESTINO_PADRAO)
    delete PLAQUINHAS['99']; delete PLAQUINHAS['98']; delete PLAQUINHAS['97']
  })
})
