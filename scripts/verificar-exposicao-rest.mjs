#!/usr/bin/env node
/**
 * Falha se alguma tabela que não deveria ser pública estiver alcançável pela
 * chave anônima.
 *
 * POR QUE ESTE SCRIPT EXISTE. Em 07/09/2026 nove tabelas de backup nasceram no
 * schema `public` sem RLS. A chave anônima vai no pacote do front, é pública por
 * definição, e com ela qualquer pessoa lia o conteúdo inteiro por HTTP. Entre
 * elas estava `gostoso_fund_entries_apagadas_20260907`: lançamentos do fundo que
 * tinham acabado de sair da página e continuavam consultáveis. O dado saiu da
 * tela e não saiu do ar.
 *
 * Backup de hoje é vazamento de amanhã, porque ninguém volta para arrumar.
 *
 * POR QUE ELE MEDE PELA CHAVE ANÔNIMA. Consultar `pg_class` diria quais tabelas
 * têm RLS. Isto aqui responde a pergunta que importa: o que um estranho, com a
 * chave que está no JavaScript da página, consegue puxar. É a mesma diferença
 * entre ler o código e medir o HTML servido.
 *
 * DUAS COBERTURAS, E ELE DIZ QUAL ESTÁ USANDO.
 *
 *   completa  precisa de SUPABASE_SERVICE_ROLE_KEY. Lê o catálogo que o próprio
 *             PostgREST publica e confere TODA tabela exposta, inclusive as que
 *             ninguém sabia que existiam. É a que vale como aprovação.
 *
 *   reduzida  só com a chave anônima. O PostgREST recusa o catálogo para ela
 *             ("Only the service_role API key can be used for this endpoint"),
 *             então sobra conferir uma lista de vigiados escrita à mão. Isso
 *             NUNCA dá verde: sai com código 2, inconclusivo. Um teste que cobre
 *             menos do que promete é pior do que teste nenhum, porque vira um
 *             carimbo de aprovação em cima de uma pergunta que não foi feita.
 *
 * O MEDIDOR PROVA QUE SABE FALHAR ANTES DE APROVAR. Toda execução roda dois
 * controles: uma tabela que tem que responder com dado e uma que tem que
 * responder 404. Se qualquer um se comportar fora do esperado, o script para e
 * avisa que a medição não vale, em vez de dar verde por engano.
 *
 * Uso:  node scripts/verificar-exposicao-rest.mjs
 * Saída: 0 limpo e completo · 1 achou exposição · 2 não deu para concluir
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/* ── configuração ────────────────────────────────────────────────────────── */

/** Tabela pública de verdade, controle positivo. Se ela parar de responder, o
 *  problema é a sonda, não o banco. */
const CONTROLE_POSITIVO = 'gostoso_categories'

/** Nome que não existe, controle negativo. */
const CONTROLE_NEGATIVO = 'tabela_que_nao_existe_zzz'

/** Padrões de nome que nunca deveriam estar ao alcance da chave anônima. */
const PADROES_PROIBIDOS = [
  /backup/i,
  /_bkp/i,
  /_old(_|$)/i,
  /_temp(_|$)/i,
  /_tmp(_|$)/i,
  /_copia/i,
  /_apagad/i,
  /_\d{8}$/, // sufixo de data, tipo _20260907
]

/** Vigiados da cobertura reduzida: as nove de 07/09/2026. Se alguma voltar a
 *  responder, alguém desfez o conserto. */
const VIGIADOS = [
  'gostoso_blog_posts_backup_20260907',
  'gostoso_businesses_fotos_backup_20260907',
  'gostoso_blog_faq_backup_20260907',
  'gostoso_fund_entries_backup_20260907',
  'gostoso_fund_entries_apagadas_20260907',
  'gostoso_vitor_b_backup_20260907',
  'gostoso_categorias_resolva_backup_20260907',
  'gostoso_goals_backup_20260907',
  'gostoso_planos_backup_20260907',
]

/* ── ambiente ────────────────────────────────────────────────────────────── */

function lerEnvLocal() {
  const caminho = join(process.cwd(), '.env.local')
  if (!existsSync(caminho)) return {}
  const saida = {}
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    const m = linha.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) saida[m[1]] = m[2].trim()
  }
  return saida
}

const env = { ...lerEnvLocal(), ...process.env }
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const CHAVE = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const CHAVE_SERVICO = env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!URL_BASE || !CHAVE) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  console.error('Sem elas não dá para medir, e medir errado é pior do que não medir.')
  process.exit(2)
}

const comAnon = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` }

/* ── sonda ───────────────────────────────────────────────────────────────── */

async function sondar(tabela) {
  const r = await fetch(`${URL_BASE}/rest/v1/${tabela}?select=*&limit=1`, { headers: comAnon })
  const corpo = await r.text()
  let linhas = 0
  try {
    const j = JSON.parse(corpo)
    if (Array.isArray(j)) linhas = j.length
  } catch {
    /* corpo de erro não é array */
  }
  return { status: r.status, linhas, corpo: corpo.slice(0, 110) }
}

/** Catálogo do que o PostgREST expõe. Só a service_role consegue ler. */
async function tabelasExpostas() {
  const r = await fetch(`${URL_BASE}/rest/v1/`, {
    headers: { apikey: CHAVE_SERVICO, Authorization: `Bearer ${CHAVE_SERVICO}` },
  })
  if (!r.ok) throw new Error(`catálogo recusado: HTTP ${r.status}`)
  const spec = await r.json()
  return Object.keys(spec.definitions ?? {}).sort()
}

/* ── execução ────────────────────────────────────────────────────────────── */

async function principal() {
  console.log('Alvo:', URL_BASE)
  console.log()

  console.log('CONTROLES')
  const positivo = await sondar(CONTROLE_POSITIVO)
  const negativo = await sondar(CONTROLE_NEGATIVO)
  console.log(`  positivo  ${CONTROLE_POSITIVO}: HTTP ${positivo.status}, ${positivo.linhas} linha(s)`)
  console.log(`  negativo  ${CONTROLE_NEGATIVO}: HTTP ${negativo.status}`)

  if (positivo.status !== 200 || positivo.linhas === 0) {
    console.error('\nA sonda não passou no controle positivo. A medição não vale.')
    return 2
  }
  if (negativo.status !== 404) {
    console.error('\nA sonda não passou no controle negativo: inexistente não respondeu 404.')
    return 2
  }
  console.log('  os dois se comportaram como esperado, a medição vale.\n')

  let candidatos
  let completa = false
  if (CHAVE_SERVICO) {
    try {
      candidatos = await tabelasExpostas()
      completa = true
      console.log(`COBERTURA COMPLETA: ${candidatos.length} tabela(s) expostas no catálogo\n`)
    } catch (e) {
      console.log(`Catálogo indisponível (${e.message}), caindo para cobertura reduzida.\n`)
    }
  }
  if (!completa) {
    candidatos = VIGIADOS
    console.log(`COBERTURA REDUZIDA: só os ${VIGIADOS.length} vigiados, sem SUPABASE_SERVICE_ROLE_KEY\n`)
  }

  /* `--vigiar=nome[,nome]` acrescenta nomes à conferência. Serve para vigiar um
     backup recém-criado antes de ele entrar na lista, e é como se prova que este
     script sabe apontar vermelho: cria-se uma tabela sem RLS, roda com o nome
     dela aqui, e ela tem que aparecer. */
  const extras = (process.argv.find((a) => a.startsWith('--vigiar=')) || '')
    .replace('--vigiar=', '')
    .split(',')
    .filter(Boolean)
  if (extras.length) {
    candidatos = [...new Set([...candidatos, ...extras])]
    console.log(`  mais ${extras.length} nome(s) passados em --vigiar\n`)
  }

  const suspeitas = candidatos.filter((t) => PADROES_PROIBIDOS.some((p) => p.test(t)))
  const abertas = []
  for (const t of suspeitas) {
    const s = await sondar(t)
    if (s.status === 200) abertas.push({ t, ...s })
  }

  if (abertas.length > 0) {
    console.log(`VERMELHO: ${abertas.length} tabela(s) ao alcance da chave anônima\n`)
    for (const a of abertas) {
      console.log(`  ${a.t}`)
      console.log(`     HTTP ${a.status}, ${a.linhas} linha(s)`)
      console.log(`     ${a.corpo}`)
    }
    console.log('\nComo fechar, sem apagar nada:')
    console.log('  alter table public.<tabela> set schema backups;')
    console.log('  alter table backups.<tabela> enable row level security;')
    console.log('  alter table backups.<tabela> force row level security;')
    console.log('  revoke all on table backups.<tabela> from anon, authenticated;')
    return 1
  }

  if (!completa) {
    console.log('Os vigiados estão fechados, mas isto NÃO é aprovação.')
    console.log('Sem SUPABASE_SERVICE_ROLE_KEY não dá para saber o que mais existe exposto,')
    console.log('e o buraco de 07/09 foi exatamente uma tabela que ninguém sabia que estava lá.')
    return 2
  }

  console.log('VERDE: nenhuma tabela com cara de backup, cópia ou temporária ao alcance.')
  return 0
}

principal()
  .then((codigo) => process.exit(codigo))
  .catch((e) => {
    console.error('Falhou ao medir:', e.message)
    process.exit(2)
  })
