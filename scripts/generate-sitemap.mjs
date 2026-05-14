/**
 * generate-sitemap.mjs
 * Runs before every build (prebuild) to produce public/sitemap.xml.
 * Fetches live slugs/IDs from Supabase so the sitemap always reflects the
 * current database state.
 *
 * Re-run on every deploy to pick up new published blog posts and businesses.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BASE_URL = 'https://vivegostoso.com.br'

const STATIC_PAGES = [
  { path: '/',          freq: 'daily',   priority: '1.0' },
  { path: '/come',      freq: 'weekly',  priority: '0.9' },
  { path: '/fique',     freq: 'weekly',  priority: '0.9' },
  { path: '/passeie',   freq: 'weekly',  priority: '0.8' },
  { path: '/explore',   freq: 'weekly',  priority: '0.8' },
  { path: '/participe', freq: 'daily',   priority: '0.8' },
  { path: '/conheca',   freq: 'monthly', priority: '0.7' },
  { path: '/apoie',     freq: 'monthly', priority: '0.6' },
  { path: '/contrate',  freq: 'weekly',  priority: '0.7' },
  { path: '/resolva',   freq: 'weekly',  priority: '0.7' },
  { path: '/sobre',     freq: 'monthly', priority: '0.6' },
  { path: '/blog',      freq: 'weekly',  priority: '0.6' },
]

// Locale config: [lang-code, hreflang-value, url-prefix]
const LOCALES = [
  { code: 'pt', hreflang: 'pt-BR', prefix: '' },
  { code: 'en', hreflang: 'en',    prefix: '/en' },
  { code: 'es', hreflang: 'es',    prefix: '/es' },
]

// ---------------------------------------------------------------------------
// Supabase credentials — read from .env (VITE_ prefixed keys)
// ---------------------------------------------------------------------------
function readEnv() {
  const candidates = ['.env.local', '.env']
  const env = {}
  for (const name of candidates) {
    try {
      const lines = readFileSync(resolve(ROOT, name), 'utf-8').split('\n')
      for (const line of lines) {
        const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/)
        if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim()
      }
      break // stop at first file found
    } catch {
      // try next
    }
  }
  return env
}

const localEnv = readEnv()
const SUPABASE_URL =
  localEnv.VITE_SUPABASE_URL   || process.env.VITE_SUPABASE_URL   || ''
const SUPABASE_KEY =
  localEnv.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
async function fetchRows(table, selectCols, filter = '') {
  const url =
    `${SUPABASE_URL}/rest/v1/${table}` +
    `?select=${selectCols}${filter}&limit=2000`

  const res = await fetch(url, {
    headers: {
      apikey:        SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept:        'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Supabase ${table}: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------
function hreflangLinks(path) {
  const alts = LOCALES.map(({ hreflang, prefix }) => {
    const href = `${BASE_URL}${prefix}${path === '/' && prefix ? '' : path}`
    return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`
  })
  // x-default points to PT (no prefix)
  alts.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}"/>`
  )
  return alts.join('\n')
}

function urlEntry({ loc, freq, priority, lastmod }) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${loc}</loc>
${hreflangLinks(loc.replace(BASE_URL, '').replace(/^\/en|^\/es/, '') || '/')}${lastmodTag}
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * Emit one <url> block per locale variant of `path`.
 * Google requires each localized URL to appear in the sitemap,
 * each containing the full set of hreflang annotations.
 */
function urlGroup(path, freq, priority, lastmod = '') {
  return LOCALES.map(({ prefix }) => {
    const localizedPath = `${prefix}${path === '/' && prefix ? '' : path}`
    const loc = `${BASE_URL}${localizedPath}`
    return urlEntry({ loc, freq, priority, lastmod })
  }).join('\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Generating sitemap...')

  // 1. Businesses
  const businesses = await fetchRows('gostoso_businesses', 'slug')
  console.log(`  → ${businesses.length} businesses`)

  // 2. Published blog posts
  const posts = await fetchRows(
    'gostoso_blog_posts',
    'slug,published_at',
    '&is_published=eq.true'
  )
  console.log(`  → ${posts.length} blog posts`)

  // 3. Active events (keyed by UUID, no slug)
  const events = await fetchRows(
    'gostoso_events',
    'id,starts_at',
    '&active=eq.true'
  )
  console.log(`  → ${events.length} events`)

  const sections = []

  // Static pages
  sections.push('  <!-- ===== Static pages ===== -->')
  for (const { path, freq, priority } of STATIC_PAGES) {
    sections.push(urlGroup(path, freq, priority))
  }

  // Business pages
  sections.push('\n  <!-- ===== Business pages ===== -->')
  for (const b of businesses) {
    if (!b.slug) continue
    sections.push(urlGroup(`/negocio/${b.slug}`, 'weekly', '0.8'))
  }

  // Blog posts
  if (posts.length) {
    sections.push('\n  <!-- ===== Blog posts ===== -->')
    for (const p of posts) {
      if (!p.slug) continue
      const date = p.published_at ? p.published_at.slice(0, 10) : ''
      sections.push(urlGroup(`/blog/${p.slug}`, 'monthly', '0.6', date))
    }
  }

  // Events
  if (events.length) {
    sections.push('\n  <!-- ===== Events ===== -->')
    for (const e of events) {
      if (!e.id) continue
      const date = e.starts_at ? e.starts_at.slice(0, 10) : ''
      sections.push(urlGroup(`/evento/${e.id}`, 'weekly', '0.7', date))
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const totalUrls =
    STATIC_PAGES.length * 3 +
    businesses.filter(b => b.slug).length * 3 +
    posts.filter(p => p.slug).length * 3 +
    events.filter(e => e.id).length * 3

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated ${today} — ${totalUrls} URLs (${totalUrls / 3 | 0} pages × 3 locales) -->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

${sections.join('\n')}

</urlset>
`

  const outPath = resolve(ROOT, 'public', 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf-8')
  console.log(
    `Sitemap written → public/sitemap.xml  ` +
    `(${totalUrls} URLs | ${businesses.length} businesses | ` +
    `${posts.length} posts | ${events.length} events)`
  )
}

main().catch(err => {
  console.error('Sitemap generation failed:', err.message)
  process.exit(1)
})
