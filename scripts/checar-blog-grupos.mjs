// Confere se todo post publicado no banco pertence a um grupo de traducao.
// Post sem grupo aparece em TODOS os idiomas do blog (bug de 08/11/2026).
// Uso: npm run checar:blog   (le NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY do .env.local)
import fs from 'node:fs'

function lerEnv() {
  const env = { ...process.env }
  try {
    for (const linha of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^"|"$/g, '')
    }
  } catch {}
  return env
}

const env = lerEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const chave = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  process.exit(2)
}

const grupos = JSON.parse(fs.readFileSync('src/data/blog-traducoes.json', 'utf8'))
const conhecidos = new Set(grupos.flatMap((g) => [g.pt, g.es, g.en]))

const r = await fetch(`${url}/rest/v1/gostoso_blog_posts?select=slug&is_published=eq.true&limit=1000`, {
  headers: { apikey: chave, Authorization: `Bearer ${chave}` },
})
if (!r.ok) {
  console.error('Banco respondeu', r.status)
  process.exit(2)
}
const posts = await r.json()
const sem = posts.map((p) => p.slug).filter((s) => !conhecidos.has(s))
if (sem.length) {
  console.error(`Posts publicados sem grupo em src/data/blog-traducoes.json (${sem.length}):`)
  for (const s of sem) console.error(' -', s)
  process.exit(1)
}
console.log(`Ok: ${posts.length} posts publicados, todos em algum grupo.`)
