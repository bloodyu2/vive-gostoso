/**
 * Importa as Tabuas de Mare da Marinha do Brasil (CHM/DHN) para gostoso_mares.
 *
 * Uso (na raiz do repo):
 *   npx tsx scripts/mares/importar-tabua-marinha.ts --dry-run          # so conta, nao grava
 *   npx tsx scripts/mares/importar-tabua-marinha.ts --json saida.json  # grava as linhas num JSON
 *   npx tsx scripts/mares/importar-tabua-marinha.ts                    # grava no Supabase
 *   npx tsx scripts/mares/importar-tabua-marinha.ts --ano 2027         # so a edicao de 2027
 *
 * Le NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do .env.local (ou do
 * ambiente). A chave nunca e impressa. Grava com upsert em (estacao, data_hora),
 * entao rodar de novo nao duplica nada.
 *
 * Para 2027: baixar o PDF do Porto de Natal da edicao 2027 em
 * https://www.marinha.mil.br/chm/tabuas-de-mare (ou direto em
 * assets.marinha.mil.br/chm/.../dados_de_mare/), salvar como
 * scripts/mares/fontes/natal-2027.pdf, acrescentar a entrada em FONTES abaixo,
 * conferir 10 dias no teste src/lib/mares/extrair-tabua.test.ts e rodar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { lerItensDoPdf } from '../../src/lib/mares/ler-pdf'
import { extrairEventos } from '../../src/lib/mares/extrair-tabua'
import { montarLinhas, resumoPorMes, formatarResumo, type LinhaMare } from '../../src/lib/mares/importacao'

const RAIZ = resolve(import.meta.dirname, '..', '..')

type Fonte = { arquivo: string; estacao: string; ano: number; fonte: string; url: string }

const FONTES: Fonte[] = [
  {
    arquivo: 'scripts/mares/fontes/natal-2026.pdf',
    estacao: 'COM3DN',
    ano: 2026,
    fonte: 'Tabuas de Mare da Marinha do Brasil (CHM/DHN) 2026, Porto de Natal',
    url: 'https://assets.marinha.mil.br/chm/sites/www.marinha.mil.br.chm/files/dados_de_mare/22%20-%20PORTO%20DE%20NATAL%20-%20COM3DN%20-%2076%20-78.pdf',
  },
]

function argumento(nome: string): string | undefined {
  const i = process.argv.indexOf(nome)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function lerEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const nome of ['.env.local', '.env']) {
    const caminho = resolve(RAIZ, nome)
    if (!existsSync(caminho)) continue
    for (const linha of readFileSync(caminho, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim()
    }
  }
  return env
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const saidaJson = argumento('--json')
  const anoFiltro = argumento('--ano')
  const fontes = FONTES.filter((f) => !anoFiltro || String(f.ano) === anoFiltro)
  if (fontes.length === 0) throw new Error(`Nenhuma fonte cadastrada para o ano ${anoFiltro}`)

  const linhas: LinhaMare[] = []
  for (const f of fontes) {
    const eventos = extrairEventos(await lerItensDoPdf(resolve(RAIZ, f.arquivo)), f.ano)
    linhas.push(...montarLinhas(eventos, f.estacao, f.fonte, f.ano))
  }

  console.log(formatarResumo(resumoPorMes(linhas)))

  if (saidaJson) {
    writeFileSync(resolve(process.cwd(), saidaJson), JSON.stringify(linhas, null, 2))
    console.log(`JSON gravado em ${saidaJson} (${linhas.length} linhas)`)
  }
  if (dryRun || saidaJson) {
    console.log('Nada foi gravado no Supabase.')
    return
  }

  const env = { ...lerEnv(), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const chave = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !chave) {
    throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  }
  const supabase = createClient(url, chave, { auth: { persistSession: false } })
  const LOTE = 500
  for (let i = 0; i < linhas.length; i += LOTE) {
    const { error } = await supabase
      .from('gostoso_mares')
      .upsert(linhas.slice(i, i + LOTE), { onConflict: 'estacao,data_hora' })
    if (error) throw new Error(`Falha ao gravar lote ${i / LOTE + 1}: ${error.message}`)
  }
  console.log(`Gravadas ${linhas.length} linhas em gostoso_mares (${new URL(url).host}).`)
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro)
  process.exit(1)
})
