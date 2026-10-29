import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* Protecao contra abuso do resgate (migracao 20261029120000), num Postgres em memoria:
   teto por IP lido de request.headers, teto por e-mail e por telefone por parceiro por
   mes, o IP nunca guardado puro nem legivel pelo parceiro, e a limpeza por prazo.

   O que o PGlite NAO prova: que o PostgREST do Supabase entrega esses cabecalhos em
   producao. Aqui o cabecalho e posto a mao com set_config, como o PostgREST faz. */

const MIGRACOES = [
  '20261026120000_vg_clube_passaporte.sql',
  '20261028100000_vg_clube_resgate.sql',
  '20261029120000_vg_clube_resgate_antiabuso.sql',
]

const CAT = '30000000-0000-4000-8000-000000000001'
const NEGOCIO_A = IDS.negocioPublicado // dono: usuarioDono
const NEGOCIO_B = '20000000-0000-4000-8000-0000000000b2' // dono: usuarioOutro
const P_A = '40000000-0000-4000-8000-0000000000a1'
const P_B = '40000000-0000-4000-8000-0000000000b1'
const VERSAO = '2026-10-28'

let db: PGlite
let n = 0

type Resp = { ok: boolean; motivo?: string; token?: string; [k: string]: unknown }

/** Poe os cabecalhos da requisicao como o PostgREST poe, ou limpa. */
async function cabecalhos(h: Record<string, string> | null) {
  const valor = h === null ? '' : JSON.stringify(h).replace(/'/g, "''")
  await db.exec(`select set_config('request.headers', '${valor}', false)`)
}

const lit = (v: string) => `'${v.replace(/'/g, "''")}'`

/** Resgate pelo papel anon. Por padrao e-mail e telefone novos a cada chamada. */
async function resgatar(
  partner: string,
  campos: Partial<{ email: string; telefone: string }> = {},
): Promise<Resp> {
  n += 1
  const email = campos.email ?? `pessoa${n}@exemplo.com`
  const telefone = campos.telefone ?? `849${String(10_000_000 + n)}`
  const nome = (
    await db.query<{ name: string }>(
      `select b.name from public.gostoso_club_partners cp join public.gostoso_businesses b on b.id = cp.business_id where cp.id = '${partner}'`,
    )
  ).rows[0].name
  const texto = `Autorizo repassar meu nome, e-mail e telefone a ${nome} para que ele me procure sobre esta vantagem.`
  const r = await como<{ r: Resp }>(
    db,
    'anon',
    null,
    `select public.gostoso_club_resgatar('${partner}', 'Ana Souza', ${lit(email)}, ${lit(telefone)}, true, '${VERSAO}', ${lit(texto)}, null, null, null) as r`,
  )
  return r.rows[0].r
}

/** O teto de 5 por minuto por parceiro olha o relogio e os testes rodam em rajada: recua so os
 *  cupons do ultimo minuto em 2 minutos. Continuam dentro da janela de 1 hora e de 1 dia, que
 *  e o que estes testes medem. */
async function afrouxarOMinuto() {
  await db.exec(
    `update public.gostoso_club_vouchers set created_at = created_at - interval '2 minutes' where created_at > now() - interval '1 minute'`,
  )
}

async function marcarTodosComoUsados() {
  await db.exec(
    `update public.gostoso_club_vouchers set status = 'usado', usado_em = now() where status = 'valido'`,
  )
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Passeios');
    insert into public.gostoso_businesses (id, name, slug, profile_id, category_id, active, is_published) values
      ('${NEGOCIO_B}', 'Outro negocio', 'outro-negocio', '${IDS.perfilOutro}', '${CAT}', true, true);
    update public.gostoso_businesses set category_id = '${CAT}' where id = '${NEGOCIO_A}';
  `)
  for (const m of MIGRACOES) {
    await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', m), 'utf8'))
  }
  await db.exec(`
    insert into public.gostoso_club_partners (id, business_id, tipo, beneficio, status) values
      ('${P_A}', '${NEGOCIO_A}', 'Passeios', '10% no primeiro passeio', 'no_ar'),
      ('${P_B}', '${NEGOCIO_B}', 'Passeios', 'Sobremesa de cortesia', 'no_ar');
  `)
}, 60_000)

beforeEach(async () => {
  await db.exec('delete from public.gostoso_club_vouchers')
  await cabecalhos(null)
  n = 0
})

describe('a migracao e idempotente', () => {
  it('aplicar de novo nao da erro, nao muda o comportamento e nao reabre o grant da coluna', async () => {
    const sql = readFileSync(resolve(process.cwd(), 'supabase/migrations', MIGRACOES[2]), 'utf8')
    await db.exec(sql)
    await db.exec(sql)
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.99' })
    expect((await resgatar(P_A)).ok).toBe(true)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select ip_hash from public.gostoso_club_vouchers'),
    ).rejects.toThrow(/permission denied/i)
  })
})

describe('teto por IP (cf-connecting-ip)', () => {
  it('15 cupons por hora saem; o 16o, de qualquer parceiro, e recusado; outro IP segue livre', async () => {
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.7' })
    for (let i = 0; i < 15; i++) {
      const r = await resgatar(i % 2 === 0 ? P_A : P_B)
      expect(r.ok, `cupom ${i + 1}`).toBe(true)
      await afrouxarOMinuto()
    }
    expect(await resgatar(P_A)).toMatchObject({ ok: false, motivo: 'muitos' })
    expect(await resgatar(P_B)).toMatchObject({ ok: false, motivo: 'muitos' })

    await cabecalhos({ 'cf-connecting-ip': '203.0.113.8' })
    expect((await resgatar(P_A)).ok).toBe(true)
  })

  it('o teto diario e de 40 por IP, mesmo com a hora livre', async () => {
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.20' })
    const hash = (await como<{ h: string }>(db, 'service_role', null, 'select public.gostoso_club__ip_hash() as h')).rows[0].h
    await db.exec(`
      insert into public.gostoso_club_vouchers
        (partner_id, business_id, codigo, nome, email, telefone, consentimento_versao, consentimento_texto,
         expira_em, ip_hash, created_at, status, usado_em)
      select '${P_B}', '${NEGOCIO_B}', public.gostoso_club__codigo_cupom(),
             'Fulano Teste', 'antigo' || g || '@exemplo.com', '84988' || lpad(g::text, 6, '0'), '${VERSAO}',
             'Autorizo repassar meu nome, e-mail e telefone a Outro negocio para que ele me procure.',
             public.gostoso_club_hoje() + 10, '${hash}', now() - interval '5 hours', 'usado', now()
        from generate_series(1, 39) g
    `)
    expect((await resgatar(P_A)).ok).toBe(true) // o 40o
    expect(await resgatar(P_A)).toMatchObject({ ok: false, motivo: 'muitos' })
  })

  it('o cabecalho x-forwarded-for forjado nao desliga o teto quando ha cf-connecting-ip', async () => {
    for (let i = 0; i < 15; i++) {
      await cabecalhos({ 'cf-connecting-ip': '203.0.113.30', 'x-forwarded-for': `198.51.100.${i + 1}, 10.0.0.1` })
      expect((await resgatar(P_A)).ok).toBe(true)
      await afrouxarOMinuto()
      await marcarTodosComoUsados()
    }
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.30', 'x-forwarded-for': '198.51.100.99' })
    expect(await resgatar(P_A)).toMatchObject({ ok: false, motivo: 'muitos' })
  })

  it('sem cf-connecting-ip, usa x-real-ip e depois o primeiro item de x-forwarded-for', async () => {
    const hash = async () =>
      (await como<{ h: string | null }>(db, 'service_role', null, 'select public.gostoso_club__ip_hash() as h')).rows[0].h
    await cabecalhos({ 'x-real-ip': '203.0.113.40' })
    const viaReal = await hash()
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.40' })
    expect(viaReal).toBe(await hash())
    await cabecalhos({ 'x-forwarded-for': '203.0.113.40, 10.0.0.1, 10.0.0.2' })
    expect(await hash()).toBe(viaReal)
    await cabecalhos({ 'x-forwarded-for': '203.0.113.41, 10.0.0.1' })
    expect(await hash()).not.toBe(viaReal)
  })

  it('IPv6 conta pelo bloco /64; blocos diferentes ficam separados', async () => {
    const hash = async (ip: string) => {
      await cabecalhos({ 'cf-connecting-ip': ip })
      return (await como<{ h: string }>(db, 'service_role', null, 'select public.gostoso_club__ip_hash() as h')).rows[0].h
    }
    const a = await hash('2001:db8:1:2::1')
    expect(await hash('2001:db8:1:2:ffff:ffff:ffff:ffff')).toBe(a)
    expect(await hash('2001:db8:1:3::1')).not.toBe(a)
  })

  it('sem cabecalho, com lixo ou com IP invalido, o teto por IP nao se aplica e nada quebra', async () => {
    const casos: Array<Record<string, string> | null> = [null, {}, { 'cf-connecting-ip': 'isto-nao-e-ip' }, { 'x-forwarded-for': '' }]
    for (const h of casos) {
      await db.exec('delete from public.gostoso_club_vouchers')
      await cabecalhos(h)
      expect((await resgatar(P_A)).ok, JSON.stringify(h)).toBe(true)
      const l = (await db.query<{ ip_hash: string | null }>('select ip_hash from public.gostoso_club_vouchers')).rows
      expect(l[0].ip_hash).toBeNull()
    }
    await db.exec(`select set_config('request.headers', 'nao e json', false)`)
    expect((await resgatar(P_B)).ok).toBe(true)
  })
})

describe('o IP nunca e guardado puro nem lido pelo parceiro', () => {
  it('grava so o hash de 64 hex, sem o endereco dentro', async () => {
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.55' })
    expect((await resgatar(P_A)).ok).toBe(true)
    const linha = (await db.query<Record<string, unknown>>('select * from public.gostoso_club_vouchers')).rows[0]
    expect(linha.ip_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(linha)).not.toContain('203.0.113.55')
  })

  it('o dono do negocio nao consegue ler a coluna ip_hash, mas le as demais', async () => {
    await cabecalhos({ 'cf-connecting-ip': '203.0.113.56' })
    await resgatar(P_A)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select ip_hash from public.gostoso_club_vouchers'),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select * from public.gostoso_club_vouchers'),
    ).rejects.toThrow(/permission denied/i)
    const ok = await como(db, 'authenticated', IDS.usuarioDono, 'select codigo, email, telefone from public.gostoso_club_vouchers')
    expect(ok.rows).toHaveLength(1)
  })

  it('o publico nao chama a funcao do hash', async () => {
    await expect(como(db, 'anon', null, 'select public.gostoso_club__ip_hash()')).rejects.toThrow(/permission denied/i)
  })
})

describe('teto por e-mail e por telefone, por parceiro e por mes', () => {
  it('o 4o cupom do mesmo e-mail (com pontos e +etiqueta do Gmail) no parceiro e recusado', async () => {
    const variantes = ['ana.souza@gmail.com', 'anasouza+1@gmail.com', 'a.n.a.souza@googlemail.com']
    for (const [i, email] of variantes.entries()) {
      const r = await resgatar(P_A, { email, telefone: `84977${String(100000 + i)}` })
      expect(r.ok, email).toBe(true)
      await afrouxarOMinuto()
      await marcarTodosComoUsados() // sem isso o "ja_tem" responde antes
    }
    expect(await resgatar(P_A, { email: 'ANASOUZA@gmail.com', telefone: '84977999999' })).toMatchObject({
      ok: false,
      motivo: 'limite_contato',
    })
    // outro parceiro nao e afetado
    expect((await resgatar(P_B, { email: 'anasouza@gmail.com', telefone: '84977999999' })).ok).toBe(true)
  })

  it('o 4o cupom do mesmo telefone no parceiro e recusado, mesmo com e-mails diferentes', async () => {
    for (let i = 0; i < 3; i++) {
      const r = await resgatar(P_A, { telefone: '(84) 98888-1234' })
      expect(r.ok, `cupom ${i + 1}`).toBe(true)
      await afrouxarOMinuto()
    }
    expect(await resgatar(P_A, { telefone: '+55 84 98888-1234' })).toMatchObject({ ok: false, motivo: 'limite_contato' })
    expect((await resgatar(P_B, { telefone: '84988881234' })).ok).toBe(true)
  })

  it('cancelar o cupom nao zera o teto', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await resgatar(P_A, { telefone: '84988880000' })).ok).toBe(true)
      await afrouxarOMinuto()
    }
    await db.exec(`update public.gostoso_club_vouchers set status = 'cancelado'`)
    expect(await resgatar(P_A, { telefone: '84988880000' })).toMatchObject({ ok: false, motivo: 'limite_contato' })
  })

  it('o teto zera no mes seguinte (cupons de antes do inicio do mes nao contam)', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await resgatar(P_A, { telefone: '84988882222' })).ok).toBe(true)
      await afrouxarOMinuto()
    }
    expect(await resgatar(P_A, { telefone: '84988882222' })).toMatchObject({ ok: false, motivo: 'limite_contato' })
    await db.exec(`update public.gostoso_club_vouchers set created_at = created_at - interval '40 days'`)
    expect((await resgatar(P_A, { telefone: '84988882222' })).ok).toBe(true)
  })

  it('o teto por e-mail tambem zera no mes seguinte', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await resgatar(P_A, { email: 'mensal@exemplo.com', telefone: `84955${String(100000 + i)}` })).ok).toBe(true)
      await afrouxarOMinuto()
      await marcarTodosComoUsados()
    }
    expect(await resgatar(P_A, { email: 'mensal@exemplo.com', telefone: '84955999999' })).toMatchObject({
      ok: false,
      motivo: 'limite_contato',
    })
    await db.exec(`update public.gostoso_club_vouchers set created_at = created_at - interval '40 days'`)
    expect((await resgatar(P_A, { email: 'mensal@exemplo.com', telefone: '84955999999' })).ok).toBe(true)
  })

  it('"ja_tem" continua respondendo antes do teto', async () => {
    expect((await resgatar(P_A, { email: 'repetida@exemplo.com' })).ok).toBe(true)
    expect(await resgatar(P_A, { email: 'repetida@exemplo.com' })).toMatchObject({ ok: false, motivo: 'ja_tem' })
  })
})

describe('retencao: gostoso_club_manutencao', () => {
  async function linhaAntiga(meses: number, i: number) {
    await db.exec(`
      insert into public.gostoso_club_vouchers
        (partner_id, business_id, codigo, nome, email, telefone, consentimento_versao, consentimento_texto,
         expira_em, created_at)
      values ('${P_A}', '${NEGOCIO_A}', public.gostoso_club__codigo_cupom(), 'Fulano Teste', 'ret${i}@exemplo.com', '84966600000', '${VERSAO}',
         'Autorizo repassar meu nome, e-mail e telefone a Publicado para que ele me procure.',
         public.gostoso_club_hoje() + 10, now() - interval '${meses} months')
    `)
  }

  it('apaga o que passou de 12 meses e guarda o resto', async () => {
    await linhaAntiga(13, 2)
    await linhaAntiga(11, 3)
    await como(db, 'authenticated', IDS.usuarioDono, 'select public.gostoso_club_manutencao()')
    const l = (await db.query<{ email: string }>('select email from public.gostoso_club_vouchers')).rows
    expect(l.map((x) => x.email)).toEqual(['ret3@exemplo.com'])
  })

  it('anon nao executa a manutencao nem a limpeza com prazo', async () => {
    await expect(como(db, 'anon', null, 'select public.gostoso_club_manutencao()')).rejects.toThrow(/permission denied/i)
    await expect(como(db, 'anon', null, 'select public.gostoso_club_limpar_resgates(1)')).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select public.gostoso_club_limpar_resgates(1)'),
    ).rejects.toThrow(/permission denied/i)
  })

  it('a manutencao nao devolve nada, entao quem chama nao aprende quantos havia', async () => {
    await linhaAntiga(14, 4)
    const r = await como<{ m: unknown }>(db, 'authenticated', IDS.usuarioDono, 'select public.gostoso_club_manutencao() as m')
    expect(r.rows[0].m === null || r.rows[0].m === '').toBe(true)
  })
})
