import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { como, criarBanco } from './banco'

/* Lote de 28/10/2026 do Passaporte: os parceiros que entram no ar, a foto no card (capa do
   negocio, ou a primeira foto da galeria) e a migracao rodando duas vezes sem mudar nada. */

const MIGRACAO_CLUBE = '20261026120000_vg_clube_passaporte.sql'
const MIGRACAO_RESGATE = '20261028100000_vg_clube_resgate.sql'
const CAT = '30000000-0000-4000-8000-000000000001'

const SLUGS = [
  ['gostoso-expedicoes', 'Gostoso Expedições', null, null],
  ['pousada-parcel-do-gostoso', 'Pousada Parcel do Gostoso', null, '{https://x.test/parcel-1.jpg}'],
  ['casa-reduto-artesanato', 'Casa Reduto Artesanato Colaborativo', 'https://x.test/reduto.jpg', null],
  ['casa-gostoso-mar', 'Casa Gostoso Mar ', null, null], // o nome no banco tem espaco sobrando
  ['cafe-com-biscoitos-damy', 'Café com Biscoitos Damy', 'https://x.test/damy.jpg', null],
  ['serido-praia', 'Seridó Praia', null, null],
] as const

let db: PGlite

function sql(arquivo: string) {
  return readFileSync(resolve(process.cwd(), 'supabase/migrations', arquivo), 'utf8')
}

type Linha = {
  nome: string
  slug: string
  capa_url: string | null
  tipo: string | null
  beneficio: string
  regra: string | null
  limite_mensal: number | null
  status: string
}

async function vantagens() {
  const r = await como<Linha>(db, 'anon', null, 'select * from public.gostoso_club_vantagens()')
  return Object.fromEntries(r.rows.map((l) => [l.slug, l]))
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Hospedagem');
  `)
  for (const [slug, nome, capa, fotos] of SLUGS) {
    await db.exec(
      `insert into public.gostoso_businesses (id, name, slug, category_id, active, is_published, cover_url, photos)
       values (gen_random_uuid(), '${nome}', '${slug}', '${CAT}', true, true,
               ${capa ? `'${capa}'` : 'null'}, ${fotos ? `'${fotos}'::text[]` : 'null'})`,
    )
  }
  await db.exec(sql(MIGRACAO_CLUBE))
  await db.exec(sql(MIGRACAO_RESGATE))
}, 60_000)

describe('parceiros do lote de 28/10', () => {
  it('seis cards: quatro no ar e dois em combinação, com o texto combinado', async () => {
    const v = await vantagens()
    expect(Object.keys(v).sort()).toEqual(SLUGS.map((s) => s[0]).sort())

    expect(v['gostoso-expedicoes']).toMatchObject({
      status: 'no_ar',
      beneficio: '5% de desconto no Pix ou em espécie, em qualquer passeio.',
      limite_mensal: null,
    })
    expect(v['pousada-parcel-do-gostoso']).toMatchObject({
      status: 'no_ar',
      beneficio: 'Late check-out de cortesia até as 16h.',
      regra: 'Não vale para diária que termina na sexta ou no sábado. Sujeito à disponibilidade.',
      limite_mensal: null,
    })
    expect(v['casa-gostoso-mar']).toMatchObject({
      status: 'no_ar',
      beneficio: 'Late check-out de cortesia.',
      regra: 'Sujeito à disponibilidade. Consulte o horário na recepção.',
      limite_mensal: null,
    })
    expect(v['cafe-com-biscoitos-damy']).toMatchObject({
      status: 'no_ar',
      beneficio: 'Um cafezinho de cortesia.',
      limite_mensal: null,
    })
    expect(v['casa-reduto-artesanato'].status).toBe('em_combinacao')
    expect(v['serido-praia'].status).toBe('em_combinacao')
  })

  it('a Casa Gostoso Mar não promete horário que o dono não disse', async () => {
    const v = await vantagens()
    const texto = `${v['casa-gostoso-mar'].beneficio} ${v['casa-gostoso-mar'].regra}`
    expect(texto).not.toMatch(/\d\s?h\b|\d{1,2}:\d{2}/)
  })

  it('o nome sai sem o espaço que sobrou no banco', async () => {
    const v = await vantagens()
    expect(v['casa-gostoso-mar'].nome).toBe('Casa Gostoso Mar')
  })
})

describe('foto do card', () => {
  it('usa a capa; sem capa, a primeira foto da galeria; sem nenhuma, vem vazio', async () => {
    const v = await vantagens()
    expect(v['casa-reduto-artesanato'].capa_url).toBe('https://x.test/reduto.jpg')
    expect(v['cafe-com-biscoitos-damy'].capa_url).toBe('https://x.test/damy.jpg')
    expect(v['pousada-parcel-do-gostoso'].capa_url).toBe('https://x.test/parcel-1.jpg')
    expect(v['gostoso-expedicoes'].capa_url).toBeNull()
    expect(v['serido-praia'].capa_url).toBeNull()
  })

  it('capa em branco ou só com espaços conta como sem capa', async () => {
    await db.exec(`update public.gostoso_businesses set cover_url = '   ' where slug = 'serido-praia'`)
    expect((await vantagens())['serido-praia'].capa_url).toBeNull()
  })
})

describe('migração rodada de novo', () => {
  it('não duplica, não derruba nem muda parceiro nenhum', async () => {
    const antes = await db.query(`select business_id, tipo, beneficio, regra, status from public.gostoso_club_partners order by business_id`)
    await db.exec(sql(MIGRACAO_RESGATE))
    await db.exec(sql(MIGRACAO_RESGATE))
    const depois = await db.query(`select business_id, tipo, beneficio, regra, status from public.gostoso_club_partners order by business_id`)
    expect(depois.rows).toEqual(antes.rows)
    expect(depois.rows.length).toBe(6)
    // a funcao continua respondendo ao publico depois do drop e create
    expect(Object.keys(await vantagens()).length).toBe(6)
  })

  it('se o dono da Parcel já editou a vantagem, a migração não escreve por cima', async () => {
    await db.exec(`
      update public.gostoso_club_partners cp
         set beneficio = 'Café da manhã de cortesia.', regra = 'Todo dia.', status = 'pausado'
        from public.gostoso_businesses b
       where b.id = cp.business_id and b.slug = 'pousada-parcel-do-gostoso'`)
    await db.exec(sql(MIGRACAO_RESGATE))
    const r = await db.query<{ beneficio: string; regra: string; status: string }>(
      `select cp.beneficio, cp.regra, cp.status from public.gostoso_club_partners cp
         join public.gostoso_businesses b on b.id = cp.business_id where b.slug = 'pousada-parcel-do-gostoso'`,
    )
    expect(r.rows[0]).toEqual({ beneficio: 'Café da manhã de cortesia.', regra: 'Todo dia.', status: 'pausado' })
  })
})
