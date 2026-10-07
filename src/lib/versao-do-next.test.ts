import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/* O Next.js 16.2.0 a 16.3.5 tem aviso critico em `next/og` (corrigido na 16.3.6).
   O site usa ImageResponse nas imagens de compartilhamento. O teste garante que o
   lock nao volte para uma versao dentro da faixa afetada. */
function versaoNoLock(pacote: string): number[] {
  const lock = JSON.parse(readFileSync(resolve(process.cwd(), 'package-lock.json'), 'utf8')) as {
    packages: Record<string, { version: string }>
  }
  return lock.packages[`node_modules/${pacote}`].version.split('.').map(Number)
}

function atLeast(v: number[], minimo: number[]): boolean {
  for (let i = 0; i < minimo.length; i++) {
    if ((v[i] ?? 0) > minimo[i]) return true
    if ((v[i] ?? 0) < minimo[i]) return false
  }
  return true
}

describe('versoes instaladas', () => {
  it('next >= 16.3.6', () => {
    expect(atLeast(versaoNoLock('next'), [16, 3, 6])).toBe(true)
  })

  it('serialize-javascript >= 7.1.2', () => {
    expect(atLeast(versaoNoLock('serialize-javascript'), [7, 1, 2])).toBe(true)
  })
})
