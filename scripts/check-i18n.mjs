import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const pt = JSON.parse(readFileSync(resolve(ROOT, 'src/locales/pt.json'), 'utf8'))

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

const existingKeys = new Set(flattenKeys(pt, ''))

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

const files = walk(resolve(ROOT, 'src'))
console.log('Files scanned:', files.length)

const usedKeys = new Set()
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const matches = content.matchAll(/t\(['"]([^'"]+)['"]\)/g)
  for (const m of matches) {
    usedKeys.add(m[1])
  }
}

const missing = [...usedKeys].filter(k => !existingKeys.has(k)).sort()
console.log('Missing keys:', missing.length)
for (const k of missing) console.log('  ' + k)

// Also show keys in json not used in code
const unused = [...existingKeys].filter(k => !usedKeys.has(k)).sort()
console.log('\nUnused keys:', unused.length)
for (const k of unused.slice(0, 30)) console.log('  ' + k)
if (unused.length > 30) console.log('  ... and ' + (unused.length - 30) + ' more')
