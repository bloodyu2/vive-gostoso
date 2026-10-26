import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* Roda a migracao REAL do Passaporte Gostoso num Postgres em memoria com os tres
   papeis do Supabase e confere: quem le o que, quem escreve o que, o codigo do dia,
   o teto de uso e o painel do dono. */

const MIGRACAO = '20261026120000_vg_clube_passaporte.sql'

const CAT = '30000000-0000-4000-8000-000000000001'
const EXPEDICOES = '20000000-0000-4000-8000-0000000000e1'
const PARCEL = '20000000-0000-4000-8000-0000000000e2'
const REDUTO = '20000000-0000-4000-8000-0000000000e3'
const OUTRO_NEGOCIO = '20000000-0000-4000-8000-0000000000e4'

let db: PGlite
let pExpedicoes: string
let pParcel: string
let pReduto: string

async function parceiro(negocio: string): Promise<string> {
  const r = await db.query<{ id: string }>(
    `select id from public.gostoso_club_partners where business_id = '${negocio}'`,
  )
  return r.rows[0].id
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Passeios');
    insert into public.gostoso_businesses (id, name, slug, profile_id, category_id, active, is_published) values
      ('${EXPEDICOES}', 'Gostoso Expedições', 'gostoso-expedicoes', null, '${CAT}', true, true),
      ('${PARCEL}', 'Pousada Parcel do Gostoso', 'pousada-parcel-do-gostoso', '${IDS.perfilOutro}', '${CAT}', true, true),
      ('${REDUTO}', 'Casa Reduto', 'casa-reduto-artesanato', null, '${CAT}', true, true),
      ('${OUTRO_NEGOCIO}', 'Outro', 'outro-negocio', '${IDS.perfilOutro}', '${CAT}', true, true);
  `)
  await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', MIGRACAO), 'utf8'))
  pExpedicoes = await parceiro(EXPEDICOES)
  pParcel = await parceiro(PARCEL)
  pReduto = await parceiro(REDUTO)
}, 60_000)

describe('parceiros fundadores', () => {
  it('Gostoso Expedições entra no ar e os outros dois em combinação', async () => {
    const r = await db.query<{ slug: string; status: string }>(
      `select b.slug, cp.status from public.gostoso_club_partners cp
         join public.gostoso_businesses b on b.id = cp.business_id order by b.slug`,
    )
    expect(r.rows).toEqual([
      { slug: 'casa-reduto-artesanato', status: 'em_combinacao' },
      { slug: 'gostoso-expedicoes', status: 'no_ar' },
      { slug: 'pousada-parcel-do-gostoso', status: 'em_combinacao' },
    ])
  })

  it('o texto público não tem colchetes nem travessão longo', async () => {
    const r = await db.query<{ beneficio: string; regra: string | null }>(
      'select beneficio, regra from public.gostoso_club_partners',
    )
    for (const linha of r.rows) {
      expect(`${linha.beneficio} ${linha.regra ?? ''}`).not.toMatch(/[[\]—]/)
    }
  })
})

describe('leitura', () => {
  it('o anônimo lê as vantagens no ar e em combinação', async () => {
    const r = await como(db, 'anon', null, 'select id from public.gostoso_club_partners')
    expect(r.rows).toHaveLength(3)
  })

  it('o anônimo não lê usos, vistas, semente nem visitas', async () => {
    for (const tabela of [
      'gostoso_club_redemptions',
      'gostoso_club_views',
      'gostoso_club_segredo',
      'gostoso_plaquinha_visitas',
    ]) {
      await expect(como(db, 'anon', null, `select * from public.${tabela}`)).rejects.toThrow(/permission denied/i)
    }
  })

  it('o logado também não lê a semente do código nem as visitas', async () => {
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select valor from public.gostoso_club_segredo'),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select * from public.gostoso_plaquinha_visitas'),
    ).rejects.toThrow(/permission denied/i)
  })

  it('o anônimo não executa o gerador do código do dia', async () => {
    await expect(como(db, 'anon', null, `select public.gostoso_club_codigo_do_dia('${pExpedicoes}')`)).rejects.toThrow(
      /permission denied/i,
    )
  })
})

describe('escrita da vantagem', () => {
  it('o anônimo não insere, altera nem apaga', async () => {
    await expect(
      como(db, 'anon', null, `insert into public.gostoso_club_partners (business_id, beneficio) values ('${REDUTO}', 'x1x')`),
    ).rejects.toThrow()
    await expect(como(db, 'anon', null, `update public.gostoso_club_partners set beneficio = 'hackeado'`)).rejects.toThrow()
    await expect(como(db, 'anon', null, 'delete from public.gostoso_club_partners')).rejects.toThrow()
  })

  it('o dono não apaga a própria vantagem (apagar levaria o histórico de usos), só pausa', async () => {
    await expect(
      como(db, 'authenticated', IDS.usuarioOutro, `delete from public.gostoso_club_partners where id = '${pParcel}'`),
    ).rejects.toThrow(/permission denied/i)
    const v = await db.query(`select 1 from public.gostoso_club_partners where id = '${pParcel}'`)
    expect(v.rows).toHaveLength(1)
  })

  it('o dono do negócio liga a própria vantagem na hora', async () => {
    const r = await como(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `update public.gostoso_club_partners
          set beneficio = 'Late check-out até 14h', limite_mensal = 5, status = 'no_ar'
        where id = '${pParcel}'`,
    )
    expect(r.affectedRows).toBe(1)
    const v = await db.query<{ status: string; beneficio: string }>(
      `select status, beneficio from public.gostoso_club_partners where id = '${pParcel}'`,
    )
    expect(v.rows[0]).toEqual({ status: 'no_ar', beneficio: 'Late check-out até 14h' })
  })

  it('quem não é dono não altera a vantagem de outro negócio', async () => {
    const r = await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_club_partners set beneficio = 'invasao' where id = '${pParcel}'`,
    )
    expect(r.affectedRows ?? 0).toBe(0)
  })

  it('o dono não coloca a vantagem em combinação, nem muda o rótulo do card', async () => {
    await expect(
      como(
        db,
        'authenticated',
        IDS.usuarioOutro,
        `update public.gostoso_club_partners set status = 'em_combinacao' where id = '${pParcel}'`,
      ),
    ).rejects.toThrow(/row-level security/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioOutro, `update public.gostoso_club_partners set tipo = 'Outro' where id = '${pParcel}'`),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(
        db,
        'authenticated',
        IDS.usuarioOutro,
        `update public.gostoso_club_partners set business_id = '${EXPEDICOES}' where id = '${pParcel}'`,
      ),
    ).rejects.toThrow(/permission denied/i)
  })

  it('o dono entra no Passaporte com o próprio negócio, e só com o próprio', async () => {
    const ok = await como(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `insert into public.gostoso_club_partners (business_id, beneficio, status)
       values ('${OUTRO_NEGOCIO}', 'Sobremesa de cortesia', 'no_ar')`,
    )
    expect(ok.affectedRows).toBe(1)
    await expect(
      como(
        db,
        'authenticated',
        IDS.usuarioDono,
        `insert into public.gostoso_club_partners (business_id, beneficio, status)
         values ('${REDUTO}', 'invasao', 'no_ar')`,
      ),
    ).rejects.toThrow()
  })

  it('beneficio vazio ou longo demais é recusado', async () => {
    await expect(
      como(db, 'authenticated', IDS.usuarioOutro, `update public.gostoso_club_partners set beneficio = 'a' where id = '${pParcel}'`),
    ).rejects.toThrow()
    await expect(
      como(
        db,
        'authenticated',
        IDS.usuarioOutro,
        `update public.gostoso_club_partners set beneficio = '${'x'.repeat(141)}' where id = '${pParcel}'`,
      ),
    ).rejects.toThrow()
  })
})

describe('código do dia', () => {
  it('tem o formato GOSTOSO-NNNN', async () => {
    const r = await como<{ c: string }>(
      db,
      'service_role',
      null,
      `select public.gostoso_club_codigo_do_dia('${pExpedicoes}') as c`,
    )
    expect(r.rows[0].c).toMatch(/^GOSTOSO-\d{4}$/)
  })

  it('é o mesmo no mesmo dia e muda de um dia para o outro', async () => {
    const dias = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29']
    const codigos: string[] = []
    for (const dia of dias) {
      const a = await como<{ c: string }>(db, 'service_role', null, `select public.gostoso_club_codigo_do_dia('${pExpedicoes}', '${dia}') as c`)
      const b = await como<{ c: string }>(db, 'service_role', null, `select public.gostoso_club_codigo_do_dia('${pExpedicoes}', '${dia}') as c`)
      expect(a.rows[0].c).toBe(b.rows[0].c)
      codigos.push(a.rows[0].c)
    }
    expect(new Set(codigos).size).toBe(dias.length)
  })

  it('é próprio de cada parceiro: o código de um balcão não vale no outro', async () => {
    const dias = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']
    let diferentes = 0
    for (const dia of dias) {
      const a = await como<{ c: string }>(db, 'service_role', null, `select public.gostoso_club_codigo_do_dia('${pExpedicoes}', '${dia}') as c`)
      const b = await como<{ c: string }>(db, 'service_role', null, `select public.gostoso_club_codigo_do_dia('${pParcel}', '${dia}') as c`)
      if (a.rows[0].c !== b.rows[0].c) diferentes++
    }
    expect(diferentes).toBeGreaterThanOrEqual(4)
  })
})

describe('usar', () => {
  it('cada uso grava uma linha e devolve o código do dia', async () => {
    const antes = await db.query<{ n: number }>('select count(*)::int as n from public.gostoso_club_redemptions')
    const r = await como<{ r: { ok: boolean; codigo: string } }>(
      db,
      'anon',
      null,
      `select public.gostoso_club_usar('${pExpedicoes}', '07') as r`,
    )
    expect(r.rows[0].r.ok).toBe(true)
    expect(r.rows[0].r.codigo).toMatch(/^GOSTOSO-\d{4}$/)
    const depois = await db.query<{ n: number; codigo: string; origem: string; business_id: string }>(
      `select count(*) over ()::int as n, codigo, origem, business_id
         from public.gostoso_club_redemptions order by created_at desc limit 1`,
    )
    expect(depois.rows[0].n).toBe(antes.rows[0].n + 1)
    expect(depois.rows[0].codigo).toBe(r.rows[0].r.codigo)
    expect(depois.rows[0].origem).toBe('07')
    expect(depois.rows[0].business_id).toBe(EXPEDICOES)
  })

  it('o mesmo aparelho no mesmo parceiro no mesmo dia recebe o mesmo código e não gera linha nova', async () => {
    const aparelho = '7c1f3c1e-5b53-4c53-8d0e-3d2f6f0a9a11'
    const outro = '9a2e4d6f-1b3c-4a5d-8e7f-0c1d2e3f4a5b'
    const contar = async () =>
      (await db.query<{ n: number }>(
        `select count(*)::int as n from public.gostoso_club_redemptions where partner_id = '${pExpedicoes}'`,
      )).rows[0].n
    const antes = await contar()
    const a = await como<{ r: { ok: boolean; codigo: string; repetido?: boolean } }>(
      db, 'anon', null, `select public.gostoso_club_usar('${pExpedicoes}', null, '${aparelho}') as r`)
    const b = await como<{ r: { ok: boolean; codigo: string; repetido?: boolean } }>(
      db, 'anon', null, `select public.gostoso_club_usar('${pExpedicoes}', null, '${aparelho}') as r`)
    expect(a.rows[0].r.ok).toBe(true)
    expect(a.rows[0].r.repetido).toBeUndefined()
    expect(b.rows[0].r.codigo).toBe(a.rows[0].r.codigo)
    expect(b.rows[0].r.repetido).toBe(true)
    expect(await contar()).toBe(antes + 1)
    // outro aparelho é outro uso
    await como(db, 'anon', null, `select public.gostoso_club_usar('${pExpedicoes}', null, '${outro}')`)
    expect(await contar()).toBe(antes + 2)
  })

  it('aparelho com formato inválido não vira identidade: cada toque conta', async () => {
    const contar = async () =>
      (await db.query<{ n: number }>(
        `select count(*)::int as n from public.gostoso_club_redemptions where partner_id = '${pExpedicoes}'`,
      )).rows[0].n
    const antes = await contar()
    await como(db, 'anon', null, `select public.gostoso_club_usar('${pExpedicoes}', null, 'x') as r`)
    await como(db, 'anon', null, `select public.gostoso_club_usar('${pExpedicoes}', null, 'x') as r`)
    expect(await contar()).toBe(antes + 2)
  })

  it('origem inválida não grava lixo', async () => {
    await como(db, 'anon', null, `select public.gostoso_club_usar('${pExpedicoes}', 'abc; drop') as r`)
    const r = await db.query<{ origem: string | null }>(
      'select origem from public.gostoso_club_redemptions order by created_at desc, id limit 1',
    )
    expect(r.rows[0].origem).toBeNull()
  })

  it('parceiro em combinação não tem uso', async () => {
    const antes = await db.query<{ n: number }>('select count(*)::int as n from public.gostoso_club_redemptions')
    const r = await como<{ r: { ok: boolean; motivo: string } }>(
      db,
      'anon',
      null,
      `select public.gostoso_club_usar('${pReduto}') as r`,
    )
    expect(r.rows[0].r).toEqual({ ok: false, motivo: 'indisponivel' })
    const depois = await db.query<{ n: number }>('select count(*)::int as n from public.gostoso_club_redemptions')
    expect(depois.rows[0].n).toBe(antes.rows[0].n)
  })

  it('parceiro inexistente não tem uso', async () => {
    const r = await como<{ r: { ok: boolean } }>(
      db,
      'anon',
      null,
      `select public.gostoso_club_usar('00000000-0000-4000-8000-00000000dead') as r`,
    )
    expect(r.rows[0].r.ok).toBe(false)
  })

  it('o limite mensal fecha o uso, e o card sai marcado como esgotado', async () => {
    // Parcel: limite 5, ligado pelo dono no teste de escrita.
    for (let i = 0; i < 5; i++) {
      const r = await como<{ r: { ok: boolean; restantes: number } }>(
        db,
        'anon',
        null,
        `select public.gostoso_club_usar('${pParcel}') as r`,
      )
      expect(r.rows[0].r.ok).toBe(true)
      expect(r.rows[0].r.restantes).toBe(4 - i)
    }
    const barrado = await como<{ r: { ok: boolean; motivo: string } }>(
      db,
      'anon',
      null,
      `select public.gostoso_club_usar('${pParcel}') as r`,
    )
    expect(barrado.rows[0].r).toEqual({ ok: false, motivo: 'esgotada' })
    const linhas = await db.query<{ n: number }>(
      `select count(*)::int as n from public.gostoso_club_redemptions where partner_id = '${pParcel}'`,
    )
    expect(linhas.rows[0].n).toBe(5)
    const lista = await como<{ esgotada: boolean }>(
      db,
      'anon',
      null,
      `select esgotada from public.gostoso_club_vantagens(array['${PARCEL}']::uuid[])`,
    )
    expect(lista.rows[0].esgotada).toBe(true)
  })

  it('mais de 20 usos em um minuto no mesmo parceiro é recusado', async () => {
    let ultimo: { ok: boolean; motivo?: string } = { ok: true }
    for (let i = 0; i < 25; i++) {
      const r = await como<{ r: { ok: boolean; motivo?: string } }>(
        db,
        'anon',
        null,
        `select public.gostoso_club_usar('${pExpedicoes}') as r`,
      )
      ultimo = r.rows[0].r
      if (!ultimo.ok) break
    }
    expect(ultimo).toEqual({ ok: false, motivo: 'muitos' })
    const r = await db.query<{ n: number }>(
      `select count(*)::int as n from public.gostoso_club_redemptions
        where partner_id = '${pExpedicoes}' and created_at > now() - interval '1 minute'`,
    )
    expect(r.rows[0].n).toBe(20)
  })

  it('ninguém escreve em usos direto, só pela função', async () => {
    await expect(
      como(
        db,
        'anon',
        null,
        `insert into public.gostoso_club_redemptions (partner_id, business_id, codigo) values ('${pExpedicoes}', '${EXPEDICOES}', 'GOSTOSO-0000')`,
      ),
    ).rejects.toThrow()
    await expect(
      como(
        db,
        'authenticated',
        IDS.usuarioOutro,
        `insert into public.gostoso_club_redemptions (partner_id, business_id, codigo) values ('${pParcel}', '${PARCEL}', 'GOSTOSO-0000')`,
      ),
    ).rejects.toThrow()
  })
})

describe('vantagens para o público', () => {
  it('lista no ar primeiro, depois em combinação, com o rótulo do card', async () => {
    const r = await como<{ nome: string; status: string; tipo: string }>(
      db,
      'anon',
      null,
      'select nome, status, tipo from public.gostoso_club_vantagens()',
    )
    const nomes = r.rows.map((l) => l.nome)
    expect(nomes.indexOf('Gostoso Expedições')).toBeLessThan(nomes.indexOf('Casa Reduto'))
    expect(r.rows.find((l) => l.nome === 'Gostoso Expedições')?.tipo).toBe('Passeios')
    expect(r.rows.find((l) => l.nome === 'Casa Reduto')?.status).toBe('em_combinacao')
  })

  it('não mostra vantagem pausada, vencida ou de negócio despublicado', async () => {
    await db.exec(`
      update public.gostoso_club_partners set status = 'pausado' where id = '${pParcel}';
      update public.gostoso_club_partners set valido_ate = '2020-01-01' where id = '${pReduto}';
    `)
    let r = await como<{ nome: string }>(db, 'anon', null, 'select nome from public.gostoso_club_vantagens()')
    expect(r.rows.map((l) => l.nome)).not.toContain('Pousada Parcel do Gostoso')
    expect(r.rows.map((l) => l.nome)).not.toContain('Casa Reduto')
    await db.exec(`update public.gostoso_businesses set is_published = false where id = '${EXPEDICOES}'`)
    r = await como<{ nome: string }>(db, 'anon', null, 'select nome from public.gostoso_club_vantagens()')
    expect(r.rows.map((l) => l.nome)).not.toContain('Gostoso Expedições')
    await db.exec(`
      update public.gostoso_businesses set is_published = true where id = '${EXPEDICOES}';
      update public.gostoso_club_partners set status = 'no_ar' where id = '${pParcel}';
      update public.gostoso_club_partners set valido_ate = null where id = '${pReduto}';
    `)
  })

  it('não devolve contagem de uso ao público', async () => {
    const r = await como(db, 'anon', null, 'select * from public.gostoso_club_vantagens() limit 1')
    expect(Object.keys(r.rows[0] ?? {})).not.toContain('usos_mes')
  })
})

describe('vistas', () => {
  it('conta por dia e soma a cada chamada', async () => {
    await como(db, 'anon', null, `select public.gostoso_club_registrar_vistas(array['${pExpedicoes}','${pReduto}']::uuid[])`)
    await como(db, 'anon', null, `select public.gostoso_club_registrar_vistas(array['${pExpedicoes}']::uuid[])`)
    const r = await db.query<{ partner_id: string; n: number }>(
      'select partner_id, n from public.gostoso_club_views order by n desc',
    )
    expect(r.rows.find((l) => l.partner_id === pExpedicoes)?.n).toBe(2)
    expect(r.rows.find((l) => l.partner_id === pReduto)?.n).toBe(1)
  })

  it('id que não existe ou parceiro pausado não vira linha', async () => {
    await db.exec(`update public.gostoso_club_partners set status = 'pausado' where id = '${pParcel}'`)
    await como(
      db,
      'anon',
      null,
      `select public.gostoso_club_registrar_vistas(array['${pParcel}','00000000-0000-4000-8000-00000000dead']::uuid[])`,
    )
    const r = await db.query(`select 1 from public.gostoso_club_views where partner_id = '${pParcel}'`)
    expect(r.rows).toHaveLength(0)
    await db.exec(`update public.gostoso_club_partners set status = 'no_ar' where id = '${pParcel}'`)
  })

  it('o dono lê as vistas do próprio negócio e de mais ninguém', async () => {
    await como(db, 'anon', null, `select public.gostoso_club_registrar_vistas(array['${pParcel}']::uuid[])`)
    const dono = await como(db, 'authenticated', IDS.usuarioOutro, 'select partner_id from public.gostoso_club_views')
    expect(dono.rows.map((l) => (l as { partner_id: string }).partner_id)).toEqual([pParcel])
    const estranho = await como(db, 'authenticated', IDS.usuarioDono, 'select partner_id from public.gostoso_club_views')
    expect(estranho.rows).toHaveLength(0)
  })
})

describe('painel do parceiro', () => {
  type Painel = {
    codigo_hoje: string
    usos_mes: number
    vistas_mes: number
    dias_de_pico: number[]
    usos: { criado_em: string; codigo: string }[]
  }

  it('o dono recebe usos do mês, vistas, dias de pico, usos recentes e o código de hoje', async () => {
    const r = await como<{ p: Painel }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      `select public.gostoso_club_painel('${pParcel}') as p`,
    )
    const p = r.rows[0].p
    expect(p.usos_mes).toBe(5)
    // Uma vista gravada para a Parcel (a chamada com ela pausada não conta).
    expect(p.vistas_mes).toBe(1)
    expect(p.usos).toHaveLength(5)
    expect(p.usos[0].codigo).toBe(p.codigo_hoje)
    expect(p.codigo_hoje).toMatch(/^GOSTOSO-\d{4}$/)
    expect(p.dias_de_pico.length).toBeGreaterThan(0)
    expect(p.dias_de_pico.length).toBeLessThanOrEqual(2)
  })

  it('quem não é dono recebe null, e o anônimo nem executa', async () => {
    const r = await como<{ p: Painel | null }>(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select public.gostoso_club_painel('${pParcel}') as p`,
    )
    expect(r.rows[0].p).toBeNull()
    await expect(como(db, 'anon', null, `select public.gostoso_club_painel('${pParcel}')`)).rejects.toThrow(
      /permission denied/i,
    )
  })

  it('o admin vê o painel de qualquer parceiro', async () => {
    const r = await como<{ p: Painel | null }>(
      db,
      'authenticated',
      IDS.usuarioAdmin,
      `select public.gostoso_club_painel('${pParcel}') as p`,
    )
    expect(r.rows[0].p?.usos_mes).toBe(5)
  })
})

describe('usos por mês', () => {
  it('cada dono vê só os próprios números', async () => {
    const dono = await como<{ partner_id: string; usos: number }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      'select partner_id, usos from public.gostoso_club_usos_mensais',
    )
    expect(dono.rows.map((l) => l.partner_id)).toEqual([pParcel])
    expect(dono.rows[0].usos).toBe(5)
    const estranho = await como(db, 'authenticated', IDS.usuarioDono, 'select * from public.gostoso_club_usos_mensais')
    expect(estranho.rows).toHaveLength(0)
    await expect(como(db, 'anon', null, 'select * from public.gostoso_club_usos_mensais')).rejects.toThrow(
      /permission denied/i,
    )
  })
})

describe('visita à plaquinha', () => {
  it('conta por código e por dia, e ignora código inválido', async () => {
    await como(db, 'anon', null, `select public.gostoso_club_registrar_visita_plaquinha('03')`)
    await como(db, 'anon', null, `select public.gostoso_club_registrar_visita_plaquinha('03')`)
    await como(db, 'anon', null, `select public.gostoso_club_registrar_visita_plaquinha('x1')`)
    await como(db, 'anon', null, `select public.gostoso_club_registrar_visita_plaquinha('123')`)
    const r = await db.query<{ codigo: string; n: number }>('select codigo, n from public.gostoso_plaquinha_visitas')
    expect(r.rows).toEqual([{ codigo: '03', n: 2 }])
  })
})
