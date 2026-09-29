#!/usr/bin/env node
// Lighthouse celular (KAN-463). Tres rodadas por pagina, fica a mediana da nota.
//   node qa/velocidade-2026-09/lighthouse.mjs --base https://www.vivegostoso.com.br --nome producao-antes
// Precisa do lighthouse global (npm i -g lighthouse; ou LIGHTHOUSE_CLI=<cli/index.js>) e de um Chrome; usa o
// Chromium do Playwright se CHROME_PATH nao estiver definido.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const AQUI = dirname(fileURLToPath(import.meta.url))
export const PAGINAS = ['/', '/explore/mares', '/come']
const RODADAS = 3

const a = process.argv.slice(2)
const base = (a[a.indexOf('--base') + 1] || '').replace(/\/$/, '')
const nome = a.includes('--nome') ? a[a.indexOf('--nome') + 1] : 'execucao'
if (!base) { console.error('uso: --base <url> --nome <rotulo>'); process.exit(2) }
const pasta = join(AQUI, 'lighthouse', nome)
mkdirSync(pasta, { recursive: true })
const chrome = process.env.CHROME_PATH || chromium.executablePath()
// node direto no cli do lighthouse global, sem shell (caminho com espaco quebra no Windows).
const LH_CLI = process.env.LIGHTHOUSE_CLI || join(process.env.APPDATA || '', 'npm', 'node_modules', 'lighthouse', 'cli', 'index.js')

async function ttfb(url) {
  const vals = []
  for (let i = 0; i < 3; i++) {
    const t = Date.now()
    const r = await fetch(url, { redirect: 'manual' })
    const reader = r.body.getReader()
    await reader.read()
    vals.push(Date.now() - t)
    await reader.cancel().catch(() => null)
  }
  return vals.sort((x, y) => x - y)[1]
}

function resumo(j) {
  const au = j.audits
  const lcpEl = au['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet
    ?? au['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet ?? null
  return {
    nota: Math.round(j.categories.performance.score * 100),
    lcp_s: +(au['largest-contentful-paint'].numericValue / 1000).toFixed(2),
    fcp_s: +(au['first-contentful-paint'].numericValue / 1000).toFixed(2),
    tbt_s: +(au['total-blocking-time'].numericValue / 1000).toFixed(2),
    cls: +au['cumulative-layout-shift'].numericValue.toFixed(3),
    si_s: +(au['speed-index'].numericValue / 1000).toFixed(2),
    execucaoJs_s: +((au['bootup-time']?.numericValue ?? 0) / 1000).toFixed(2),
    servidor_s: +((au['server-response-time']?.numericValue ?? 0) / 1000).toFixed(2),
    peso_mb: +(au['total-byte-weight'].numericValue / 1048576).toFixed(2),
    lcpElemento: lcpEl,
  }
}

const linhas = []
for (const p of PAGINAS) {
  const url = base + p
  const rodadas = []
  for (let i = 0; i < RODADAS; i++) {
    const saida = join(pasta, `${p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')}-${i + 1}.json`)
    const r = spawnSync(process.execPath, [LH_CLI, url, '--only-categories=performance', '--form-factor=mobile', '--output=json', `--output-path=${saida}`, '--quiet', '--chrome-flags=--headless=new --no-sandbox'], {
      env: { ...process.env, CHROME_PATH: chrome },
      stdio: 'inherit',
    })
    if (r.status !== 0 || !existsSync(saida)) { console.error('falhou', url); continue }
    rodadas.push(resumo(JSON.parse(readFileSync(saida, 'utf8'))))
  }
  rodadas.sort((x, y) => x.nota - y.nota)
  const med = rodadas[Math.floor(rodadas.length / 2)]
  linhas.push({ pagina: p, ttfbCurl_ms: await ttfb(url), notas: rodadas.map((r) => r.nota), ...med })
}
writeFileSync(join(pasta, 'resumo.json'), JSON.stringify({ base, data: new Date().toISOString(), linhas }, null, 2))
let md = `| Pagina | Nota (mediana de ${RODADAS}) | Notas | LCP | FCP | TBT | Execucao JS | Resposta (fetch) | Peso | CLS |\n|---|---|---|---|---|---|---|---|---|---|\n`
for (const l of linhas) md += `| ${l.pagina} | ${l.nota} | ${l.notas.join(', ')} | ${l.lcp_s} s | ${l.fcp_s} s | ${l.tbt_s} s | ${l.execucaoJs_s} s | ${l.ttfbCurl_ms} ms | ${l.peso_mb} MB | ${l.cls} |\n`
writeFileSync(join(pasta, 'resumo.md'), md)
console.log(md)
for (const l of linhas) console.log(l.pagina, 'LCP:', l.lcpElemento)

