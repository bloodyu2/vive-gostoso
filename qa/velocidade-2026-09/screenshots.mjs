// Screenshots de pagina inteira em 390 px e 1440 px (KAN-463).
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

export const LARGURAS = [
  { nome: '390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  { nome: '1440', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
]

export function arquivoDe(caminho) {
  return (caminho === '/' ? 'home' : caminho.replace(/^\//, '').replace(/[^a-zA-Z0-9-]+/g, '_')) + '.png'
}

async function esperarImagens(page) {
  // Rola ate o fim para as imagens preguicosas carregarem, depois volta ao topo.
  await page.evaluate(async () => {
    const passo = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y)
      await new Promise((ok) => setTimeout(ok, 120))
    }
    window.scrollTo(0, 0)
    await Promise.all(
      [...document.images].map((img) =>
        img.complete ? null : new Promise((ok) => { img.onload = img.onerror = ok; setTimeout(ok, 5000) }),
      ),
    )
  })
}

export async function tirarScreenshots(base, caminhos, pasta, { concorrencia = 3 } = {}) {
  const navegador = await chromium.launch()
  const falhas = []
  try {
    for (const largura of LARGURAS) {
      const dir = join(pasta, largura.nome)
      mkdirSync(dir, { recursive: true })
      const contexto = await navegador.newContext({
        viewport: largura.viewport,
        isMobile: largura.isMobile,
        hasTouch: largura.hasTouch,
        deviceScaleFactor: largura.deviceScaleFactor,
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
        locale: 'pt-BR',
        timezoneId: 'America/Fortaleza',
      })
      let proximo = 0
      async function trabalhador() {
        const page = await contexto.newPage()
        while (proximo < caminhos.length) {
          const caminho = caminhos[proximo++]
          try {
            await page.goto(base.replace(/\/$/, '') + caminho, { waitUntil: 'load', timeout: 60000 })
            await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => null)
            await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' }).catch(() => null)
            await esperarImagens(page).catch(() => null)
            await page.waitForTimeout(500)
            await page.screenshot({ path: join(dir, arquivoDe(caminho)), fullPage: true, timeout: 60000 })
          } catch (e) {
            falhas.push({ caminho, largura: largura.nome, erro: String(e?.message || e).slice(0, 200) })
          }
        }
        await page.close()
      }
      await Promise.all(Array.from({ length: concorrencia }, trabalhador))
      await contexto.close()
    }
  } finally {
    await navegador.close()
  }
  return falhas
}

/** Compara duas pastas de screenshots. Diferenca em % de pixels e mudanca de altura. */
export function compararScreenshots(pastaA, pastaB, caminhos, pastaDiff) {
  const linhas = []
  for (const largura of LARGURAS) {
    for (const caminho of caminhos) {
      const nome = arquivoDe(caminho)
      const a = join(pastaA, largura.nome, nome)
      const b = join(pastaB, largura.nome, nome)
      if (!existsSync(a) || !existsSync(b)) {
        linhas.push({ caminho, largura: largura.nome, erro: !existsSync(a) ? 'sem screenshot na linha de base' : 'sem screenshot novo' })
        continue
      }
      const ia = PNG.sync.read(readFileSync(a))
      const ib = PNG.sync.read(readFileSync(b))
      const w = Math.min(ia.width, ib.width)
      const h = Math.min(ia.height, ib.height)
      const recorte = (img) => {
        if (img.width === w && img.height === h) return img
        const out = new PNG({ width: w, height: h })
        PNG.bitblt(img, out, 0, 0, w, h, 0, 0)
        return out
      }
      const ra = recorte(ia)
      const rb = recorte(ib)
      const diff = new PNG({ width: w, height: h })
      const n = pixelmatch(ra.data, rb.data, diff.data, w, h, { threshold: 0.1 })
      const pct = (n / (w * h)) * 100
      if (pct > 0 && pastaDiff) {
        mkdirSync(join(pastaDiff, largura.nome), { recursive: true })
        writeFileSync(join(pastaDiff, largura.nome, nome), PNG.sync.write(diff))
      }
      linhas.push({ caminho, largura: largura.nome, alturaAntes: ia.height, alturaDepois: ib.height, pctDiferente: Number(pct.toFixed(3)) })
    }
  }
  return linhas
}
