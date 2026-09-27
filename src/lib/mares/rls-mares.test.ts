import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

/* Roda a migracao real num Postgres em memoria (PGlite) com os tres papeis do
   Supabase e confere a RLS: anon e authenticated leem e nao escrevem; service
   role (que no Supabase tem BYPASSRLS) escreve. */
const MIGRACAO = resolve(process.cwd(), 'supabase/migrations/20260927_gostoso_mares.sql')

let db: PGlite

beforeAll(async () => {
  db = new PGlite()
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
  `)
  await db.exec(readFileSync(MIGRACAO, 'utf8'))
  await db.exec(`
    set role service_role;
    insert into public.gostoso_mares (estacao, data_hora, altura_m, tipo, fonte, ano)
    values ('COM3DN', '2026-01-01T02:21:00-03:00', 2.14, 'alta', 'teste', 2026);
    reset role;
  `)
}, 30_000)

async function comoPapel(papel: string, sql: string) {
  await db.exec(`set role ${papel}`)
  try {
    return await db.query(sql)
  } finally {
    await db.exec('reset role')
  }
}

describe('RLS de gostoso_mares', () => {
  it('anon le', async () => {
    const r = await comoPapel('anon', 'select altura_m from public.gostoso_mares')
    expect(r.rows).toHaveLength(1)
  })

  it('anon nao insere', async () => {
    await expect(
      comoPapel(
        'anon',
        `insert into public.gostoso_mares (estacao, data_hora, altura_m, tipo, fonte, ano)
         values ('COM3DN', '2026-01-02T00:00:00-03:00', 1, 'alta', 'x', 2026)`,
      ),
    ).rejects.toThrow()
  })

  it('anon nao altera nem apaga', async () => {
    await expect(comoPapel('anon', 'update public.gostoso_mares set altura_m = 9')).rejects.toThrow()
    await expect(comoPapel('anon', 'delete from public.gostoso_mares')).rejects.toThrow()
    const r = await db.query<{ altura_m: string }>('select altura_m from public.gostoso_mares')
    expect(Number(r.rows[0].altura_m)).toBe(2.14)
  })

  it('authenticated tambem so le', async () => {
    const r = await comoPapel('authenticated', 'select 1 from public.gostoso_mares')
    expect(r.rows).toHaveLength(1)
    // Tem o grant do template, mas sem policy de escrita a RLS barra: insert
    // falha, e update/delete nao enxergam nenhuma linha.
    await expect(
      comoPapel(
        'authenticated',
        `insert into public.gostoso_mares (estacao, data_hora, altura_m, tipo, fonte, ano)
         values ('COM3DN', '2026-01-02T00:00:00-03:00', 1, 'alta', 'x', 2026)`,
      ),
    ).rejects.toThrow()
    const apagou = await comoPapel('authenticated', 'delete from public.gostoso_mares')
    expect(apagou.affectedRows ?? 0).toBe(0)
    const alterou = await comoPapel('authenticated', 'update public.gostoso_mares set altura_m = 9')
    expect(alterou.affectedRows ?? 0).toBe(0)
    const r2 = await db.query('select 1 from public.gostoso_mares')
    expect(r2.rows).toHaveLength(1)
  })

  it('tipo so aceita alta ou baixa', async () => {
    await expect(
      db.query(`insert into public.gostoso_mares (estacao, data_hora, altura_m, tipo, fonte, ano)
                values ('COM3DN', '2026-01-03T00:00:00-03:00', 1, 'media', 'x', 2026)`),
    ).rejects.toThrow()
  })

  it('nao duplica o mesmo evento da mesma estacao', async () => {
    await expect(
      db.query(`insert into public.gostoso_mares (estacao, data_hora, altura_m, tipo, fonte, ano)
                values ('COM3DN', '2026-01-01T02:21:00-03:00', 2.14, 'alta', 'x', 2026)`),
    ).rejects.toThrow()
  })
})
