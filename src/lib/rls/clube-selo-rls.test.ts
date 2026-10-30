import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { como, criarBanco } from './banco'

/* O selo do clube le gostoso_club_partners com a chave anon (src/lib/clube/parceiros-no-ar.ts).
   Aqui roda a migracao REAL e confere que essa consulta, exatamente como o site a faz,
   devolve so negocio ativo e publicado com vantagem no ar. Se a politica mudar, o selo
   mudaria sem ninguem ver. */

const MIGRACAO = '20261026120000_vg_clube_passaporte.sql'
const CAT = '30000000-0000-4000-8000-000000000001'
const NO_AR = '20000000-0000-4000-8000-0000000000a1'
const COMBINACAO = '20000000-0000-4000-8000-0000000000a2'
const PAUSADO = '20000000-0000-4000-8000-0000000000a3'
const RASCUNHO = '20000000-0000-4000-8000-0000000000a4'
const SEM_VANTAGEM = '20000000-0000-4000-8000-0000000000a5'

let db: PGlite

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Passeios');
    insert into public.gostoso_businesses (id, name, slug, profile_id, category_id, active, is_published) values
      ('${NO_AR}', 'No ar', 'no-ar', null, '${CAT}', true, true),
      ('${COMBINACAO}', 'Em combinacao', 'em-combinacao', null, '${CAT}', true, true),
      ('${PAUSADO}', 'Pausado', 'pausado', null, '${CAT}', true, true),
      ('${RASCUNHO}', 'Rascunho do clube', 'clube-rascunho', null, '${CAT}', true, false),
      ('${SEM_VANTAGEM}', 'Sem vantagem', 'sem-vantagem', null, '${CAT}', true, true);
  `)
  await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', MIGRACAO), 'utf8'))
  // a migracao semeia os fundadores; aqui o teste controla o estado de cada linha
  await db.exec(`
    delete from public.gostoso_club_partners;
    insert into public.gostoso_club_partners (business_id, beneficio, status, valido_ate) values
      ('${NO_AR}', 'Cafe de cortesia', 'no_ar', null),
      ('${COMBINACAO}', 'Em combinacao', 'em_combinacao', null),
      ('${PAUSADO}', 'Pausada', 'pausado', null),
      ('${RASCUNHO}', 'Negocio em rascunho', 'no_ar', null);
  `)
}, 60_000)

describe('consulta do selo do clube, como anon', () => {
  const CONSULTA = `select business_id, status, valido_ate from public.gostoso_club_partners where status = 'no_ar'`

  it('devolve so o negocio publicado com vantagem no ar', async () => {
    const r = await como(db, 'anon', null, CONSULTA)
    expect(r.rows.map((l) => (l as { business_id: string }).business_id)).toEqual([NO_AR])
  })

  it('nao vaza vantagem pausada nem de negocio em rascunho', async () => {
    const todas = await como(db, 'anon', null, 'select business_id from public.gostoso_club_partners')
    const ids = todas.rows.map((l) => (l as { business_id: string }).business_id).sort()
    expect(ids).toEqual([COMBINACAO, NO_AR].sort())
  })

  it('negocio que sai do ar some da consulta na hora', async () => {
    await db.exec(`update public.gostoso_club_partners set status = 'pausado' where business_id = '${NO_AR}'`)
    const r = await como(db, 'anon', null, CONSULTA)
    expect(r.rows).toHaveLength(0)
    await db.exec(`update public.gostoso_club_partners set status = 'no_ar' where business_id = '${NO_AR}'`)
  })
})
