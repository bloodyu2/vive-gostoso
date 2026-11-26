import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* KAN-998: marca de periodo invalido das vistas por parceiro. Roda as migrations reais do
   Passaporte num Postgres em memoria, grava um historico igual ao de producao (todos os
   parceiros com o mesmo n por dia), aplica a migration nova e confere: o historico fica
   intacto, o periodo antigo fica marcado, a view de relatorio so devolve dias validos e o
   painel do parceiro nao mostra numero do periodo invalido. */

const ANTERIORES = ['20261026120000_vg_clube_passaporte.sql', '20261028100000_vg_clube_resgate.sql']
const NOVA = '20261126120000_vg_clube_vistas_validas.sql'

const CAT = '30000000-0000-4000-8000-000000000001'
const EXPEDICOES = '20000000-0000-4000-8000-0000000000e1'
const PARCEL = '20000000-0000-4000-8000-0000000000e2'
const REDUTO = '20000000-0000-4000-8000-0000000000e3'

let db: PGlite
let pExpedicoes: string
let pParcel: string
let pReduto: string
let assinaturaAntes: string

const sqlNova = () => readFileSync(resolve(process.cwd(), 'supabase/migrations', NOVA), 'utf8')

async function parceiro(negocio: string): Promise<string> {
  const r = await db.query<{ id: string }>(`select id from public.gostoso_club_partners where business_id = '${negocio}'`)
  return r.rows[0].id
}

async function assinaturaDoHistorico(): Promise<string> {
  const r = await db.query<{ a: string }>(
    `select md5(coalesce(string_agg(partner_id::text || '|' || dia::text || '|' || n::text, ';' order by partner_id, dia), '')) as a
       from public.gostoso_club_views`,
  )
  return r.rows[0].a
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
      ('${REDUTO}', 'Casa Reduto', 'casa-reduto-artesanato', null, '${CAT}', true, true);
  `)
  for (const arquivo of ANTERIORES) {
    await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', arquivo), 'utf8'))
  }
  pExpedicoes = await parceiro(EXPEDICOES)
  pParcel = await parceiro(PARCEL)
  pReduto = await parceiro(REDUTO)

  // Historico como o de producao: todo parceiro com o MESMO n em cada dia, de 26/10 ate hoje.
  await db.exec(`
    insert into public.gostoso_club_views (partner_id, dia, n)
    select cp.id, d::date, 40 + (extract(day from d)::int % 7)
      from public.gostoso_club_partners cp,
           generate_series(date '2026-10-26', public.gostoso_club_hoje(), interval '1 day') d;
  `)
  assinaturaAntes = await assinaturaDoHistorico()
  await db.exec(sqlNova())
}, 60_000)

describe('marca do periodo invalido', () => {
  it('registra 26/10 ate o dia da migration, com motivo e ticket', async () => {
    const r = await db.query<{ de: string; ate: string; hoje: string; motivo: string; ticket: string }>(
      `select de::text, ate::text, public.gostoso_club_hoje()::text as hoje, motivo, ticket
         from public.gostoso_club_views_invalidos`,
    )
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0].de).toBe('2026-10-26')
    expect(r.rows[0].ate).toBe(r.rows[0].hoje)
    expect(r.rows[0].ticket).toBe('KAN-998')
    expect(r.rows[0].motivo).toMatch(/mesmo n/)
  })

  it('nao altera nenhuma linha do historico', async () => {
    expect(await assinaturaDoHistorico()).toBe(assinaturaAntes)
    const r = await db.query<{ n: number }>('select count(*)::int as n from public.gostoso_club_views')
    expect(r.rows[0].n).toBeGreaterThan(3)
  })

  it('rodar de novo nao duplica a marca nem muda o historico', async () => {
    await db.exec(sqlNova())
    const r = await db.query<{ n: number }>('select count(*)::int as n from public.gostoso_club_views_invalidos')
    expect(r.rows[0].n).toBe(1)
    expect(await assinaturaDoHistorico()).toBe(assinaturaAntes)
  })

  it('o primeiro dia valido e o dia seguinte ao fim do periodo', async () => {
    const r = await db.query<{ valido: string; esperado: string }>(
      `select public.gostoso_club_vistas_validas_desde()::text as valido,
              (public.gostoso_club_hoje() + 1)::text as esperado`,
    )
    expect(r.rows[0].valido).toBe(r.rows[0].esperado)
  })

  it('a tabela de marcas e fechada para anon e authenticated', async () => {
    await expect(como(db, 'anon', null, 'select * from public.gostoso_club_views_invalidos')).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioOutro, 'select * from public.gostoso_club_views_invalidos'),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioAdmin, `insert into public.gostoso_club_views_invalidos (de, ate, motivo) values ('2026-01-01','2026-01-02','x')`),
    ).rejects.toThrow(/permission denied/i)
    const servico = await como(db, 'service_role', null, 'select count(*)::int as n from public.gostoso_club_views_invalidos')
    expect(servico.rows).toHaveLength(1)
  })

  it('a funcao do primeiro dia valido nao e do anonimo', async () => {
    await expect(como(db, 'anon', null, 'select public.gostoso_club_vistas_validas_desde()')).rejects.toThrow(/permission denied/i)
    const dono = await como(db, 'authenticated', IDS.usuarioOutro, 'select public.gostoso_club_vistas_validas_desde()::text as d')
    expect(dono.rows).toHaveLength(1)
  })

  it('a tabela de vistas leva o aviso no comentario', async () => {
    const r = await db.query<{ c: string }>(`select obj_description('public.gostoso_club_views'::regclass) as c`)
    expect(r.rows[0].c).toMatch(/KAN-998/)
    expect(r.rows[0].c).toMatch(/gostoso_club_views_validas/)
  })
})

describe('view so com dias validos', () => {
  it('nao devolve nenhuma linha do periodo marcado', async () => {
    const r = await como(db, 'service_role', null, 'select * from public.gostoso_club_views_validas')
    expect(r.rows).toHaveLength(0)
  })

  it('devolve o dia valido, e o dono ve so o proprio parceiro', async () => {
    await db.exec(`
      insert into public.gostoso_club_views (partner_id, dia, n) values
        ('${pParcel}', public.gostoso_club_hoje() + 1, 3),
        ('${pReduto}', public.gostoso_club_hoje() + 1, 9)
    `)
    const servico = await como<{ n: number }>(db, 'service_role', null, 'select n from public.gostoso_club_views_validas order by n')
    expect(servico.rows.map((l) => l.n)).toEqual([3, 9])
    const dono = await como<{ partner_id: string; n: number }>(
      db,
      'authenticated',
      IDS.usuarioOutro,
      'select partner_id, n from public.gostoso_club_views_validas',
    )
    expect(dono.rows).toEqual([{ partner_id: pParcel, n: 3 }])
    await expect(como(db, 'anon', null, 'select * from public.gostoso_club_views_validas')).rejects.toThrow(/permission denied/i)
    await db.exec(`delete from public.gostoso_club_views where dia > public.gostoso_club_hoje()`)
  })
})

describe('painel do parceiro', () => {
  type Painel = {
    vistas_mes: number | null
    vistas_validas_desde: string
    resgates_mes: number
    usados_mes: number
    ativos: number
    usos_mes: number
    dias_de_pico: number[]
    usos: unknown[]
    codigo_hoje: string
  }
  const painel = (usuario: string, parceiroId: string) =>
    como<{ p: Painel | null }>(db, 'authenticated', usuario, `select public.gostoso_club_painel('${parceiroId}') as p`)

  it('o mes que ainda tem dia sem contagem valida mostra null, nao o numero repetido', async () => {
    const r = await painel(IDS.usuarioOutro, pParcel)
    expect(r.rows[0].p?.vistas_mes).toBeNull()
  })

  it('devolve o primeiro dia valido e mantem as outras chaves do painel', async () => {
    const p = (await painel(IDS.usuarioOutro, pParcel)).rows[0].p!
    expect(p.vistas_validas_desde).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    for (const chave of ['codigo_hoje', 'usos_mes', 'resgates_mes', 'usados_mes', 'ativos', 'dias_de_pico', 'usos']) {
      expect(Object.keys(p)).toContain(chave)
    }
    expect(p.usos).toEqual([])
  })

  it('quando o periodo invalido termina antes do mes, o painel soma so as vistas do mes', async () => {
    await db.exec(`
      update public.gostoso_club_views_invalidos
         set ate = (date_trunc('month', public.gostoso_club_hoje()::timestamp) - interval '1 day')::date
    `)
    await db.exec(`delete from public.gostoso_club_views where partner_id = '${pParcel}'`)
    await db.exec(`
      insert into public.gostoso_club_views (partner_id, dia, n) values
        ('${pParcel}', (date_trunc('month', public.gostoso_club_hoje()::timestamp))::date, 4),
        ('${pParcel}', (date_trunc('month', public.gostoso_club_hoje()::timestamp) - interval '1 day')::date, 99)
    `)
    const p = (await painel(IDS.usuarioOutro, pParcel)).rows[0].p!
    expect(p.vistas_mes).toBe(4)
  })

  it('quem nao e dono continua recebendo null no painel inteiro', async () => {
    const r = await painel(IDS.usuarioDono, pParcel)
    expect(r.rows[0].p).toBeNull()
  })
})
