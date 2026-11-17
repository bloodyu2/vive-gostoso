import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* KAN-917 (Item 294): a equipe aprova a vantagem do negocio antes de ir ao ar. Roda as migracoes reais do
   Passaporte, do resgate, do agendamento e a de aprovacao num Postgres em memoria e confere: o que ja estava
   no ar continua aprovado, o dono nunca se aprova, mudar o texto tira do ar, pausar e religar sem mexer no
   texto nao pede a equipe, e so o admin decide. */

const MIGRACOES = [
  '20261026120000_vg_clube_passaporte.sql',
  '20261028100000_vg_clube_resgate.sql',
  '20261114120000_vg_clube_agendamento.sql',
]
const APROVACAO = '20261117210000_vg_clube_aprovacao_da_oferta.sql'
const CAT = '30000000-0000-4000-8000-000000000001'
const NEGOCIO_NO_AR = IDS.negocioPublicado // dono: usuarioDono, ja tinha vantagem no ar antes da migracao
const NEGOCIO_NOVO = IDS.negocioRascunho // dono: usuarioDono, sem vantagem

let db: PGlite
const sql = (arquivo: string) => readFileSync(resolve(process.cwd(), 'supabase/migrations', arquivo), 'utf8')

const dono = (consulta: string) => como(db, 'authenticated', IDS.usuarioDono, consulta)
const outro = (consulta: string) => como(db, 'authenticated', IDS.usuarioOutro, consulta)
const admin = (consulta: string) => como(db, 'authenticated', IDS.usuarioAdmin, consulta)
const publico = (consulta: string) => como(db, 'anon', null, consulta)

async function status(negocio: string) {
  const r = await db.query<{ status: string; motivo_recusa: string | null; aprovado_hash: string | null; analisado_em: string | null }>(
    `select status, motivo_recusa, aprovado_hash, analisado_em::text as analisado_em from public.gostoso_club_partners where business_id = '${negocio}'`,
  )
  return r.rows[0]
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Cafe');
    create schema if not exists auth;
    create table if not exists auth.users (id uuid primary key);
    insert into auth.users (id) values ('${IDS.usuarioAdmin}'), ('${IDS.usuarioDono}'), ('${IDS.usuarioOutro}');
  `)
  for (const m of MIGRACOES) await db.exec(sql(m))
  // a migracao do clube semeia os fundadores; o teste controla as linhas
  await db.exec(`
    delete from public.gostoso_club_partners;
    insert into public.gostoso_club_partners (business_id, tipo, beneficio, regra, limite_mensal, status) values
      ('${NEGOCIO_NO_AR}', 'Cafe', 'Um cafezinho de cortesia.', 'Vale na compra de qualquer prato.', 10, 'no_ar');
  `)
  await db.exec(sql(APROVACAO))
}, 60_000)

describe('o que ja estava no ar antes da aprovacao', () => {
  it('fica aprovado como esta, sem passar pela equipe', async () => {
    const l = await status(NEGOCIO_NO_AR)
    expect(l.status).toBe('no_ar')
    expect(l.aprovado_hash).toMatch(/^[0-9a-f]{32}$/)
    expect(l.analisado_em).not.toBeNull()
  })
})

describe('o dono envia e nunca se aprova', () => {
  it('uma vantagem nova nasce em_analise mesmo pedindo no_ar, e o publico nao a ve', async () => {
    await dono(
      `insert into public.gostoso_club_partners (business_id, beneficio, status) values ('${NEGOCIO_NOVO}', '10% na primeira compra.', 'no_ar')`,
    )
    expect((await status(NEGOCIO_NOVO)).status).toBe('em_analise')
    const r = await publico(`select business_id from public.gostoso_club_partners where business_id = '${NEGOCIO_NOVO}'`)
    expect(r.rows).toHaveLength(0)
  })

  it('o dono nao cria vantagem como em_combinacao nem como rejeitado: o que ele pedir vira em_analise', async () => {
    await dono(`insert into public.gostoso_club_partners (business_id, beneficio, status) values ('${IDS.negocioDesativado}', 'Teste de status.', 'em_combinacao')`)
    expect((await status(IDS.negocioDesativado)).status).toBe('em_analise')
    await db.exec(`delete from public.gostoso_club_partners where business_id = '${IDS.negocioDesativado}'`)
    await dono(`insert into public.gostoso_club_partners (business_id, beneficio, status) values ('${IDS.negocioDesativado}', 'Teste de status.', 'rejeitado')`)
    expect((await status(IDS.negocioDesativado)).status).toBe('em_analise')
    await db.exec(`delete from public.gostoso_club_partners where business_id = '${IDS.negocioDesativado}'`)
  })

  it('o dono nao muda o status para em_combinacao por update', async () => {
    await expect(dono(`update public.gostoso_club_partners set status = 'em_combinacao' where business_id = '${NEGOCIO_NO_AR}'`)).rejects.toThrow()
  })

  it('o dono nao escreve nas colunas da equipe', async () => {
    await expect(dono(`update public.gostoso_club_partners set aprovado_hash = 'x' where business_id = '${NEGOCIO_NO_AR}'`)).rejects.toThrow()
    await expect(dono(`update public.gostoso_club_partners set motivo_recusa = 'x' where business_id = '${NEGOCIO_NO_AR}'`)).rejects.toThrow()
    await expect(dono(`update public.gostoso_club_partners set analisado_por = '${IDS.usuarioDono}' where business_id = '${NEGOCIO_NO_AR}'`)).rejects.toThrow()
  })

  it('quem nao e dono nao muda a vantagem de outro negocio', async () => {
    await outro(`update public.gostoso_club_partners set beneficio = 'Invadido.' where business_id = '${NEGOCIO_NO_AR}'`)
    const r = await db.query<{ beneficio: string }>(`select beneficio from public.gostoso_club_partners where business_id = '${NEGOCIO_NO_AR}'`)
    expect(r.rows[0].beneficio).toBe('Um cafezinho de cortesia.')
  })
})

describe('mudar o texto, pausar e religar', () => {
  it('pausar e religar sem mexer no texto nao pede a equipe', async () => {
    await dono(`update public.gostoso_club_partners set status = 'pausado' where business_id = '${NEGOCIO_NO_AR}'`)
    expect((await status(NEGOCIO_NO_AR)).status).toBe('pausado')
    await dono(`update public.gostoso_club_partners set status = 'no_ar' where business_id = '${NEGOCIO_NO_AR}'`)
    expect((await status(NEGOCIO_NO_AR)).status).toBe('no_ar')
  })

  it('mudar so o limite ou a validade nao tira do ar', async () => {
    await dono(`update public.gostoso_club_partners set limite_mensal = 50, valido_ate = '2099-01-01', status = 'no_ar' where business_id = '${NEGOCIO_NO_AR}'`)
    expect((await status(NEGOCIO_NO_AR)).status).toBe('no_ar')
  })

  it('mudar o texto tira do ar e o publico deixa de ver', async () => {
    await dono(`update public.gostoso_club_partners set beneficio = 'Dois cafezinhos de cortesia.', status = 'no_ar' where business_id = '${NEGOCIO_NO_AR}'`)
    expect((await status(NEGOCIO_NO_AR)).status).toBe('em_analise')
    const r = await publico(`select business_id from public.gostoso_club_partners where business_id = '${NEGOCIO_NO_AR}'`)
    expect(r.rows).toHaveLength(0)
  })

  it('pausar, mudar o texto e religar tambem espera a equipe', async () => {
    // volta ao texto aprovado pela equipe para ter uma linha pausada e aprovada
    await admin(`select public.gostoso_club_analise_decidir((select id from public.gostoso_club_partners where business_id = '${NEGOCIO_NO_AR}'), true)`)
    expect((await status(NEGOCIO_NO_AR)).status).toBe('no_ar')
    const visivel = await publico(`select business_id from public.gostoso_club_partners where business_id = '${NEGOCIO_NO_AR}'`)
    expect(visivel.rows).toHaveLength(1)
    await dono(`update public.gostoso_club_partners set status = 'pausado' where business_id = '${NEGOCIO_NO_AR}'`)
    await dono(`update public.gostoso_club_partners set regra = 'Regra nova.', status = 'no_ar' where business_id = '${NEGOCIO_NO_AR}'`)
    expect((await status(NEGOCIO_NO_AR)).status).toBe('em_analise')
  })
})

describe('so o admin decide', () => {
  const idDe = (negocio: string) => `(select id from public.gostoso_club_partners where business_id = '${negocio}')`

  it('dono, outro usuario e publico nao veem a fila nem decidem', async () => {
    for (const quem of [dono, outro]) {
      await expect(quem('select public.gostoso_club_analise_fila()')).rejects.toThrow(/sem acesso/)
      await expect(quem(`select public.gostoso_club_analise_decidir(${idDe(NEGOCIO_NOVO)}, true)`)).rejects.toThrow(/sem acesso/)
    }
    await expect(publico('select public.gostoso_club_analise_fila()')).rejects.toThrow()
  })

  it('a fila do admin traz as duas vantagens em analise, com nome do negocio', async () => {
    const r = await admin('select public.gostoso_club_analise_fila() as fila')
    const fila = (r.rows[0] as { fila: { nome: string; ja_aprovada_antes: boolean }[] }).fila
    expect(fila).toHaveLength(2)
    expect(fila.map((f) => f.nome).sort()).toEqual(['Publicado', 'Rascunho'])
    expect(fila.find((f) => f.nome === 'Publicado')?.ja_aprovada_antes).toBe(true)
    expect(fila.find((f) => f.nome === 'Rascunho')?.ja_aprovada_antes).toBe(false)
  })

  it('recusar exige motivo', async () => {
    const r = await admin(`select public.gostoso_club_analise_decidir(${idDe(NEGOCIO_NOVO)}, false, '  ') as r`)
    expect((r.rows[0] as { r: { ok: boolean; motivo: string } }).r).toMatchObject({ ok: false, motivo: 'motivo_obrigatorio' })
    expect((await status(NEGOCIO_NOVO)).status).toBe('em_analise')
  })

  it('recusar grava o motivo e o dono o ve', async () => {
    await admin(`select public.gostoso_club_analise_decidir(${idDe(NEGOCIO_NOVO)}, false, 'Diga qual prato vale o desconto.')`)
    const l = await status(NEGOCIO_NOVO)
    expect(l.status).toBe('rejeitado')
    expect(l.motivo_recusa).toBe('Diga qual prato vale o desconto.')
    const r = await dono(`select status, motivo_recusa from public.gostoso_club_partners where business_id = '${NEGOCIO_NOVO}'`)
    expect(r.rows[0]).toMatchObject({ status: 'rejeitado', motivo_recusa: 'Diga qual prato vale o desconto.' })
  })

  it('salvar sem reenviar mantem recusada; reenviar volta a em_analise e apaga o motivo', async () => {
    await dono(`update public.gostoso_club_partners set limite_mensal = 5, status = 'rejeitado' where business_id = '${NEGOCIO_NOVO}'`)
    expect((await status(NEGOCIO_NOVO)).status).toBe('rejeitado')
    await dono(`update public.gostoso_club_partners set beneficio = '10% no prato do dia.', status = 'em_analise' where business_id = '${NEGOCIO_NOVO}'`)
    const l = await status(NEGOCIO_NOVO)
    expect(l.status).toBe('em_analise')
    expect(l.motivo_recusa).toBeNull()
  })

  it('o dono nao liga uma recusada nem uma em analise: continua esperando a equipe', async () => {
    await dono(`update public.gostoso_club_partners set status = 'no_ar' where business_id = '${NEGOCIO_NOVO}'`)
    expect((await status(NEGOCIO_NOVO)).status).toBe('em_analise')
  })

  it('aprovar poe no ar e grava quem aprovou', async () => {
    const r = await admin(`select public.gostoso_club_analise_decidir(${idDe(NEGOCIO_NOVO)}, true) as r`)
    expect((r.rows[0] as { r: { ok: boolean; status: string } }).r).toMatchObject({ ok: true, status: 'no_ar' })
    const l = await db.query<{ status: string; analisado_por: string; aprovado_hash: string }>(
      `select status, analisado_por, aprovado_hash from public.gostoso_club_partners where business_id = '${NEGOCIO_NOVO}'`,
    )
    expect(l.rows[0]).toMatchObject({ status: 'no_ar', analisado_por: IDS.usuarioAdmin })
    expect(l.rows[0].aprovado_hash).toMatch(/^[0-9a-f]{32}$/)
  })

  it('decidir uma vantagem que nao esta em analise nao muda nada', async () => {
    const r = await admin(`select public.gostoso_club_analise_decidir(${idDe(NEGOCIO_NOVO)}, false, 'Motivo qualquer aqui.') as r`)
    expect((r.rows[0] as { r: { ok: boolean; motivo: string } }).r).toMatchObject({ ok: false, motivo: 'nao_esta_em_analise' })
    expect((await status(NEGOCIO_NOVO)).status).toBe('no_ar')
  })
})
