import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* KAN-917 (Item 306): aviso ao dono por WhatsApp quando a equipe decide. A migracao so guarda o aviso numa fila e
   entrega os pendentes ao robo respeitando o limite diario; ninguem de fora le a fila nem manda nada. */

const MIGRACOES = [
  '20261026120000_vg_clube_passaporte.sql',
  '20261028100000_vg_clube_resgate.sql',
  '20261114120000_vg_clube_agendamento.sql',
  '20261117210000_vg_clube_aprovacao_da_oferta.sql',
  '20261117220000_vg_aviso_ao_dono_da_decisao.sql',
]
const CAT = '30000000-0000-4000-8000-000000000001'
const A = IDS.negocioPublicado // WhatsApp valido com mascara
const B = IDS.negocioRascunho // WhatsApp invalido
const C = IDS.negocioDesativado // WhatsApp ja no formato 55

let db: PGlite
const sql = (arquivo: string) => readFileSync(resolve(process.cwd(), 'supabase/migrations', arquivo), 'utf8')
const admin = (consulta: string) => como(db, 'authenticated', IDS.usuarioAdmin, consulta)
const robo = (consulta: string) => como(db, 'service_role', null, consulta)

const idDe = async (negocio: string) =>
  (await db.query<{ id: string }>(`select id from public.gostoso_club_partners where business_id = '${negocio}'`)).rows[0].id

async function avisos(negocio: string) {
  return (
    await db.query<{ tipo: string; telefone: string | null; texto: string; status: string }>(
      `select tipo, telefone, texto, status from public.gostoso_avisos_dono where business_id = '${negocio}' order by criado_em`,
    )
  ).rows
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
    update public.gostoso_businesses set whatsapp = '(84) 98888-7777' where id = '${A}';
    update public.gostoso_businesses set whatsapp = 'em breve' where id = '${B}';
    update public.gostoso_businesses set whatsapp = '5584977776666' where id = '${C}';
  `)
  for (const m of MIGRACOES.slice(0, 3)) await db.exec(sql(m))
  await db.exec(`
    delete from public.gostoso_club_partners;
    insert into public.gostoso_club_partners (business_id, beneficio, status) values
      ('${A}', 'Um cafezinho de cortesia.', 'pausado'),
      ('${B}', 'Dois cafezinhos de cortesia.', 'pausado'),
      ('${C}', 'Tres cafezinhos de cortesia.', 'pausado');
  `)
  for (const m of MIGRACOES.slice(3)) await db.exec(sql(m))
  // so depois da migracao de aprovacao o estado em_analise existe; aqui como dono do banco, sem passar pelo trigger
  await db.exec(`update public.gostoso_club_partners set status = 'em_analise'`)
}, 60_000)

describe('a decisao da equipe enfileira o aviso', () => {
  it('aprovar: aviso pendente com o numero no formato 55, texto curto e sem emoji nem travessao', async () => {
    await admin(`select public.gostoso_club_analise_decidir('${await idDe(A)}', true)`)
    const [a] = await avisos(A)
    expect(a).toMatchObject({ tipo: 'vantagem_aprovada', telefone: '5584988887777', status: 'pendente' })
    expect(a.texto).toContain('Publicado')
    expect(a.texto).not.toMatch(/[–—]/)
    expect(a.texto).not.toMatch(/\p{Extended_Pictographic}/u)
  })

  it('recusar: o aviso leva o motivo que a equipe escreveu', async () => {
    await admin(`select public.gostoso_club_analise_decidir('${await idDe(C)}', false, 'Diga em que prato vale o desconto.')`)
    const [a] = await avisos(C)
    expect(a).toMatchObject({ tipo: 'vantagem_recusada', telefone: '5584977776666', status: 'pendente' })
    expect(a.texto).toContain('Diga em que prato vale o desconto.')
  })

  it('negocio sem WhatsApp valido vira sem_numero e nunca vai para o robo', async () => {
    await admin(`select public.gostoso_club_analise_decidir('${await idDe(B)}', true)`)
    const [a] = await avisos(B)
    expect(a).toMatchObject({ telefone: null, status: 'sem_numero' })
  })

  it('o mesmo aviso pendente nao se repete', async () => {
    await robo(`select public.gostoso_aviso__enfileirar('${await idDe(A)}', true, null)`)
    expect(await avisos(A)).toHaveLength(1)
  })

  it('uma decisao que nao acontece nao gera aviso', async () => {
    await admin(`select public.gostoso_club_analise_decidir('${await idDe(A)}', true)`)
    expect(await avisos(A)).toHaveLength(1)
  })
})

describe('o robo recebe so o que cabe no limite de hoje', () => {
  const proximos = async (limite: number) =>
    ((await robo(`select public.gostoso_aviso_proximos(${limite}) as p`)).rows[0] as { p: { id: string; telefone: string }[] }).p

  it('limite zero ou negativo devolve lista vazia', async () => {
    expect(await proximos(0)).toEqual([])
    expect(await proximos(-3)).toEqual([])
  })

  it('devolve os pendentes do mais antigo para o mais novo, sem o sem_numero', async () => {
    const p = await proximos(10)
    expect(p.map((x) => x.telefone)).toEqual(['5584988887777', '5584977776666'])
  })

  it('o limite corta a lista e o que ja foi enviado hoje conta', async () => {
    const [primeiro] = await proximos(1)
    expect(primeiro.telefone).toBe('5584988887777')
    expect(((await robo(`select public.gostoso_aviso_marcar('${primeiro.id}', 'enviado') as r`)).rows[0] as { r: boolean }).r).toBe(true)
    // limite 1, ja enviou 1 hoje: nada mais cabe
    expect(await proximos(1)).toEqual([])
    // limite 2: cabe mais um
    const p = await proximos(2)
    expect(p).toHaveLength(1)
    expect(p[0].telefone).toBe('5584977776666')
  })

  it('o envio de dias atras nao conta para hoje', async () => {
    await db.exec(`update public.gostoso_avisos_dono set enviado_em = now() - interval '2 days' where status = 'enviado'`)
    expect(await proximos(1)).toHaveLength(1)
  })

  it('marcar falhou tira da fila; marcar de novo nao faz nada', async () => {
    const [p] = await proximos(5)
    expect(((await robo(`select public.gostoso_aviso_marcar('${p.id}', 'falhou') as r`)).rows[0] as { r: boolean }).r).toBe(true)
    expect(((await robo(`select public.gostoso_aviso_marcar('${p.id}', 'enviado') as r`)).rows[0] as { r: boolean }).r).toBe(false)
    expect(await proximos(5)).toEqual([])
  })

  it('status invalido e recusado', async () => {
    await expect(robo(`select public.gostoso_aviso_marcar('${IDS.perfilDono}', 'apagado')`)).rejects.toThrow()
  })
})

describe('ninguem de fora le a fila nem manda aviso', () => {
  it('admin, dono, outro e publico nao leem a tabela nem chamam as funcoes do robo', async () => {
    const consultas = [
      'select * from public.gostoso_avisos_dono',
      'select public.gostoso_aviso_proximos(10)',
      `select public.gostoso_aviso_marcar('${IDS.perfilDono}', 'enviado')`,
      `select public.gostoso_aviso__enfileirar('${IDS.perfilDono}', true, null)`,
    ]
    for (const c of consultas) {
      await expect(admin(c)).rejects.toThrow()
      await expect(como(db, 'authenticated', IDS.usuarioDono, c)).rejects.toThrow()
      await expect(como(db, 'authenticated', IDS.usuarioOutro, c)).rejects.toThrow()
      await expect(como(db, 'anon', null, c)).rejects.toThrow()
    }
  })
})
