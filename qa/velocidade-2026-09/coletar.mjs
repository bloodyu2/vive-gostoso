// Coleta de rotas e de conteudo de SEO (KAN-463).
// Sem dependencia externa: fetch do Node e expressoes regulares sobre o HTML servido.
// O HTML servido e o criterio, nao o DOM depois do JavaScript.

const SITE = 'https://www.vivegostoso.com.br'

/** Tira a origem (qualquer uma: producao, localhost, preview) e deixa so o caminho. */
export function normalizarCaminho(href, base) {
  if (!href) return href
  try {
    const u = new URL(href, base)
    const origemBase = new URL(base).origin
    if (u.origin === origemBase || u.origin === SITE || u.origin === 'https://vivegostoso.com.br') {
      return u.pathname + u.search + u.hash
    }
    return u.href
  } catch {
    return href
  }
}

function atributo(tag, nome) {
  const m = tag.match(new RegExp(`\\s${nome}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? (m[2] ?? m[3]) : null
}

function decodificar(s) {
  if (s == null) return s
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/** Ordena as chaves para comparar JSON-LD sem depender da ordem. */
function canonizarJson(v) {
  if (Array.isArray(v)) return v.map(canonizarJson)
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonizarJson(v[k])]))
  }
  return v
}

export function extrairSeo(html, base) {
  const head = html
  const title = decodificar((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] ?? null)
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
  const meta = (nome) => {
    const t = metas.find((x) => (atributo(x, 'name') || atributo(x, 'property')) === nome)
    return t ? decodificar(atributo(t, 'content')) : null
  }
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0])
  const canonicalTag = links.find((x) => atributo(x, 'rel') === 'canonical')
  const canonical = canonicalTag ? decodificar(atributo(canonicalTag, 'href')) : null
  const hreflang = links
    .filter((x) => atributo(x, 'rel') === 'alternate' && atributo(x, 'hreflang'))
    .map((x) => `${atributo(x, 'hreflang')} ${decodificar(atributo(x, 'href'))}`)
    .sort()
  const jsonld = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      try {
        return JSON.stringify(canonizarJson(JSON.parse(m[1])))
      } catch {
        return 'JSON_INVALIDO:' + m[1].slice(0, 200)
      }
    })
    .sort()
  const internos = new Set()
  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = decodificar(atributo(m[0], 'href'))
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    const n = normalizarCaminho(href, base)
    if (n.startsWith('/')) internos.add(n)
  }
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    decodificar(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()),
  )
  return {
    title,
    description: meta('description'),
    robots: meta('robots'),
    ogTitle: meta('og:title'),
    ogImage: meta('og:image'),
    canonical,
    hreflang,
    jsonld,
    h1,
    links: [...internos].sort(),
  }
}

async function coletarUma(base, caminho) {
  const url = base.replace(/\/$/, '') + caminho
  const inicio = Date.now()
  let tentativa = 0
  for (;;) {
    try {
      const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'vive-gostoso-qa/1.0 (KAN-463)' } })
      const ms = Date.now() - inicio
      const tipo = r.headers.get('content-type') || ''
      const saida = {
        caminho,
        status: r.status,
        location: r.headers.get('location') ? normalizarCaminho(r.headers.get('location'), base) : null,
        tipo: tipo.split(';')[0],
        cacheControl: r.headers.get('cache-control'),
        xVercelCache: r.headers.get('x-vercel-cache'),
        xVercelId: r.headers.get('x-vercel-id'),
        xNextjsCache: r.headers.get('x-nextjs-cache'),
        temCsp: !!r.headers.get('content-security-policy'),
        ms,
      }
      if (tipo.includes('text/html') && r.status === 200) {
        saida.seo = extrairSeo(await r.text(), base)
      } else {
        await r.arrayBuffer().catch(() => null)
      }
      return saida
    } catch (e) {
      tentativa++
      if (tentativa >= 3) return { caminho, status: 'ERRO', erro: String(e?.message || e) }
      await new Promise((ok) => setTimeout(ok, 1000 * tentativa))
    }
  }
}

export async function coletarRotas(base, caminhos, { concorrencia = 6, aoProgredir } = {}) {
  const resultado = new Array(caminhos.length)
  let proximo = 0
  let feitos = 0
  async function trabalhador() {
    while (proximo < caminhos.length) {
      const i = proximo++
      resultado[i] = await coletarUma(base, caminhos[i])
      feitos++
      if (aoProgredir && feitos % 50 === 0) aoProgredir(feitos, caminhos.length)
    }
  }
  await Promise.all(Array.from({ length: concorrencia }, trabalhador))
  return resultado
}
