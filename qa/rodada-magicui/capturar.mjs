// Capturas da rodada Magic UI (lotes 1 a 5). 390 e 1280, tela cheia.
//   node qa/rodada-magicui/capturar.mjs
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const base = process.env.BASE || 'http://localhost:3000'
const out = 'qa/rodada-magicui'
mkdirSync(out, { recursive: true })

const paginas = [
  ['home', '/'],
  ['come', '/come'],
  ['blog', '/blog'],
  ['negocio', '/negocio/positano-restaurante'],
  ['contrate', '/contrate'],
  ['participe', '/participe'],
  ['apoie', '/apoie'],
]

const browser = await chromium.launch()

for (const width of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  for (const [nome, caminho] of paginas) {
    await page.goto(base + caminho, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${out}/${nome}-${width}.png`, fullPage: true })
    console.log('shot', nome, width)
  }
  await ctx.close()
}

// Tema escuro: as superficies de maior trafego, no celular.
const ctxDark = await browser.newContext({ viewport: { width: 390, height: 900 }, colorScheme: 'dark' })
const pageDark = await ctxDark.newPage()
for (const [nome, caminho] of [['home', '/'], ['come', '/come'], ['negocio', '/negocio/positano-restaurante']]) {
  await pageDark.goto(base + caminho, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await pageDark.waitForTimeout(1200)
  await pageDark.screenshot({ path: `${out}/${nome}-390-escuro.png`, fullPage: true })
  console.log('shot', nome, '390 escuro')
}
await ctxDark.close()

await browser.close()
console.log('fim')
