import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, MIGRACAO_INSERT_ANONIMO, como, criarBanco } from './banco'

/* O visitante anonimo grava avaliacao, vaga, servico, transfer e evento (tudo
   entra desativado e um humano aprova). Aqui: o que entra tem tamanho razoavel e
   nao aponta para negocio alheio nem para endereco de esquema perigoso. */

let db: PGlite
beforeAll(async () => {
  db = await criarBanco([MIGRACAO_INSERT_ANONIMO])
}, 30_000)

const anon = (sql: string) => como(db, 'anon', null, sql)
const aspas = (s: string) => s.replace(/'/g, "''")
const texto = (n: number) => 'a'.repeat(n)

describe('avaliacoes', () => {
  it('avaliacao como o formulario envia passa', async () => {
    const r = await anon(
      `insert into public.gostoso_reviews (business_id, author_name, rating, comment, approved)
       values ('${IDS.negocioPublicado}', 'Maria', 5, '${aspas(texto(500))}', false)`,
    )
    expect(r.affectedRows).toBe(1)
  })
  it('comentario gigante e recusado', async () => {
    await expect(
      anon(
        `insert into public.gostoso_reviews (business_id, author_name, rating, comment, approved)
         values ('${IDS.negocioPublicado}', 'Maria', 5, '${texto(50_000)}', false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
  it('nome gigante e recusado', async () => {
    await expect(
      anon(
        `insert into public.gostoso_reviews (business_id, author_name, rating, comment, approved)
         values ('${IDS.negocioPublicado}', '${texto(500)}', 5, 'ok', false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
  it('avaliacao ja aprovada continua recusada', async () => {
    await expect(
      anon(
        `insert into public.gostoso_reviews (business_id, author_name, rating, comment, approved)
         values ('${IDS.negocioPublicado}', 'Maria', 5, 'ok', true)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
})

describe('vagas', () => {
  it('vaga como o formulario envia passa', async () => {
    const r = await anon(
      `insert into public.gostoso_job_listings (business_id, business_name, title, description, contract_type, whatsapp, is_active)
       values (null, 'Padaria', 'Atendente', '${aspas(texto(800))}', 'clt', '84999990000', false)`,
    )
    expect(r.affectedRows).toBe(1)
  })
  it('vaga presa a um negocio alheio e recusada', async () => {
    await expect(
      anon(
        `insert into public.gostoso_job_listings (business_id, business_name, title, description, whatsapp, is_active)
         values ('${IDS.negocioPublicado}', 'Padaria', 'Atendente', 'x', '84999990000', false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
  it('descricao gigante e recusada', async () => {
    await expect(
      anon(
        `insert into public.gostoso_job_listings (business_id, title, description, is_active)
         values (null, 'Atendente', '${texto(100_000)}', false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
})

describe('servicos', () => {
  it('servico como o formulario envia passa', async () => {
    const r = await anon(
      `insert into public.gostoso_service_listings (name, headline, description, service_category, photo_url, whatsapp, is_active, is_featured)
       values ('Eletricista', 'Atendo na cidade toda', '${aspas(texto(900))}', 'outro', null, '84999990000', false, false)`,
    )
    expect(r.affectedRows).toBe(1)
  })
  it('servico com foto escolhida pelo visitante e recusado', async () => {
    await expect(
      anon(
        `insert into public.gostoso_service_listings (name, description, photo_url, is_active, is_featured)
         values ('Eletricista', 'x', 'https://exemplo.test/a.jpg', false, false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
  it('descricao gigante e recusada', async () => {
    await expect(
      anon(
        `insert into public.gostoso_service_listings (name, description, is_active, is_featured)
         values ('Eletricista', '${texto(100_000)}', false, false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
})

describe('transfers', () => {
  const base = (extra: string, valor: string) =>
    `insert into public.gostoso_transfers (provider_name, whatsapp, vehicle_type, max_passengers, available_hours, languages, description, active${extra})
     values ('Joao', '84999990000', 'van', 8, '24h', array['pt','en'], 'ok', false${valor})`

  it('transfer como o formulario envia passa', async () => {
    const r = await anon(
      `insert into public.gostoso_transfers (provider_name, whatsapp, vehicle_type, max_passengers, available_hours, languages, description, advance_notice, payment_methods, meeting_point, observations, photo_url, routes, active)
       values ('Joao', '84999990000', 'van', 8, '24h', array['pt','en'], '${aspas(texto(900))}', '1 dia', array['pix'], 'Praca', 'obs', null,
               '[{"origem":"Natal","destino":"Gostoso","preco":300}]'::jsonb, false)`,
    )
    expect(r.affectedRows).toBe(1)
  })
  it('transfer preso a um negocio alheio e recusado', async () => {
    await expect(anon(base(', business_id', `, '${IDS.negocioPublicado}'`))).rejects.toThrow(/row-level security/i)
  })
  it('transfer que escolhe o proprio endereco publico (slug) e recusado', async () => {
    await expect(anon(base(', slug', `, 'joao-turismo'`))).rejects.toThrow(/row-level security/i)
  })
  it('transfer com foto escolhida pelo visitante e recusado', async () => {
    await expect(anon(base(', photo_url', `, 'https://exemplo.test/a.jpg'`))).rejects.toThrow(/row-level security/i)
  })
  it('descricao gigante e recusada', async () => {
    await expect(
      anon(
        `insert into public.gostoso_transfers (provider_name, description, active) values ('Joao', '${texto(100_000)}', false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
  it('lista de rotas gigante e recusada', async () => {
    const rotas = JSON.stringify(Array.from({ length: 3000 }, (_, i) => ({ origem: `Cidade ${i}`, destino: 'Gostoso', preco: i })))
    await expect(
      anon(
        `insert into public.gostoso_transfers (provider_name, routes, active) values ('Joao', '${aspas(rotas)}'::jsonb, false)`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
})

describe('eventos enviados pelo publico', () => {
  const evento = (campo: string, valor: string) =>
    `insert into public.gostoso_event_submissions (name, submitter_name, submitter_email, is_approved, ${campo})
     values ('Festa', 'Ana', 'ana@exemplo.test', false, ${valor})`

  it('endereco https e aceito', async () => {
    const r = await anon(evento('source_url', `'https://exemplo.test/festa'`))
    expect(r.affectedRows).toBe(1)
  })
  it('sem endereco e com endereco vazio sao aceitos', async () => {
    expect((await anon(evento('source_url', 'null'))).affectedRows).toBe(1)
    expect((await anon(evento('source_url', `''`))).affectedRows).toBe(1)
  })
  it('javascript: em source_url e recusado', async () => {
    await expect(anon(evento('source_url', `'javascript:alert(1)'`))).rejects.toThrow(/row-level security/i)
    await expect(anon(evento('source_url', `'JaVaScRiPt:alert(1)'`))).rejects.toThrow(/row-level security/i)
    await expect(anon(evento('source_url', `'data:text/html,<script>1</script>'`))).rejects.toThrow(/row-level security/i)
  })
  it('javascript: em cover_url e recusado', async () => {
    await expect(anon(evento('cover_url', `'javascript:alert(1)'`))).rejects.toThrow(/row-level security/i)
  })
  it('endereco gigante e recusado', async () => {
    await expect(anon(evento('source_url', `'https://exemplo.test/${texto(5000)}'`))).rejects.toThrow(/row-level security/i)
  })
  it('as travas antigas seguem: nao entra ja aprovado nem com nota do admin', async () => {
    await expect(
      anon(
        `insert into public.gostoso_event_submissions (name, submitter_name, submitter_email, is_approved) values ('Festa','Ana','ana@exemplo.test', true)`,
      ),
    ).rejects.toThrow(/row-level security/i)
    await expect(
      anon(
        `insert into public.gostoso_event_submissions (name, submitter_name, submitter_email, is_approved, admin_note) values ('Festa','Ana','ana@exemplo.test', false, 'x')`,
      ),
    ).rejects.toThrow(/row-level security/i)
  })
})
