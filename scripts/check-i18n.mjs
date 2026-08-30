import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const LOCALES = ['pt', 'en', 'es']
const locales = Object.fromEntries(
  LOCALES.map(l => [l, JSON.parse(readFileSync(resolve(ROOT, `src/locales/${l}.json`), 'utf8'))])
)

function flattenKeys(obj, prefix) {
  let keys = []
  for (const k of Object.keys(obj)) {
    const path = prefix ? prefix + '.' + k : k
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(flattenKeys(obj[k], path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

const keysByLocale = Object.fromEntries(
  LOCALES.map(l => [l, new Set(flattenKeys(locales[l], ''))])
)
const ptKeys = keysByLocale.pt

function walk(dir) {
  let files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files = files.concat(walk(full))
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(full)
    }
  }
  return files
}

// `t('x')` precisa casar só com a função de traducao: exige que o caractere
// anterior nao faca parte de um identificador maior (senao `select(`, `format(`,
// `.eq(` e afins entram como se fossem chaves -- era o bug da versao anterior
// deste script, que reportava centenas de falsos positivos).
const T_CALL = /(?<![A-Za-z0-9_$.])t\(\s*['"]([^'"]+)['"]\s*(\+)?/g
// namespace declarado no arquivo: useTranslation('painel') / useTranslation(['a','b'])
const NS_DECL = /useTranslation\(\s*(\[[^\]]*\]|['"][^'"]+['"])/g

const used = new Map() // chave resolvida -> arquivos que usam

function resolveKey(raw, namespaces) {
  // forma explicita `ns:chave` sempre ganha
  if (raw.includes(':')) {
    const [ns, ...rest] = raw.split(':')
    return `${ns}.${rest.join(':')}`
  }
  // ja veio com o namespace no proprio caminho (ex.: 'painel.btn_publish')
  if (ptKeys.has(raw)) return raw
  for (const ns of namespaces) {
    if (ptKeys.has(`${ns}.${raw}`)) return `${ns}.${raw}`
  }
  // nao resolveu: devolve a melhor tentativa para o relatorio
  return namespaces.length ? `${namespaces[0]}.${raw}` : raw
}

const files = walk(resolve(ROOT, 'src'))
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const namespaces = []
  for (const m of content.matchAll(NS_DECL)) {
    const decl = m[1]
    for (const n of decl.matchAll(/['"]([^'"]+)['"]/g)) namespaces.push(n[1])
  }
  for (const m of content.matchAll(T_CALL)) {
    const raw = m[1]
    // chave montada por concatenacao -- ex.: t('perfil:day_' + key). O prefixo
    // sozinho nunca existe no locale; as chaves reais sao as variantes
    // completas (day_seg, day_ter, ...), que nao da para resolver estaticamente.
    if (m[2] === '+') continue
    // chaves i18n nao tem espaco, barra ou parenteses -- isso filtra o que
    // sobra de string solta capturada por engano
    if (/[\s/()*,]/.test(raw)) continue
    const key = resolveKey(raw, namespaces)
    if (!used.has(key)) used.set(key, new Set())
    used.get(key).add(file.replace(ROOT + '\\', '').replace(ROOT + '/', ''))
  }
}

const missing = [...used.keys()].filter(k => !ptKeys.has(k)).sort()

console.log(`Arquivos varridos: ${files.length}`)
console.log(`Chaves usadas no codigo: ${used.size}`)
console.log(`\nChaves usadas mas AUSENTES em pt.json: ${missing.length}`)
for (const k of missing) {
  console.log(`  ${k}`)
  for (const f of used.get(k)) console.log(`      <- ${f}`)
}

// paridade entre os locales: toda chave de pt precisa existir em en e es
let paridadeOk = true
for (const l of ['en', 'es']) {
  const faltando = [...ptKeys].filter(k => !keysByLocale[l].has(k)).sort()
  const sobrando = [...keysByLocale[l]].filter(k => !ptKeys.has(k)).sort()
  console.log(`\n${l}.json: ${faltando.length} chave(s) faltando, ${sobrando.length} sobrando em relacao a pt.json`)
  for (const k of faltando.slice(0, 40)) console.log(`  faltando: ${k}`)
  if (faltando.length > 40) console.log(`  ... e mais ${faltando.length - 40}`)
  for (const k of sobrando.slice(0, 40)) console.log(`  sobrando: ${k}`)
  if (sobrando.length > 40) console.log(`  ... e mais ${sobrando.length - 40}`)
  if (faltando.length || sobrando.length) paridadeOk = false
}

const ok = missing.length === 0 && paridadeOk
console.log(`\n${ok ? 'OK: nenhum mismatch de chave' : 'FALHOU: ha mismatches acima'}`)
process.exit(ok ? 0 : 1)
