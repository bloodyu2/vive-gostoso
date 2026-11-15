import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* KAN-882: parceiro que so atende com hora marcada (Casa Surya). Roda as migracoes reais do Passaporte e a de
   agendamento num Postgres em memoria e confere: o dado da Casa Surya, o contato que cai no WhatsApp do negocio,
   o que o publico e o titular do cupom recebem, as constraints e quem pode ligar o aviso. */

const MIGRACOES = ['20261026120000_vg_clube_passaporte.sql', '20261028100000_vg_clube_resgate.sql']
const AGENDAMENTO = '20261114120000_vg_clube_agendamento.sql'
const CAT = '30000000-0000-4000-8000-000000000001'
const SURYA = '15238397-df9e-422c-858b-56a5ccb0ed10'
const NEGOCIO_A = IDS.negocioPublicado // dono: usuarioDono
const TOKEN = 'ab'.repeat(32)

let db: PGlite
const sql = (arquivo: string) => readFileSync(resolve(process.cwd(), 'supabase/migrations', arquivo), 'utf8')

type Linha = {
  slug: string
  regra: string | null
  requer_agendamento: boolean
  agendamento_contato: string | null
  agendamento_com: string | null
}

async function vantagem(slug: string) {
  const r = await como<Linha>(db, 'anon', null, 'select * from public.gostoso_club_vantagens()')
  return r.rows.find((l) => l.slug === slug)
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Saude e Bem-estar');
    insert into public.gostoso_businesses (id, name, slug, category_id, active, is_published, whatsapp) values
      ('${SURYA}', 'Casa Surya', 'casa-surya', '${CAT}', true, true, '5561981760790'),
      ('20000000-0000-4000-8000-0000000000e1', 'Escola de Kite', 'escola-de-kite', '${CAT}', true, true, '(84) 99999-1234'),
      ('20000000-0000-4000-8000-0000000000e2', 'Cafe Comum', 'cafe-comum', '${CAT}', true, true, '5584988887777');
  `)
  for (const m of MIGRACOES) await db.exec(sql(m))
  // a migracao do clube semeia os fundadores; o teste controla as linhas
  await db.exec(`
    delete from public.gostoso_club_partners;
    insert into public.gostoso_club_partners (business_id, tipo, beneficio, regra, limite_mensal, valido_ate, status) values
      ('${SURYA}', 'Yoga', '10% de desconto na primeira aula de yoga.',
       'Vale na primeira aula de yoga no Estúdio Casa Surya, até o fim do mês. Cinco primeiras aulas por mês.', 5, '2099-12-31', 'no_ar'),
      ('20000000-0000-4000-8000-0000000000e1', 'Kite', '10% na aula de kite.', null, null, null, 'no_ar'),
      ('20000000-0000-4000-8000-0000000000e2', 'Cafe', 'Um cafezinho.', null, null, null, 'no_ar');
  `)
  await db.exec(sql(AGENDAMENTO))
}, 60_000)

describe('Casa Surya depois da migracao', () => {
  it('exige agendamento com a Satya e usa o WhatsApp do negocio', async () => {
    const v = await vantagem('casa-surya')
    expect(v).toMatchObject({
      requer_agendamento: true,
      agendamento_com: 'Satya',
      agendamento_contato: '5561981760790',
      regra: 'Vale na primeira aula de yoga no Estúdio Casa Surya.',
    })
  })

  it('a validade e o limite de 5 por mes ficam como estavam', async () => {
    const r = await db.query<{ limite_mensal: number; valido_ate: string }>(
      `select limite_mensal, valido_ate::text as valido_ate from public.gostoso_club_partners where business_id = '${SURYA}'`,
    )
    expect(r.rows[0].limite_mensal).toBe(5)
    expect(r.rows[0].valido_ate).toBe('2099-12-31')
  })

  it('rodar a migracao de novo nao muda nada nem quebra', async () => {
    await db.exec(sql(AGENDAMENTO))
    const v = await vantagem('casa-surya')
    expect(v?.requer_agendamento).toBe(true)
    expect(v?.agendamento_com).toBe('Satya')
  })
})

describe('parceiro sem agendamento', () => {
  it('fica como antes: nao exige, sem contato e sem nome, mesmo com contato guardado', async () => {
    await db.exec(`update public.gostoso_club_partners set agendamento_contato = '5584911112222', agendamento_com = 'Fulano' where business_id = '20000000-0000-4000-8000-0000000000e2'`)
    const v = await vantagem('cafe-comum')
    expect(v).toMatchObject({ requer_agendamento: false, agendamento_contato: null, agendamento_com: null })
    await db.exec(`update public.gostoso_club_partners set agendamento_contato = null, agendamento_com = null where business_id = '20000000-0000-4000-8000-0000000000e2'`)
  })
})

describe('o campo serve a outros parceiros', () => {
  it('contato proprio ganha do WhatsApp do negocio; sem contato, o do negocio vem so com digitos', async () => {
    await db.exec(`update public.gostoso_club_partners set requer_agendamento = true where business_id = '20000000-0000-4000-8000-0000000000e1'`)
    let v = await vantagem('escola-de-kite')
    expect(v).toMatchObject({ requer_agendamento: true, agendamento_contato: '84999991234', agendamento_com: null })
    await db.exec(`update public.gostoso_club_partners set agendamento_contato = '5584977776666', agendamento_com = 'Instrutor Beto' where business_id = '20000000-0000-4000-8000-0000000000e1'`)
    v = await vantagem('escola-de-kite')
    expect(v).toMatchObject({ agendamento_contato: '5584977776666', agendamento_com: 'Instrutor Beto' })
  })

  it('recusa contato que nao sao so digitos e nome grande demais', async () => {
    await expect(
      db.exec(`update public.gostoso_club_partners set agendamento_contato = '(84) 9999' where business_id = '${SURYA}'`),
    ).rejects.toThrow()
    await expect(
      db.exec(`update public.gostoso_club_partners set agendamento_contato = '123' where business_id = '${SURYA}'`),
    ).rejects.toThrow()
    await expect(
      db.exec(`update public.gostoso_club_partners set agendamento_com = '${'x'.repeat(41)}' where business_id = '${SURYA}'`),
    ).rejects.toThrow()
  })
})

describe('cupom e verificacao', () => {
  beforeAll(async () => {
    const p = await db.query<{ id: string }>(`select id from public.gostoso_club_partners where business_id = '${SURYA}'`)
    await db.exec(`
      insert into public.gostoso_club_vouchers
        (partner_id, business_id, token, codigo, nome, email, telefone, consentimento_versao, consentimento_texto, expira_em)
      values ('${p.rows[0].id}', '${SURYA}', '${TOKEN}', 'ABCDEFGH', 'Ana Souza', 'ana@exemplo.test', '84988887777',
              '2026-10-28', 'Autorizo repassar meu nome, e-mail e telefone a Casa Surya para falar da vantagem.', '2099-12-31')
    `)
  })

  it('o cupom do titular traz o aviso, o contato e com quem agendar', async () => {
    const r = await como<{ c: Record<string, unknown> }>(db, 'anon', null, `select public.gostoso_club_cupom('${TOKEN}') as c`)
    expect(r.rows[0].c).toMatchObject({
      status: 'valido',
      negocio: 'Casa Surya',
      requer_agendamento: true,
      agendamento_contato: '5561981760790',
      agendamento_com: 'Satya',
    })
  })

  it('a verificacao do parceiro avisa do agendamento e nao vaza contato do titular', async () => {
    const r = await como<{ c: Record<string, unknown> }>(db, 'anon', null, `select public.gostoso_club_verificar('${TOKEN}') as c`)
    expect(r.rows[0].c).toMatchObject({ requer_agendamento: true, agendamento_com: 'Satya', primeiro_nome: 'Ana' })
    const texto = JSON.stringify(r.rows[0].c)
    expect(texto).not.toContain('ana@exemplo.test')
    expect(texto).not.toContain('84988887777')
  })
})

describe('quem liga o aviso', () => {
  it('o dono do negocio liga e desliga pela API', async () => {
    await db.exec(`
      insert into public.gostoso_club_partners (business_id, beneficio, status) values ('${NEGOCIO_A}', 'Brinde do dono', 'no_ar')
    `)
    const antes = await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_club_partners set requer_agendamento = true, agendamento_com = 'Dona Maria' where business_id = '${NEGOCIO_A}' returning id`,
    )
    expect(antes.rows).toHaveLength(1)
    const r = await db.query<{ requer_agendamento: boolean; agendamento_com: string }>(
      `select requer_agendamento, agendamento_com from public.gostoso_club_partners where business_id = '${NEGOCIO_A}'`,
    )
    expect(r.rows[0]).toEqual({ requer_agendamento: true, agendamento_com: 'Dona Maria' })
  })

  it('outro dono nao mexe no negocio alheio', async () => {
    const r = await como(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `update public.gostoso_club_partners set requer_agendamento = false where business_id = '${NEGOCIO_A}' returning id`,
    )
    expect(r.rows).toHaveLength(0)
  })

  it('o publico nao liga o aviso de ninguem', async () => {
    await expect(
      como(db, 'anon', null, `update public.gostoso_club_partners set requer_agendamento = false where business_id = '${NEGOCIO_A}'`),
    ).rejects.toThrow()
  })
})
