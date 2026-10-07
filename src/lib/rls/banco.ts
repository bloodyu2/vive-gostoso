// Ajudante dos testes de politica: Postgres em memoria (PGlite) com os tres papeis
// do Supabase, o estado anterior das tabelas e as migracoes que o teste pedir.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

export const MIGRACAO_COLUNAS_STRIPE = '20261007100000_vg_colunas_de_cobranca_so_para_servico.sql'
export const MIGRACAO_VISIBILIDADE = '20261007100100_vg_visibilidade_do_negocio.sql'
export const MIGRACAO_INSERT_ANONIMO = '20261007100200_vg_insert_anonimo_com_teto.sql'

export type Papel = 'anon' | 'authenticated' | 'service_role'

export const IDS = {
  usuarioAdmin: '00000000-0000-4000-8000-0000000000a1',
  usuarioDono: '00000000-0000-4000-8000-0000000000b1',
  usuarioOutro: '00000000-0000-4000-8000-0000000000c1',
  perfilAdmin: '10000000-0000-4000-8000-0000000000a1',
  perfilDono: '10000000-0000-4000-8000-0000000000b1',
  perfilOutro: '10000000-0000-4000-8000-0000000000c1',
  negocioPublicado: '20000000-0000-4000-8000-000000000001',
  negocioRascunho: '20000000-0000-4000-8000-000000000002',
  negocioDesativado: '20000000-0000-4000-8000-000000000003',
}

export async function criarBanco(migracoes: string[]): Promise<PGlite> {
  const db = new PGlite()
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
  `)
  await db.exec(readFileSync(resolve(process.cwd(), 'src/lib/rls/estado-anterior.sql'), 'utf8'))
  await db.exec(`
    insert into public.gostoso_profiles (id, auth_user_id, role, email) values
      ('${IDS.perfilAdmin}', '${IDS.usuarioAdmin}', 'admin', 'admin@exemplo.test'),
      ('${IDS.perfilDono}', '${IDS.usuarioDono}', 'prestador', 'dono@exemplo.test'),
      ('${IDS.perfilOutro}', '${IDS.usuarioOutro}', 'prestador', 'outro@exemplo.test');
    insert into public.gostoso_businesses (id, name, slug, profile_id, active, is_published, stripe_customer_id) values
      ('${IDS.negocioPublicado}', 'Publicado', 'publicado', '${IDS.perfilDono}', true, true, 'cus_exemplo'),
      ('${IDS.negocioRascunho}', 'Rascunho', 'rascunho', '${IDS.perfilDono}', true, false, null),
      ('${IDS.negocioDesativado}', 'Desativado', 'desativado', '${IDS.perfilDono}', false, true, null);
  `)
  for (const arquivo of migracoes) {
    await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', arquivo), 'utf8'))
  }
  return db
}

/** Roda uma consulta com o papel e o usuario dados, como o PostgREST faz. */
export async function como<T = Record<string, unknown>>(
  db: PGlite,
  papel: Papel,
  usuario: string | null,
  sql: string,
) {
  await db.exec(`select set_config('request.jwt.claim.sub', '${usuario ?? ''}', false)`)
  await db.exec(`set role ${papel}`)
  try {
    return await db.query<T>(sql)
  } finally {
    await db.exec('reset role')
    await db.exec(`select set_config('request.jwt.claim.sub', '', false)`)
  }
}
