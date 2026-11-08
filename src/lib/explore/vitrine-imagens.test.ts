import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ITENS_VITRINE } from './vitrine'

const PUBLIC = join(process.cwd(), 'public')

/* Os cartoes da vitrine apareciam com foto cinza (Conheca), foto de comida no
   Transfer e so icone em Come/Contrate; depois, em 08/11/2026, Mares e Apoie
   ainda sem foto e Participe com foto de banco de imagem (confete). Este teste
   segura o basico: TODO cartao tem foto, o arquivo existe, nenhuma foto se repete
   e ela mora em public/images/vitrine (foto real de Gostoso, nunca banco de imagem). */
describe('fotos da vitrine', () => {
  const comFoto = ITENS_VITRINE

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

  it('toda foto fica em public/images/vitrine (nada de pasta de banco de imagem)', () => {
    for (const i of comFoto) expect(i.imagem, i.id).toMatch(/^\/images\/vitrine\/[a-z-]+\.jpg$/)
  })

  it('nenhuma foto se repete entre cartoes', () => {
    const caminhos = comFoto.map(i => i.imagem)
    expect(new Set(caminhos).size).toBe(caminhos.length)
  })
})
