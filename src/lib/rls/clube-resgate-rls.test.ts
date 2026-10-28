import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* Roda as DUAS migracoes do Passaporte (a de 26/10 e a do resgate, 28/10) num Postgres em
   memoria e confere o resgate com cadastro: validacao no servidor, consentimento, uso
   unico, quem le os dados pessoais (so o dono do negocio e o admin) e o que o publico ve. */

const MIGRACAO_CLUBE = '20261026120000_vg_clube_passaporte.sql'
const MIGRACAO_RESGATE = '20261028100000_vg_clube_resgate.sql'

const CAT = '30000000-0000-4000-8000-000000000001'
const NEGOCIO_A = IDS.negocioPublicado // dono: usuarioDono
const NEGOCIO_B = '20000000-0000-4000-8000-0000000000b2' // dono: usuarioOutro
const NEGOCIO_C = '20000000-0000-4000-8000-0000000000b3' // rascunho
const P_A = '40000000-0000-4000-8000-0000000000a1'
const P_B = '40000000-0000-4000-8000-0000000000b1'
const P_C = '40000000-0000-4000-8000-0000000000c1'
const P_AGUARDA = '40000000-0000-4000-8000-0000000000d1'

const VERSAO = '2026-10-28'
const TEXTO = 'Autorizo repassar meu nome, e-mail e telefone a Publicado para que ele me procure sobre esta vantagem.'
const APARELHO = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

let db: PGlite

type Resp = {
  ok: boolean
  motivo?: string
  token?: string
  codigo?: string
  expira_em?: string
  negocio?: string
  beneficio?: string
  [k: string]: unknown
}

async function resgatar(
  partner: string,
  campos: Partial<{
    nome: string
    email: string
    telefone: string
    consentimento: boolean
    versao: string
    texto: string
    origem: string | null
    aparelho: string | null
    isca: string | null
  }> = {},
): Promise<Resp> {
  const c = {
    nome: 'Ana Souza',
    email: 'ana@exemplo.com',
    telefone: '(84) 99999-1234',
    consentimento: true,
    versao: VERSAO,
    texto: TEXTO,
    origem: null,
    aparelho: null,
    isca: null,
    ...campos,
  }
  const lit = (v: string | null) => (v === null ? 'null' : `'${v.replace(/'/g, "''")}'`)
  const r = await como<{ r: Resp }>(
    db,
    'anon',
    null,
    `select public.gostoso_club_resgatar('${partner}', ${lit(c.nome)}, ${lit(c.email)}, ${lit(c.telefone)},
       ${c.consentimento}, ${lit(c.versao)}, ${lit(c.texto)}, ${lit(c.origem)}, ${lit(c.aparelho)}, ${lit(c.isca)}) as r`,
  )
  return r.rows[0].r
}


/** O teto de 20 resgates por minuto olha a ultima hora cheia de relogio; como os testes rodam
 *  em sequencia, recuo o que ja foi criado para cada teste comecar sem rajada acumulada. */
async function envelhecer() {
  await db.exec(
    `update public.gostoso_club_vouchers set created_at = created_at - interval '3 minutes' where created_at > now() - interval '2 minutes'`,
  )
}

async function linhas(partner?: string) {
  const r = await db.query<Record<string, unknown>>(
    `select * from public.gostoso_club_vouchers ${partner ? `where partner_id = '${partner}'` : ''} order by created_at, id`,
  )
  return r.rows
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Passeios');
    insert into public.gostoso_businesses (id, name, slug, profile_id, category_id, active, is_published) values
      ('${NEGOCIO_B}', 'Outro negocio', 'outro-negocio', '${IDS.perfilOutro}', '${CAT}', true, true),
      ('${NEGOCIO_C}', 'Rascunho do outro', 'rascunho-outro', '${IDS.perfilOutro}', '${CAT}', true, false);
    update public.gostoso_businesses set category_id = '${CAT}' where id = '${NEGOCIO_A}';
  `)
  for (const m of [MIGRACAO_CLUBE, MIGRACAO_RESGATE]) {
    await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', m), 'utf8'))
  }
  await db.exec(`
    insert into public.gostoso_club_partners (id, business_id, tipo, beneficio, status) values
      ('${P_A}', '${NEGOCIO_A}', 'Passeios', '10% no primeiro passeio', 'no_ar'),
      ('${P_B}', '${NEGOCIO_B}', 'Passeios', 'Sobremesa de cortesia', 'no_ar'),
      ('${P_C}', '${NEGOCIO_C}', 'Passeios', 'Brinde', 'no_ar');
    insert into public.gostoso_club_partners (id, business_id, tipo, beneficio, status)
      select '${P_AGUARDA}', b.id, 'Passeios', 'Em combinacao', 'em_combinacao'
        from public.gostoso_businesses b where b.id = '${IDS.negocioDesativado}';
  `)
}, 60_000)

describe('resgatar: caminho feliz', () => {
  it('devolve token longo, código curto, validade e grava os dados limpos com o consentimento', async () => {
    const r = await resgatar(P_A, { origem: '07', aparelho: APARELHO(1) })
    expect(r.ok).toBe(true)
    expect(r.token).toMatch(/^[0-9a-f]{64}$/)
    expect(r.codigo).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
    expect(r.negocio).toBe('Publicado')
    expect(r.beneficio).toBe('10% no primeiro passeio')
    const hoje = await db.query<{ d: string; em30: string }>(
      `select public.gostoso_club_hoje()::text as d, (public.gostoso_club_hoje() + 30)::text as em30`,
    )
    expect(r.expira_em).toBe(hoje.rows[0].em30)

    const [v] = await linhas(P_A)
    expect(v).toMatchObject({
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      telefone: '84999991234',
      status: 'valido',
      consentimento_versao: VERSAO,
      consentimento_texto: TEXTO,
      origem: '07',
      aparelho: APARELHO(1),
      business_id: NEGOCIO_A,
    })
    expect(v.consentimento_em).toBeTruthy()
    expect(v.usado_em).toBeNull()
  })

  it('a validade do parceiro corta a do cupom', async () => {
    await db.exec(`update public.gostoso_club_partners set valido_ate = public.gostoso_club_hoje() + 5 where id = '${P_B}'`)
    const r = await resgatar(P_B, { email: 'validade@exemplo.com' })
    const cinco = await db.query<{ d: string }>(`select (public.gostoso_club_hoje() + 5)::text as d`)
    expect(r.expira_em).toBe(cinco.rows[0].d)
    await db.exec(`update public.gostoso_club_partners set valido_ate = null where id = '${P_B}'`)
  })

  it('e-mail em maiúsculas e telefone com +55 saem normalizados', async () => {
    const r = await resgatar(P_B, { email: '  BIA@Exemplo.COM ', telefone: '+55 (84) 3236-1234', nome: '  Bia   Lima ' })
    expect(r.ok).toBe(true)
    const rows = await db.query<{ email: string; telefone: string; nome: string }>(
      `select email, telefone, nome from public.gostoso_club_vouchers where token = '${r.token}'`,
    )
    expect(rows.rows[0]).toEqual({ email: 'bia@exemplo.com', telefone: '8432361234', nome: 'Bia Lima' })
  })

  it('cada resgate tem token e código próprios', async () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 12; i++) {
      const r = await resgatar(P_B, { email: `lote${i}@exemplo.com`, aparelho: APARELHO(100 + i) })
      expect(r.ok).toBe(true)
      tokens.add(r.token!)
    }
    expect(tokens.size).toBe(12)
  })
})

describe('resgatar: o servidor valida de novo', () => {
  it('sem consentimento, ou com texto ou versão inválidos, não resgata e não grava', async () => {
    const antes = (await linhas()).length
    expect(await resgatar(P_A, { consentimento: false, email: 'c1@exemplo.com' })).toEqual({ ok: false, motivo: 'consentimento' })
    expect(await resgatar(P_A, { versao: 'ontem', email: 'c2@exemplo.com' })).toEqual({ ok: false, motivo: 'consentimento' })
    expect(await resgatar(P_A, { texto: 'ok', email: 'c3@exemplo.com' })).toEqual({ ok: false, motivo: 'consentimento' })
    expect(await resgatar(P_A, { texto: 'x'.repeat(601), email: 'c4@exemplo.com' })).toEqual({ ok: false, motivo: 'consentimento' })
    expect((await linhas()).length).toBe(antes)
  })

  it('nome, e-mail e telefone inválidos têm motivo próprio', async () => {
    expect(await resgatar(P_A, { nome: 'A', email: 'n@exemplo.com' })).toEqual({ ok: false, motivo: 'nome' })
    expect(await resgatar(P_A, { nome: 'x'.repeat(81), email: 'n@exemplo.com' })).toEqual({ ok: false, motivo: 'nome' })
    for (const e of ['sem-arroba', 'a@b', 'a@@b.com', 'a b@exemplo.com', 'a@exemplo..com', '']) {
      expect(await resgatar(P_A, { email: e }), e).toEqual({ ok: false, motivo: 'email' })
    }
    for (const t of ['', '123', '(00) 99999-1234', '(84) 89999-1234', '(84) 9999-123', 'abc']) {
      expect(await resgatar(P_A, { telefone: t, email: 't@exemplo.com' }), t).toEqual({ ok: false, motivo: 'telefone' })
    }
  })

  it('campo isca preenchido (robô) é recusado', async () => {
    const r = await resgatar(P_A, { isca: 'http://spam.example', email: 'isca@exemplo.com' })
    expect(r.ok).toBe(false)
  })

  it('injeção em campo de texto vira dado, não comando', async () => {
    const r = await resgatar(P_B, { nome: "Robert'); drop table gostoso_club_vouchers;--", email: 'bobby@exemplo.com' })
    expect(r.ok).toBe(true)
    const t = await db.query(`select 1 from public.gostoso_club_vouchers limit 1`)
    expect(t.rows.length).toBe(1)
  })
})

describe('resgatar: parceiro e limites', () => {
  beforeEach(envelhecer)
  it('parceiro em combinação, de negócio rascunho ou vencido não emite cupom', async () => {
    expect(await resgatar(P_AGUARDA, { email: 'q1@exemplo.com' })).toEqual({ ok: false, motivo: 'indisponivel' })
    expect(await resgatar(P_C, { email: 'q2@exemplo.com' })).toEqual({ ok: false, motivo: 'indisponivel' })
    await db.exec(`update public.gostoso_club_partners set valido_ate = public.gostoso_club_hoje() - 1 where id = '${P_B}'`)
    expect(await resgatar(P_B, { email: 'q3@exemplo.com' })).toEqual({ ok: false, motivo: 'indisponivel' })
    await db.exec(`update public.gostoso_club_partners set valido_ate = null where id = '${P_B}'`)
    expect(await resgatar('00000000-0000-4000-8000-00000000dead', { email: 'q4@exemplo.com' })).toEqual({
      ok: false,
      motivo: 'indisponivel',
    })
  })

  it('um cupom ativo por e-mail por parceiro; depois de usado ou vencido, pode pedir outro', async () => {
    const r1 = await resgatar(P_A, { email: 'repete@exemplo.com' })
    expect(r1.ok).toBe(true)
    expect(await resgatar(P_A, { email: 'REPETE@exemplo.com' })).toEqual({ ok: false, motivo: 'ja_tem' })
    // em outro parceiro o mesmo e-mail pode
    expect((await resgatar(P_B, { email: 'repete@exemplo.com' })).ok).toBe(true)
    // vencido
    await db.exec(`update public.gostoso_club_vouchers set expira_em = public.gostoso_club_hoje() - 1 where token = '${r1.token}'`)
    const r2 = await resgatar(P_A, { email: 'repete@exemplo.com' })
    expect(r2.ok).toBe(true)
    // usado
    await db.exec(`update public.gostoso_club_vouchers set status = 'usado', usado_em = now() where token = '${r2.token}'`)
    expect((await resgatar(P_A, { email: 'repete@exemplo.com' })).ok).toBe(true)
  })

  it('o limite mensal fecha os resgates e a vantagem sai como esgotada', async () => {
    const antes = await db.query<{ n: number }>(
      `select count(*)::int as n from public.gostoso_club_vouchers where partner_id = '${P_B}'`,
    )
    const ja = antes.rows[0].n
    await db.exec(`update public.gostoso_club_partners set limite_mensal = ${ja + 2} where id = '${P_B}'`)
    expect((await resgatar(P_B, { email: 'lim1@exemplo.com' })).ok).toBe(true)
    expect((await resgatar(P_B, { email: 'lim2@exemplo.com' })).ok).toBe(true)
    expect(await resgatar(P_B, { email: 'lim3@exemplo.com' })).toEqual({ ok: false, motivo: 'esgotada' })
    const v = await como<{ esgotada: boolean }>(
      db,
      'anon',
      null,
      `select esgotada from public.gostoso_club_vantagens(array['${NEGOCIO_B}']::uuid[])`,
    )
    expect(v.rows[0].esgotada).toBe(true)
    await db.exec(`update public.gostoso_club_partners set limite_mensal = null where id = '${P_B}'`)
  })

  it('o mesmo aparelho tem teto de 3 resgates por dia, em qualquer parceiro', async () => {
    const ap = APARELHO(900)
    expect((await resgatar(P_A, { email: 'ap1@exemplo.com', aparelho: ap })).ok).toBe(true)
    expect((await resgatar(P_B, { email: 'ap2@exemplo.com', aparelho: ap })).ok).toBe(true)
    expect((await resgatar(P_A, { email: 'ap3@exemplo.com', aparelho: ap })).ok).toBe(true)
    expect(await resgatar(P_B, { email: 'ap4@exemplo.com', aparelho: ap })).toEqual({ ok: false, motivo: 'muitos' })
    // outro aparelho segue livre
    expect((await resgatar(P_B, { email: 'ap5@exemplo.com', aparelho: APARELHO(901) })).ok).toBe(true)
  })

  it('aparelho com formato inválido não vira identidade nem trava', async () => {
    expect((await resgatar(P_B, { email: 'fi1@exemplo.com', aparelho: 'x' })).ok).toBe(true)
    const [ultimo] = (await linhas(P_B)).slice(-1)
    expect(ultimo.aparelho).toBeNull()
  })

  it('mais de 20 resgates por minuto no mesmo parceiro é recusado', async () => {
    const antes = await db.query<{ n: number }>(
      `select count(*)::int as n from public.gostoso_club_vouchers where partner_id = '${P_B}' and created_at > now() - interval '1 minute'`,
    )
    let ultimo: Resp = { ok: true }
    for (let i = 0; i < 30 && ultimo.ok; i++) {
      ultimo = await resgatar(P_B, { email: `rajada${i}@exemplo.com`, aparelho: APARELHO(2000 + i) })
    }
    expect(ultimo).toEqual({ ok: false, motivo: 'muitos' })
    const depois = await db.query<{ n: number }>(
      `select count(*)::int as n from public.gostoso_club_vouchers where partner_id = '${P_B}' and created_at > now() - interval '1 minute'`,
    )
    expect(depois.rows[0].n).toBe(20)
    expect(antes.rows[0].n).toBeLessThan(20)
  })
})

describe('quem lê os dados pessoais', () => {
  it('o anônimo não lê a tabela, nem insere, altera ou apaga', async () => {
    await expect(como(db, 'anon', null, 'select * from public.gostoso_club_vouchers')).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'anon', null, `select email from public.gostoso_club_vouchers`),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'anon', null, `insert into public.gostoso_club_vouchers (partner_id) values ('${P_A}')`),
    ).rejects.toThrow()
    await expect(como(db, 'anon', null, `update public.gostoso_club_vouchers set status = 'usado'`)).rejects.toThrow()
    await expect(como(db, 'anon', null, `delete from public.gostoso_club_vouchers`)).rejects.toThrow()
    await expect(como(db, 'anon', null, 'select * from public.gostoso_club_resgates_mensais')).rejects.toThrow(/permission denied/i)
  })

  it('o dono lê só os resgates do próprio negócio, sem o token', async () => {
    const dono = await como<{ partner_id: string }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select partner_id, nome, email, telefone, codigo, status from public.gostoso_club_vouchers`,
    )
    expect(dono.rows.length).toBeGreaterThan(0)
    expect(new Set(dono.rows.map((l) => l.partner_id))).toEqual(new Set([P_A]))
    for (const coluna of ['token', 'aparelho', 'consentimento_texto']) {
      await expect(
        como(db, 'authenticated', IDS.usuarioDono, `select ${coluna} from public.gostoso_club_vouchers`),
      ).rejects.toThrow(/permission denied/i)
    }
    await expect(como(db, 'authenticated', IDS.usuarioDono, 'select * from public.gostoso_club_vouchers')).rejects.toThrow(
      /permission denied/i,
    )
  })

  it('outro dono não vê os resgates do primeiro, e o admin vê todos', async () => {
    const outro = await como<{ partner_id: string }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `select partner_id from public.gostoso_club_vouchers`,
    )
    expect(outro.rows.length).toBeGreaterThan(0)
    expect(new Set(outro.rows.map((l) => l.partner_id))).toEqual(new Set([P_B]))
    const admin = await como<{ partner_id: string }>(
      db,
      'authenticated',
      IDS.usuarioAdmin,
      `select distinct partner_id from public.gostoso_club_vouchers`,
    )
    expect(new Set(admin.rows.map((l) => l.partner_id))).toEqual(new Set([P_A, P_B]))
  })

  it('logado também não escreve direto na tabela', async () => {
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, `update public.gostoso_club_vouchers set status = 'usado'`),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, `delete from public.gostoso_club_vouchers`),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(
        db,
        'authenticated',
        IDS.usuarioDono,
        `insert into public.gostoso_club_vouchers (partner_id, business_id, codigo, nome, email, telefone, consentimento_versao, consentimento_texto, expira_em)
         values ('${P_A}', '${NEGOCIO_A}', 'AAAAAAAA', 'Falso', 'f@exemplo.com', '84999990000', '${VERSAO}', '${TEXTO}', public.gostoso_club_hoje())`,
      ),
    ).rejects.toThrow(/permission denied/i)
  })

  it('a view de resgates por mês respeita a RLS de quem consulta', async () => {
    const dono = await como<{ partner_id: string; resgates: number }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      'select partner_id, resgates from public.gostoso_club_resgates_mensais',
    )
    expect(dono.rows.map((l) => l.partner_id)).toEqual([P_A])
    expect(dono.rows[0].resgates).toBeGreaterThan(0)
  })

  it('a função antiga de uso (código do dia, sem cadastro) saiu do alcance do público', async () => {
    await expect(
      como(db, 'anon', null, `select public.gostoso_club_usar('${P_A}')`),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, `select public.gostoso_club_usar('${P_A}')`),
    ).rejects.toThrow(/permission denied/i)
  })
})

describe('verificar e cupom (por token)', () => {
  it('a verificação mostra o status, o primeiro nome e nenhum outro dado pessoal', async () => {
    const r = await resgatar(P_A, { email: 'verifica@exemplo.com', nome: 'Carla Menezes Lima' })
    const v = await como<{ v: Record<string, unknown> }>(
      db,
      'anon',
      null,
      `select public.gostoso_club_verificar('${r.token}') as v`,
    )
    expect(v.rows[0].v).toMatchObject({
      status: 'valido',
      primeiro_nome: 'Carla',
      negocio: 'Publicado',
      beneficio: '10% no primeiro passeio',
      codigo: r.codigo,
    })
    const texto = JSON.stringify(v.rows[0].v)
    for (const segredo of ['verifica@exemplo.com', 'Menezes', '84999991234', r.token!]) {
      expect(texto).not.toContain(segredo)
    }
  })

  it('token inexistente, curto ou com lixo é inválido', async () => {
    for (const t of ['0'.repeat(64), 'abc', '', 'zz'.repeat(32), "' or 1=1 --"]) {
      const v = await como<{ v: { status: string } }>(
        db,
        'anon',
        null,
        `select public.gostoso_club_verificar('${t.replace(/'/g, "''")}') as v`,
      )
      expect(v.rows[0].v.status, t).toBe('invalido')
    }
  })

  it('vencido aparece como expirado, usado como usado, e o cupom do titular traz o nome inteiro', async () => {
    const r = await resgatar(P_A, { email: 'estados@exemplo.com', nome: 'Dora Alves' })
    await db.exec(`update public.gostoso_club_vouchers set expira_em = public.gostoso_club_hoje() - 1 where token = '${r.token}'`)
    const exp = await como<{ v: { status: string } }>(db, 'anon', null, `select public.gostoso_club_verificar('${r.token}') as v`)
    expect(exp.rows[0].v.status).toBe('expirado')

    const r2 = await resgatar(P_A, { email: 'estados2@exemplo.com', nome: 'Eva Prado' })
    await db.exec(`update public.gostoso_club_vouchers set status = 'usado', usado_em = now() where token = '${r2.token}'`)
    const us = await como<{ v: { status: string; usado_em: string } }>(
      db,
      'anon',
      null,
      `select public.gostoso_club_verificar('${r2.token}') as v`,
    )
    expect(us.rows[0].v.status).toBe('usado')
    expect(us.rows[0].v.usado_em).toBeTruthy()

    const c = await como<{ c: Record<string, unknown> }>(db, 'anon', null, `select public.gostoso_club_cupom('${r2.token}') as c`)
    expect(c.rows[0].c).toMatchObject({ status: 'usado', nome: 'Eva Prado', codigo: r2.codigo })
    expect(JSON.stringify(c.rows[0].c)).not.toContain('estados2@exemplo.com')
    const nada = await como<{ c: { status: string } }>(db, 'anon', null, `select public.gostoso_club_cupom('${'0'.repeat(64)}') as c`)
    expect(nada.rows[0].c.status).toBe('invalido')
  })
})

describe('marcar como usado', () => {
  beforeEach(envelhecer)
  async function novoCupom(email: string, partner = P_A): Promise<Resp & { id: string }> {
    const r = await resgatar(partner, { email })
    const id = await db.query<{ id: string }>(`select id from public.gostoso_club_vouchers where token = '${r.token}'`)
    return { ...r, id: id.rows[0].id }
  }

  it('o dono marca pelo id, uma vez só; a verificação passa a mostrar usado', async () => {
    const c = await novoCupom('uso1@exemplo.com')
    const m1 = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_marcar_usado('${P_A}', '${c.id}') as r`,
    )
    expect(m1.rows[0].r.ok).toBe(true)
    const m2 = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_marcar_usado('${P_A}', '${c.id}') as r`,
    )
    expect(m2.rows[0].r).toMatchObject({ ok: false, motivo: 'ja_usado' })
    const v = await como<{ v: { status: string } }>(db, 'anon', null, `select public.gostoso_club_verificar('${c.token}') as v`)
    expect(v.rows[0].v.status).toBe('usado')
    const linha = (await db.query<{ usado_via: string }>(`select usado_via from public.gostoso_club_vouchers where id = '${c.id}'`)).rows[0]
    expect(linha.usado_via).toBe('painel')
  })

  it('o dono marca pelo código curto, com ou sem prefixo e em minúsculas', async () => {
    const c = await novoCupom('uso2@exemplo.com')
    const digitado = `gp-${c.codigo!.slice(0, 4)}-${c.codigo!.slice(4)}`.toLowerCase()
    const m = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_marcar_usado('${P_A}', null, '${digitado}') as r`,
    )
    expect(m.rows[0].r.ok).toBe(true)
    const linha = (await db.query<{ usado_via: string }>(`select usado_via from public.gostoso_club_vouchers where id = '${c.id}'`)).rows[0]
    expect(linha.usado_via).toBe('codigo')
  })

  it('código de outro parceiro, inexistente ou malformado não marca nada', async () => {
    const deB = await novoCupom('uso3@exemplo.com', P_B)
    const m = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_marcar_usado('${P_A}', null, '${deB.codigo}') as r`,
    )
    expect(m.rows[0].r).toMatchObject({ ok: false, motivo: 'nao_encontrado' })
    for (const lixo of ['', 'XXXX', 'GP-0000-0000', "' or 1=1 --"]) {
      const x = await como<{ r: Resp }>(
        db,
        'authenticated',
        IDS.usuarioDono,
        `select public.gostoso_club_marcar_usado('${P_A}', null, '${lixo.replace(/'/g, "''")}') as r`,
      )
      expect(x.rows[0].r.ok, lixo).toBe(false)
    }
    const intacto = await db.query<{ status: string }>(`select status from public.gostoso_club_vouchers where id = '${deB.id}'`)
    expect(intacto.rows[0].status).toBe('valido')
  })

  it('quem não é dono (ou é anônimo) não marca', async () => {
    const c = await novoCupom('uso4@exemplo.com')
    const m = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `select public.gostoso_club_marcar_usado('${P_A}', '${c.id}') as r`,
    )
    expect(m.rows[0].r).toMatchObject({ ok: false, motivo: 'sem_permissao' })
    await expect(
      como(db, 'anon', null, `select public.gostoso_club_marcar_usado('${P_A}', '${c.id}')`),
    ).rejects.toThrow(/permission denied/i)
    const linha = await db.query<{ status: string }>(`select status from public.gostoso_club_vouchers where id = '${c.id}'`)
    expect(linha.rows[0].status).toBe('valido')
  })

  it('o dono de B não usa cupom do parceiro A passando o id dele', async () => {
    const c = await novoCupom('uso5@exemplo.com')
    const m = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `select public.gostoso_club_marcar_usado('${P_B}', '${c.id}') as r`,
    )
    expect(m.rows[0].r).toMatchObject({ ok: false, motivo: 'nao_encontrado' })
  })

  it('cupom vencido não é marcado como usado', async () => {
    const c = await novoCupom('uso6@exemplo.com')
    await db.exec(`update public.gostoso_club_vouchers set expira_em = public.gostoso_club_hoje() - 1 where id = '${c.id}'`)
    const m = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_marcar_usado('${P_A}', '${c.id}') as r`,
    )
    expect(m.rows[0].r).toMatchObject({ ok: false, motivo: 'expirado' })
  })

  it('o admin também marca', async () => {
    const c = await novoCupom('uso7@exemplo.com')
    const m = await como<{ r: Resp }>(
      db,
      'authenticated',
      IDS.usuarioAdmin,
      `select public.gostoso_club_marcar_usado('${P_A}', '${c.id}') as r`,
    )
    expect(m.rows[0].r.ok).toBe(true)
  })
})

describe('painel e retenção', () => {
  beforeEach(envelhecer)
  it('o painel traz resgates, usados e ativos do mês, só para o dono', async () => {
    const dono = await como<{ p: Record<string, number> }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_painel('${P_A}') as p`,
    )
    const p = dono.rows[0].p
    expect(p.resgates_mes).toBeGreaterThan(3)
    expect(p.usados_mes).toBeGreaterThan(0)
    expect(p.ativos).toBeGreaterThan(0)
    expect(p.resgates_mes).toBeGreaterThanOrEqual(p.usados_mes)
    const estranho = await como<{ p: unknown }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `select public.gostoso_club_painel('${P_A}') as p`,
    )
    expect(estranho.rows[0].p).toBeNull()
  })

  it('a limpeza de dados antigos é só do serviço e apaga o que passou do prazo', async () => {
    await expect(como(db, 'anon', null, 'select public.gostoso_club_limpar_resgates(12)')).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioAdmin, 'select public.gostoso_club_limpar_resgates(12)'),
    ).rejects.toThrow(/permission denied/i)
    const r = await resgatar(P_B, { email: 'antigo@exemplo.com', aparelho: APARELHO(7000) })
    await db.exec(`update public.gostoso_club_vouchers set created_at = now() - interval '13 months' where token = '${r.token}'`)
    const recente = await resgatar(P_B, { email: 'recente@exemplo.com', aparelho: APARELHO(7001) })
    const n = await como<{ n: number }>(db, 'service_role', null, 'select public.gostoso_club_limpar_resgates(12) as n')
    expect(n.rows[0].n).toBe(1)
    const sobrou = await db.query(`select 1 from public.gostoso_club_vouchers where token in ('${r.token}', '${recente.token}')`)
    expect(sobrou.rows.length).toBe(1)
  })
})
