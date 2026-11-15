import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { nomeSeguroDeFoto } from '@/lib/image-upload'

// KAN-883 (15/11/2026): conta nova nao conseguia enviar foto no painel.
//
// Causa 1, medida contra o Storage real com o usuario de teste: o mesmo envio,
// na mesma pasta do negocio, devolveu 200 sem `x-upsert` e 403 "new row
// violates row-level security policy" com `x-upsert: true`. Upsert no Storage
// exige INSERT, SELECT e UPDATE, e o dono so tem INSERT, UPDATE e DELETE no
// bucket `business-photos` (o SELECT de dono foi retirado de proposito: o
// bucket e publico e a leitura passa pelo CDN). O caminho de cada foto ja leva
// um carimbo de tempo, entao upsert nunca fez falta.
//
// Causa 2, medida do mesmo jeito: nome de arquivo com acento, colchete ou emoji
// vira 400 InvalidKey, porque o caminho usava o nome original do arquivo.

describe('nomeSeguroDeFoto', () => {
  // Regra de chave do Storage (storage-api): letras e digitos ASCII mais
  // alguns sinais. O nosso nome fica num subconjunto bem menor.
  const chaveValida = /^[a-z0-9-]+$/

  it.each([
    ['Foto da praia São Miguel (1).jpg', 'foto-da-praia-sao-miguel-1'],
    ['foto [2] #3.jpeg', 'foto-2-3'],
    ['sol 😀.png', 'sol'],
    ['IMG_0001.JPG', 'img-0001'],
    ['WhatsApp Image 2026-11-15 at 10.20.30.jpeg', 'whatsapp-image-2026-11-15-at-10-20-30'],
    ['çãõéü.webp', 'caoeu'],
  ])('%s vira um nome aceito pelo Storage', (entrada, esperado) => {
    const nome = nomeSeguroDeFoto(entrada)
    expect(nome).toBe(esperado)
    expect(nome).toMatch(chaveValida)
  })

  it('nome vazio ou so de simbolos cai em "foto"', () => {
    expect(nomeSeguroDeFoto('😀😀.jpg')).toBe('foto')
    expect(nomeSeguroDeFoto('.jpg')).toBe('foto')
    expect(nomeSeguroDeFoto('')).toBe('foto')
  })

  it('limita o tamanho do nome', () => {
    const nome = nomeSeguroDeFoto('a'.repeat(300) + '.jpg')
    expect(nome.length).toBeLessThanOrEqual(60)
    expect(nome).toMatch(chaveValida)
  })
})

describe('envio de foto ao bucket business-photos', () => {
  const ARQUIVOS = [
    'src/views/cadastre/Perfil.tsx',
    'src/components/ui/photo-uploader.tsx',
  ]

  it('nenhum envio usa upsert (o dono nao tem SELECT no bucket)', () => {
    for (const rel of ARQUIVOS) {
      const fonte = readFileSync(join(process.cwd(), rel), 'utf8')
      expect(fonte, `${rel} voltou a usar upsert`).not.toMatch(/upsert\s*:\s*true/)
    }
  })

  it('o caminho no Storage nunca embute o nome original do arquivo', () => {
    const fonte = readFileSync(join(process.cwd(), 'src/views/cadastre/Perfil.tsx'), 'utf8')
    // Qualquer `${...}` que ponha `.name` de arquivo dentro de um caminho de envio.
    const caminhos = fonte.match(/`\$\{bizId\}[^`]*`/g) ?? []
    expect(caminhos.length).toBeGreaterThan(0)
    for (const c of caminhos) {
      expect(c, `caminho com nome original: ${c}`).not.toMatch(/\.name\b/)
    }
  })
})
