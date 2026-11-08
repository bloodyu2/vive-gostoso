import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ITENS_VITRINE } from './vitrine'

const PUBLIC = join(process.cwd(), 'public')

/* Os cartoes da vitrine apareciam com foto cinza (Conheca), foto de comida no
   Transfer e so icone em Come/Contrate. Este teste segura o basico: todo cartao
   (menos a tabua de mares, que e um painel, e o Apoie, que e so icone) tem foto,
   o arquivo existe e nenhuma foto se repete. */
describe('fotos da vitrine', () => {
  const comFoto = ITENS_VITRINE.filter(i => i.id !== 'mares' && i.id !== 'apoie')

  it('todo cartao tem foto', () => {
    expect(comFoto.filter(i => !i.imagem).map(i => i.id)).toEqual([])
  })

  it('o arquivo de cada foto existe e nao esta vazio', () => {
    for (const i of comFoto) {
      const arquivo = join(PUBLIC, i.imagem as string)
      expect(existsSync(arquivo), `${i.id}: ${i.imagem}`).toBe(true)
      expect(statSync(arquivo).size, `${i.id} vazio`).toBeGreaterThan(20_000)
    }
  })

  it('nenhuma foto se repete entre cartoes', () => {
    const caminhos = comFoto.map(i => i.imagem)
    expect(new Set(caminhos).size).toBe(caminhos.length)
  })
})
