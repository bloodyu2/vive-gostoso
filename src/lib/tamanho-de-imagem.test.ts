import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// KAN-463 (02/10/2026): `SafeCoverImage`/`BusinessCover` so escolhem a variante
// certa do srcSet quando recebem `sizes`. Sem ele o padrao e `100vw` e o
// navegador pede a foto de 1080 px para um cartao pequeno: MEDIDO na home, o
// cartao "Chale Gostoso SMG" exibia 178 px e baixava 218 KB (w=1080); com o
// `sizes` do cartao (50vw no celular) a mesma foto sai em w=640 (85 KB).
//
// O teste varre as telas que mostraram o desperdicio e reprova qualquer tag de
// imagem de capa que nao declare `sizes`. Serve para o proximo cartao nao
// reintroduzir o padrao.
const ARQUIVOS_DA_HOME = [
  'src/views/Home.tsx',
  'src/components/home/hoje.tsx',
  'src/components/business/business-card.tsx',
]

function tagsSemSizes(fonte: string): string[] {
  const faltando: string[] = []
  for (const m of fonte.matchAll(/<(SafeCoverImage|BusinessCover)\b[\s\S]*?\/>/g)) {
    if (!/\bsizes=/.test(m[0])) faltando.push(m[0].replace(/\s+/g, ' ').slice(0, 90))
  }
  return faltando
}

describe('tamanho declarado das imagens da home', () => {
  it('todo SafeCoverImage/BusinessCover da home passa `sizes`', () => {
    for (const rel of ARQUIVOS_DA_HOME) {
      const fonte = readFileSync(join(process.cwd(), rel), 'utf8')
      expect(tagsSemSizes(fonte), rel).toEqual([])
    }
  })

  it('o detector enxerga uma tag sem `sizes`', () => {
    const fonte = '<BusinessCover coverUrl={x} alt={x} nome={x} slug={x} />'
    expect(tagsSemSizes(fonte)).toHaveLength(1)
  })
})
