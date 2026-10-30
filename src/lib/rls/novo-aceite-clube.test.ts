import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { como, criarBanco } from './banco'

/* SQL modelo de "novo aceite do clube sem perfil" (scripts/cadastros/modelo-novo-aceite-clube-sem-perfil.sql,
   decisoes.md). Roda o MODELO de verdade, com as migracoes reais, num Postgres em memoria:
   perfil verificado, publicado e ativo, sem dono, com fotos, mais a vantagem; e roda de novo sem duplicar. */

const MODELO = readFileSync(resolve(process.cwd(), 'scripts/cadastros/modelo-novo-aceite-clube-sem-perfil.sql'), 'utf8')
const CAT = '30000000-0000-4000-8000-0000000000c1'
const ID_A = '40000000-0000-4000-8000-00000000000a'
const ID_B = '40000000-0000-4000-8000-00000000000b'

/** Troca os valores de exemplo do modelo. Falha se o modelo mudou e um valor sumiu. */
function preencher(troca: Record<string, string>): string {
  let sql = MODELO
  for (const [de, para] of Object.entries(troca)) {
    expect(sql, `o modelo nao tem mais: ${de}`).toContain(de)
    sql = sql.replace(de, para)
  }
  return sql
}

const ID_MODELO = "'00000000-0000-4000-8000-000000000000'::uuid"
const NOME_MODELO = "'Nome Exato do Negocio'::text"
const SLUG_MODELO = "'nome-exato-do-negocio'::text"

function valores(id: string, nome: string, slug: string, extra: Record<string, string> = {}) {
  return {
    [ID_MODELO]: `'${id}'::uuid`,
    [NOME_MODELO]: `'${nome}'::text`,
    [SLUG_MODELO]: `'${slug}'::text`,
    ...extra,
  }
}

let db: PGlite

async function contar(tabela: string, filtro = 'true') {
  const r = await db.query<{ n: number }>(`select count(*)::int as n from public.${tabela} where ${filtro}`)
  return r.rows[0].n
}

beforeAll(async () => {
  db = await criarBanco(['20261025120000_vg_verificado_automatico_e_transfer_do_negocio.sql'])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null, slug text unique, display_order int);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    alter table public.gostoso_businesses add column if not exists horario_fonte text;
    alter table public.gostoso_businesses add column if not exists horario_conferido_em date;
    insert into public.gostoso_categories values ('${CAT}', 'Restaurantes', 'restaurantes', 1);
    grant select on public.gostoso_categories to anon, authenticated;
    grant all on public.gostoso_categories to service_role;
  `)
  await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations/20261026120000_vg_clube_passaporte.sql'), 'utf8'))
  // a migracao semeia os fundadores; aqui parte-se do zero
  await db.exec('delete from public.gostoso_club_partners')
}, 60_000)

describe('modelo de novo aceite sem perfil', () => {
  it('cria o perfil verificado, publicado e ativo, sem dono, com capa e fotos, e a vantagem', async () => {
    const r = await db.query(preencher(valores(ID_A, 'Cantinho do Teste', 'cantinho-do-teste')))
    expect(r.rows).toHaveLength(1)

    const b = (await db.query<Record<string, unknown>>(
      `select * from public.gostoso_businesses where slug = 'cantinho-do-teste'`,
    )).rows[0]
    expect(b.id).toBe(ID_A)
    expect(b.is_verified).toBe(true)
    expect(b.is_published).toBe(true)
    expect(b.active).toBe(true)
    expect(b.profile_id).toBeNull()
    expect(b.plan).toBe('free')
    expect(b.category_id).toBe(CAT)
    expect(b.instagram).toBe('instagram_sem_arroba')
    expect(b.cover_url).toBe(
      `https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/${ID_A}/1793000000000-nome-do-negocio-01.jpg`,
    )
    expect(b.photos).toHaveLength(2)
    expect((b.photos as string[])[1]).toContain(`/${ID_A}/1793000000000-nome-do-negocio-02.jpg`)
    expect(Object.keys(b.opening_hours as object).sort()).toEqual(['dom', 'qua', 'qui', 'sab', 'seg', 'sex', 'ter'])

    const p = (await db.query<{ status: string; beneficio: string }>(
      `select cp.status, cp.beneficio from public.gostoso_club_partners cp where cp.business_id = '${ID_A}'`,
    )).rows
    expect(p).toEqual([{ status: 'em_combinacao', beneficio: 'Brinde de cortesia na primeira visita.' }])
  })

  it('rodar de novo nao duplica o perfil nem a vantagem', async () => {
    const sql = preencher(valores(ID_A, 'Cantinho do Teste', 'cantinho-do-teste'))
    await db.query(sql)
    await db.query(sql)
    expect(await contar('gostoso_businesses', `slug = 'cantinho-do-teste'`)).toBe(1)
    expect(await contar('gostoso_club_partners', `business_id = '${ID_A}'`)).toBe(1)
  })

  it('com a vantagem no_ar, o parceiro aparece para o visitante anonimo', async () => {
    await db.query(
      preencher(
        valores(ID_B, 'Segundo Lugar', 'segundo-lugar', {
          "'em_combinacao'::text": "'no_ar'::text",
        }),
      ),
    )
    const r = await como<{ slug: string; status: string }>(
      db, 'anon', null, 'select slug, status from public.gostoso_club_vantagens()',
    )
    expect(r.rows.find((l) => l.slug === 'segundo-lugar')?.status).toBe('no_ar')
  })

  it('funciona tambem como service role', async () => {
    const r = await como(
      db, 'service_role', null,
      preencher(valores('40000000-0000-4000-8000-00000000000c', 'Terceiro Lugar', 'terceiro-lugar')),
    )
    expect(r.rows).toHaveLength(1)
    const b = await db.query<{ is_verified: boolean }>(`select is_verified from public.gostoso_businesses where slug = 'terceiro-lugar'`)
    expect(b.rows[0].is_verified).toBe(true)
  })

  it('slug que ja existe com outro nome: nao grava nada (nao cola a vantagem no negocio errado)', async () => {
    const antes = await contar('gostoso_club_partners')
    const r = await db.query(preencher(valores('40000000-0000-4000-8000-00000000000d', 'Outro Nome Qualquer', 'cantinho-do-teste')))
    expect(r.rows).toHaveLength(0)
    expect(await contar('gostoso_club_partners')).toBe(antes)
    expect(await contar('gostoso_businesses', `name = 'Outro Nome Qualquer'`)).toBe(0)
  })

  it('categoria que nao existe: nao cria perfil nem vantagem', async () => {
    const r = await db.query(
      preencher(valores('40000000-0000-4000-8000-00000000000e', 'Sem Categoria', 'sem-categoria', {
        "'restaurantes'::text": "'categoria-que-nao-existe'::text",
      })),
    )
    expect(r.rows).toHaveLength(0)
    expect(await contar('gostoso_businesses', `slug = 'sem-categoria'`)).toBe(0)
  })

  it('perfil ja existente com o mesmo slug e nome, sem vantagem: so a vantagem entra', async () => {
    await db.exec(`
      insert into public.gostoso_businesses (id, name, slug, category_id, active, is_published)
      values ('40000000-0000-4000-8000-00000000000f', 'Ja Existia', 'ja-existia', '${CAT}', true, true)`)
    const r = await db.query(preencher(valores('40000000-0000-4000-8000-000000000010', 'Ja Existia', 'ja-existia')))
    expect(r.rows).toHaveLength(1)
    expect(await contar('gostoso_businesses', `slug = 'ja-existia'`)).toBe(1)
    expect(await contar('gostoso_club_partners', `business_id = '40000000-0000-4000-8000-00000000000f'`)).toBe(1)
  })

  it('vantagem fora do tamanho que o banco aceita e recusada', async () => {
    await expect(
      db.query(
        preencher(valores('40000000-0000-4000-8000-000000000011', 'Beneficio Curto', 'beneficio-curto', {
          "'Brinde de cortesia na primeira visita.'::text": "'ab'::text",
        })),
      ),
    ).rejects.toThrow()
  })
})
