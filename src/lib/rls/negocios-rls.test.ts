import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, MIGRACAO_COLUNAS_STRIPE, MIGRACAO_VISIBILIDADE, como, criarBanco } from './banco'

/* Roda as migracoes reais num Postgres em memoria e confere, com os papeis do
   Supabase, quem le e quem altera o que em gostoso_businesses. */

describe('colunas de cobranca de gostoso_businesses', () => {
  let db: PGlite
  beforeAll(async () => {
    db = await criarBanco([MIGRACAO_COLUNAS_STRIPE])
  }, 30_000)

  it('o anonimo nao le as colunas de cobranca', async () => {
    await expect(como(db, 'anon', null, 'select stripe_customer_id from public.gostoso_businesses')).rejects.toThrow(
      /permission denied/i,
    )
  })

  it('o usuario logado nao le as colunas de cobranca de nenhum negocio', async () => {
    await expect(
      como(db, 'authenticated', IDS.usuarioOutro, 'select stripe_customer_id from public.gostoso_businesses'),
    ).rejects.toThrow(/permission denied/i)
    await expect(
      como(db, 'authenticated', IDS.usuarioDono, 'select stripe_subscription_id from public.gostoso_businesses'),
    ).rejects.toThrow(/permission denied/i)
  })

  it('o usuario logado continua lendo as colunas publicas e as do painel', async () => {
    const r = await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `select id, name, slug, profile_id, active, is_published, plan, plan_expires_at, opening_hours, services
         from public.gostoso_businesses`,
    )
    expect(r.rows.length).toBeGreaterThan(0)
  })

  it('o dono continua editando o proprio negocio', async () => {
    const r = await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_businesses set name = 'Publicado 2' where id = '${IDS.negocioPublicado}'`,
    )
    expect(r.affectedRows).toBe(1)
  })

  it('o servico (service_role) segue lendo e gravando as colunas de cobranca', async () => {
    const r = await como<{ stripe_customer_id: string | null }>(
      db,
      'service_role',
      null,
      `select stripe_customer_id from public.gostoso_businesses where id = '${IDS.negocioPublicado}'`,
    )
    expect(r.rows[0].stripe_customer_id).toBe('cus_exemplo')
    const w = await como(
      db,
      'service_role',
      null,
      `update public.gostoso_businesses set stripe_customer_id = 'cus_novo' where id = '${IDS.negocioPublicado}'`,
    )
    expect(w.affectedRows).toBe(1)
  })
})

describe('visibilidade do negocio', () => {
  let db: PGlite
  beforeAll(async () => {
    db = await criarBanco([MIGRACAO_COLUNAS_STRIPE, MIGRACAO_VISIBILIDADE])
  }, 30_000)

  const ids = async (papel: 'anon' | 'authenticated', usuario: string | null) =>
    (await como<{ id: string }>(db, papel, usuario, 'select id from public.gostoso_businesses order by slug')).rows.map(
      (l) => l.id,
    )

  it('o anonimo so ve negocio ativo E publicado', async () => {
    expect(await ids('anon', null)).toEqual([IDS.negocioPublicado])
  })

  it('outro usuario logado tambem nao ve rascunho nem negocio desativado', async () => {
    expect(await ids('authenticated', IDS.usuarioOutro)).toEqual([IDS.negocioPublicado])
  })

  it('o dono ve o proprio rascunho e o proprio negocio desativado', async () => {
    expect((await ids('authenticated', IDS.usuarioDono)).sort()).toEqual(
      [IDS.negocioDesativado, IDS.negocioPublicado, IDS.negocioRascunho].sort(),
    )
  })

  it('o admin ve todos', async () => {
    expect(await ids('authenticated', IDS.usuarioAdmin)).toHaveLength(3)
  })

  it('o dono nao reativa um negocio que a equipe desativou', async () => {
    await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_businesses set active = true, is_published = true where id = '${IDS.negocioDesativado}'`,
    )
    const r = await db.query<{ active: boolean }>(
      `select active from public.gostoso_businesses where id = '${IDS.negocioDesativado}'`,
    )
    expect(r.rows[0].active).toBe(false)
  })

  it('o dono continua publicando e despublicando o proprio negocio', async () => {
    await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_businesses set is_published = true where id = '${IDS.negocioRascunho}'`,
    )
    expect(await ids('anon', null)).toContain(IDS.negocioRascunho)
    await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_businesses set is_published = false where id = '${IDS.negocioRascunho}'`,
    )
    expect(await ids('anon', null)).not.toContain(IDS.negocioRascunho)
  })

  it('o admin reativa e desativa', async () => {
    await como(
      db,
      'authenticated',
      IDS.usuarioAdmin,
      `update public.gostoso_businesses set active = true where id = '${IDS.negocioDesativado}'`,
    )
    expect(await ids('anon', null)).toContain(IDS.negocioDesativado)
    await como(
      db,
      'authenticated',
      IDS.usuarioAdmin,
      `update public.gostoso_businesses set active = false where id = '${IDS.negocioDesativado}'`,
    )
    expect(await ids('anon', null)).not.toContain(IDS.negocioDesativado)
  })

  it('as travas antigas seguem valendo: o dono nao troca plano nem dono do negocio', async () => {
    await como(
      db,
      'authenticated',
      IDS.usuarioDono,
      `update public.gostoso_businesses set plan = 'destaque', profile_id = '${IDS.perfilOutro}' where id = '${IDS.negocioPublicado}'`,
    )
    const r = await db.query<{ plan: string; profile_id: string }>(
      `select plan, profile_id from public.gostoso_businesses where id = '${IDS.negocioPublicado}'`,
    )
    expect(r.rows[0].plan).toBe('free')
    expect(r.rows[0].profile_id).toBe(IDS.perfilDono)
  })
})
