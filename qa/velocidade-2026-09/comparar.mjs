#!/usr/bin/env node
// Linha de base e comparativo do KAN-463 (velocidade sem regressao).
//
// Criar a linha de base (feito em producao antes das mudancas):
//   node qa/velocidade-2026-09/comparar.mjs --base https://www.vivegostoso.com.br --linha-de-base
//
// Comparar qualquer URL com a linha de base (rotas, SEO, screenshots e fumaca):
//   node qa/velocidade-2026-09/comparar.mjs --base https://www.vivegostoso.com.br --nome producao-depois
//   node qa/velocidade-2026-09/comparar.mjs --base http://localhost:3000 --nome local
//
// Opcoes: --sem-screenshots, --sem-fumaca, --so-rotas, --reusar-rotas (nao recoleta
// rotas.json ja salvo na pasta da execucao; com --sem-screenshots roda so a fumaca).
// Saida: qa/velocidade-2026-09/execucoes/<nome>/ e qa/velocidade-2026-09/comparativo-<nome>.md

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { coletarRotas } from './coletar.mjs'
import { tirarScreenshots, compararScreenshots } from './screenshots.mjs'

const AQUI = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(AQUI, '..', '..')
const LINHA = join(AQUI, 'linha-de-base')

function args() {
  const a = process.argv.slice(2)
  const o = { base: null, linhaDeBase: false, nome: null, screenshots: true, fumaca: true }
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--base') o.base = a[++i]
    else if (a[i] === '--nome') o.nome = a[++i]
    else if (a[i] === '--linha-de-base') o.linhaDeBase = true
    else if (a[i] === '--sem-screenshots') o.screenshots = false
    else if (a[i] === '--sem-fumaca') o.fumaca = false
    else if (a[i] === '--so-rotas') { o.screenshots = false; o.fumaca = false }
    else if (a[i] === '--reusar-rotas') o.reusarRotas = true
  }
  if (!o.base) {
    console.error('Uso: node qa/velocidade-2026-09/comparar.mjs --base <url> [--linha-de-base | --nome <rotulo>] [--sem-screenshots] [--sem-fumaca]')
    process.exit(2)
  }
  o.base = o.base.replace(/\/$/, '')
  if (!o.nome) o.nome = o.linhaDeBase ? 'linha-de-base' : new URL(o.base).hostname.replace(/[^a-z0-9]+/gi, '-')
  return o
}

/** Rotas de app/ que nao estao no sitemap (area restrita, API, arquivos, 404, redirects). */
const ROTAS_EXTRAS = [
  '/bio', '/en/bio', '/es/bio', '/bio/contato.vcf', '/bio/opengraph-image',
  '/cadastre', '/cadastre/admin', '/cadastre/admin/businesses', '/cadastre/painel', '/cadastre/perfil',
  '/cadastre/negocios', '/cadastre/profissional', '/cadastre/resetar-senha', '/cadastre/preview',
  '/cadastre/claim/teste-kan-463', '/auth/callback',
  '/reivindicar', '/privacidade', '/parceiros', '/en/parceiros', '/es/parceiros', '/en/privacidade',
  '/robots.txt', '/sitemap.xml', '/manifest.json',
  '/nao-existe-kan-463', '/en/nao-existe-kan-463', '/negocio/nao-existe-kan-463', '/blog/nao-existe-kan-463',
  '/resolva', '/en/resolva', '/negocio/positano', '/es/negocio/positano',
  '/api/og/home', '/api/og/explore', '/explore/mares/cardeiro/opengraph-image',
  '/explore/mares/nao-existe-kan-463',
]

async function montarRotas(base) {
  const xml = await (await fetch(base + '/sitemap.xml')).text()
  const doSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  const html = await (await fetch(base + '/transfer')).text()
  const transfers = [...new Set([...html.matchAll(/href="(\/transfer\/[^"#?]+)"/g)].map((m) => m[1]))].slice(0, 3)
  const todas = [...new Set([...doSitemap, ...ROTAS_EXTRAS, ...transfers])]
  return { doSitemap, todas }
}

/** Amostra para screenshot: todas as paginas fixas nos tres idiomas e de 2 a 4 por modelo dinamico. */
function montarAmostra(doSitemap) {
  const modelo = (p) => {
    const semLang = p.replace(/^\/(en|es)(?=\/|$)/, '') || '/'
    const m = semLang.match(/^\/(negocio|blog|evento|transfer|contrate\/profissional|explore\/mares|contrate)\/[^/]+$/)
    return m ? m[1] : null
  }
  const fixas = doSitemap.filter((p) => !modelo(p))
  const porModelo = {}
  for (const p of doSitemap) {
    const m = modelo(p)
    if (!m) continue
    const lang = (p.match(/^\/(en|es)\//) || [])[1] || 'pt'
    porModelo[m] ??= { pt: [], en: [], es: [] }
    porModelo[m][lang].push(p)
  }
  const dinamicas = Object.values(porModelo).flatMap((g) => [...g.pt.slice(0, 2), ...g.en.slice(0, 1), ...g.es.slice(0, 1)])
  return [...new Set([...fixas, ...dinamicas, '/bio', '/en/bio', '/es/bio', '/cadastre', '/nao-existe-kan-463'])]
}

function rodarFumaca(base, pasta) {
  const json = join(pasta, 'fumaca.json')
  // node direto no cli do Playwright, sem shell: caminho com espaco quebra o npx no Windows.
  const cli = join(RAIZ, 'node_modules', '@playwright', 'test', 'cli.js')
  const r = spawnSync(process.execPath, [cli, 'test', '-c', join(AQUI, 'playwright.config.ts')], {
    cwd: RAIZ,
    env: { ...process.env, BASE_URL: base, FUMACA_JSON: json, FUMACA_SAIDA: join(pasta, 'fumaca-artefatos') },
    stdio: 'inherit',
  })
  let resumo = { passou: 0, falhou: 0, instavel: 0, pulado: 0, testes: [] }
  if (existsSync(json)) {
    const dados = JSON.parse(readFileSync(json, 'utf8'))
    const visitar = (suite, prefixo) => {
      for (const s of suite.suites || []) visitar(s, prefixo ? `${prefixo} > ${s.title}` : s.title)
      for (const spec of suite.specs || []) {
        for (const t of spec.tests || []) {
          const status = t.status // expected, unexpected, flaky, skipped
          resumo.testes.push({ titulo: `${prefixo} > ${spec.title}`.replace(/^fumaca\.spec\.ts > /, ''), status })
          if (status === 'expected') resumo.passou++
          else if (status === 'unexpected') resumo.falhou++
          else if (status === 'flaky') resumo.instavel++
          else resumo.pulado++
        }
      }
    }
    for (const s of dados.suites || []) visitar(s, '')
  }
  resumo.codigoSaida = r.status
  return resumo
}

function igual(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

function compararRotas(antes, depois) {
  const mapa = new Map(depois.map((r) => [r.caminho, r]))
  const diferencas = []
  for (const a of antes) {
    const d = mapa.get(a.caminho)
    if (!d) { diferencas.push({ caminho: a.caminho, campo: 'rota', antes: 'coletada', depois: 'ausente' }); continue }
    if (a.status !== d.status) diferencas.push({ caminho: a.caminho, campo: 'status', antes: a.status, depois: d.status })
    if ((a.location || null) !== (d.location || null)) diferencas.push({ caminho: a.caminho, campo: 'redirect', antes: a.location, depois: d.location })
    if (a.seo && d.seo) {
      for (const campo of ['title', 'description', 'robots', 'canonical', 'hreflang', 'jsonld', 'h1', 'links', 'ogTitle', 'ogImage']) {
        if (!igual(a.seo[campo], d.seo[campo])) {
          const detalhe = Array.isArray(a.seo[campo])
            ? {
                antes: `so antes: ${JSON.stringify(a.seo[campo].filter((x) => !(d.seo[campo] || []).includes(x))).slice(0, 400)}`,
                depois: `so depois: ${JSON.stringify((d.seo[campo] || []).filter((x) => !a.seo[campo].includes(x))).slice(0, 400)}`,
              }
            : { antes: a.seo[campo], depois: d.seo[campo] }
          diferencas.push({ caminho: a.caminho, campo, ...detalhe })
        }
      }
    } else if (!!a.seo !== !!d.seo) {
      diferencas.push({ caminho: a.caminho, campo: 'html', antes: !!a.seo, depois: !!d.seo })
    }
  }
  return diferencas
}

function tabelaCache(rotas) {
  const cont = {}
  for (const r of rotas) {
    const k = `${r.status} | ${r.cacheControl || '-'} | ${r.xVercelCache || r.xNextjsCache || '-'}`
    cont[k] = (cont[k] || 0) + 1
  }
  return Object.entries(cont).sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${k} | ${n} |`).join('\n')
}

function mediana(xs) {
  const v = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b)
  return v.length ? v[Math.floor(v.length / 2)] : null
}

async function main() {
  const o = args()
  const pasta = o.linhaDeBase ? LINHA : join(AQUI, 'execucoes', o.nome)
  mkdirSync(pasta, { recursive: true })
  const inicio = new Date().toISOString()
  console.log(`[${o.nome}] base ${o.base}`)

  let rotasLista, amostra
  if (o.linhaDeBase) {
    const { doSitemap, todas } = await montarRotas(o.base)
    rotasLista = todas
    amostra = montarAmostra(doSitemap)
    writeFileSync(join(LINHA, 'lista-de-rotas.json'), JSON.stringify({ geradaEm: inicio, sitemap: doSitemap.length, rotas: todas, amostraScreenshots: amostra }, null, 2))
  } else {
    const lista = JSON.parse(readFileSync(join(LINHA, 'lista-de-rotas.json'), 'utf8'))
    rotasLista = lista.rotas
    amostra = lista.amostraScreenshots
  }

  let rotas
  if (o.reusarRotas && existsSync(join(pasta, 'rotas.json'))) {
    // Refaz so o que falta (ex.: --reusar-rotas --sem-screenshots para rodar so a fumaca).
    rotas = JSON.parse(readFileSync(join(pasta, 'rotas.json'), 'utf8')).rotas
  } else {
    console.log(`rotas: ${rotasLista.length}`)
    rotas = await coletarRotas(o.base, rotasLista, { aoProgredir: (n, t) => console.log(`  ${n}/${t}`) })
    writeFileSync(join(pasta, 'rotas.json'), JSON.stringify({ base: o.base, coletadoEm: inicio, rotas }, null, 2))
  }

  let falhasShots = []
  if (o.screenshots) {
    console.log(`screenshots: ${amostra.length} paginas x 2 larguras`)
    falhasShots = await tirarScreenshots(o.base, amostra, join(pasta, 'screenshots'))
  }
  let fumaca = null
  if (o.fumaca) {
    console.log('fumaca...')
    fumaca = rodarFumaca(o.base, pasta)
    writeFileSync(join(pasta, 'fumaca-resumo.json'), JSON.stringify(fumaca, null, 2))
  }

  const porStatus = {}
  for (const r of rotas) porStatus[r.status] = (porStatus[r.status] || 0) + 1
  const msHtml = rotas.filter((r) => r.seo).map((r) => r.ms)

  let md = `# ${o.linhaDeBase ? 'Linha de base' : 'Comparativo'}: ${o.nome}\n\nBase: ${o.base}\nColetado em: ${inicio}\n\n`
  md += `## Rotas\n\n${rotas.length} rotas. Por status: ${Object.entries(porStatus).map(([s, n]) => `${s}: ${n}`).join(', ')}.\n`
  md += `Tempo de resposta mediano das paginas HTML (fetch sem cache do cliente, concorrencia 6): ${mediana(msHtml)} ms.\n\n`
  md += `| status | cache-control | cache | rotas |\n|---|---|---|---|\n${tabelaCache(rotas)}\n\n`

  if (!o.linhaDeBase) {
    const antes = JSON.parse(readFileSync(join(LINHA, 'rotas.json'), 'utf8')).rotas
    const difs = compararRotas(antes, rotas)
    const porCampo = {}
    for (const d of difs) porCampo[d.campo] = (porCampo[d.campo] || 0) + 1
    md += `## Diferencas de rota e SEO contra a linha de base\n\n`
    md += difs.length === 0
      ? 'Nenhuma. Status, redirect, title, description, robots, canonical, hreflang, JSON-LD, H1, og e links internos iguais em todas as rotas.\n\n'
      : `${difs.length} diferencas. Por campo: ${Object.entries(porCampo).map(([c, n]) => `${c}: ${n}`).join(', ')}.\n\n| rota | campo | antes | depois |\n|---|---|---|---|\n${difs.slice(0, 300).map((d) => `| ${d.caminho} | ${d.campo} | ${String(d.antes).replace(/\|/g, '\\|').slice(0, 300)} | ${String(d.depois).replace(/\|/g, '\\|').slice(0, 300)} |`).join('\n')}\n\n`
    writeFileSync(join(pasta, 'diferencas-rotas-seo.json'), JSON.stringify(difs, null, 2))

    if ((o.screenshots || o.reusarRotas) && existsSync(join(LINHA, 'screenshots')) && existsSync(join(pasta, 'screenshots'))) {
      const vis = compararScreenshots(join(LINHA, 'screenshots'), join(pasta, 'screenshots'), amostra, join(pasta, 'screenshots-diff'))
      writeFileSync(join(pasta, 'diferencas-visuais.json'), JSON.stringify(vis, null, 2))
      const comDif = vis.filter((v) => v.erro || v.pctDiferente > 0 || v.alturaAntes !== v.alturaDepois)
      md += `## Visual\n\n${vis.length} screenshots comparados (390 e 1440 px). Iguais ao pixel: ${vis.length - comDif.length}. Com diferenca: ${comDif.length}.\n`
      md += `Diferenca vem tambem de conteudo que muda sozinho (mare de agora, eventos, ordem vinda do banco). Os mapas de diferenca ficam em ${relative(RAIZ, join(pasta, 'screenshots-diff'))}.\n\n`
      if (comDif.length) {
        md += `| pagina | largura | % pixels diferentes | altura antes | altura depois |\n|---|---|---|---|---|\n`
        md += comDif.sort((a, b) => (b.pctDiferente || 0) - (a.pctDiferente || 0)).map((v) => `| ${v.caminho} | ${v.largura} | ${v.erro || v.pctDiferente} | ${v.alturaAntes ?? ''} | ${v.alturaDepois ?? ''} |`).join('\n') + '\n\n'
      }
    }
  }
  if (falhasShots.length) md += `Screenshots que falharam: ${falhasShots.map((f) => `${f.caminho} (${f.largura}): ${f.erro}`).join('; ')}\n\n`

  if (fumaca) {
    md += `## Fumaca (Playwright)\n\nPassou: ${fumaca.passou}. Falhou: ${fumaca.falhou}. Instavel (passou na segunda tentativa): ${fumaca.instavel}. Pulado: ${fumaca.pulado}.\n\n`
    md += fumaca.testes.map((t) => `- ${t.status === 'expected' ? 'ok' : t.status}: ${t.titulo}`).join('\n') + '\n\n'
    if (!o.linhaDeBase && existsSync(join(LINHA, 'fumaca-resumo.json'))) {
      const antes = JSON.parse(readFileSync(join(LINHA, 'fumaca-resumo.json'), 'utf8'))
      const mapa = new Map(fumaca.testes.map((t) => [t.titulo, t.status]))
      const pioraram = antes.testes.filter((t) => t.status === 'expected' && mapa.get(t.titulo) !== 'expected' && mapa.get(t.titulo) !== 'flaky')
      md += pioraram.length ? `Testes que passavam na linha de base e agora nao: ${pioraram.map((t) => t.titulo).join('; ')}\n\n` : 'Nenhum teste que passava na linha de base deixou de passar.\n\n'
    }
  }

  const arquivo = o.linhaDeBase ? join(LINHA, 'LINHA-DE-BASE.md') : join(AQUI, `comparativo-${o.nome}.md`)
  writeFileSync(arquivo, md)
  console.log(`\nfeito: ${relative(RAIZ, arquivo)}`)
  if (fumaca && fumaca.falhou > 0) process.exitCode = 1
}

main().catch((e) => { console.error(e); process.exit(1) })
