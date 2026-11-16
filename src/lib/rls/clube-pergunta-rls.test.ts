import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PGlite } from '@electric-sql/pglite'
import { IDS, como, criarBanco } from './banco'

/* KAN-896: a pergunta "voce usou o cupom?". Roda as quatro migracoes do Passaporte num
   Postgres em memoria e confere: consentimento proprio da pergunta, resposta do cliente
   (usado_via = 'cliente'), a fila de envio (so o servico, sem repetir), quem ve os numeros
   e que o dono nao le o token da pergunta. */

const MIGRACOES = [
  '20261026120000_vg_clube_passaporte.sql',
  '20261028100000_vg_clube_resgate.sql',
  '20261029120000_vg_clube_resgate_antiabuso.sql',
  '20261116120000_vg_clube_pergunta_uso.sql',
]

const CAT = '30000000-0000-4000-8000-000000000001'
const NEGOCIO_A = IDS.negocioPublicado // dono: usuarioDono
const NEGOCIO_B = '20000000-0000-4000-8000-0000000000b2' // dono: usuarioOutro
const P_A = '40000000-0000-4000-8000-0000000000a1'
const P_B = '40000000-0000-4000-8000-0000000000b1'
const VERSAO = '2026-10-28'
const PERGUNTA_VERSAO = '2026-11-16'
const TEXTO_PERGUNTA = 'Opcional. Quero que o Vive Gostoso me pergunte por e-mail, um dia depois, se usei este cupom. É uma pergunta só.'
const textoResgate = (n: string) => `Autorizo repassar meu nome, e-mail e telefone a ${n} para que ele me procure sobre esta vantagem.`

let db: PGlite
let contador = 0

type Resp = { ok: boolean; motivo?: string; token?: string; codigo?: string; [k: string]: unknown }

async function resgatar(partner: string, negocio: string): Promise<{ token: string; id: string; resposta_token: string }> {
  contador += 1
  // recuo o relogio dos testes: os tetos por minuto e por hora do resgate olham created_at
  await db.exec(
    `update public.gostoso_club_vouchers set created_at = created_at - interval '61 minutes' where created_at > now() - interval '59 minutes'`,
  )
  const r = await como<{ r: Resp }>(
    db,
    'anon',
    null,
    `select public.gostoso_club_resgatar('${partner}', 'Ana Souza', 'ana${contador}@exemplo.com', '849${20_000_000 + contador}',
       true, '${VERSAO}', '${textoResgate(negocio).replace(/'/g, "''")}', null, null, null) as r`,
  )
  expect(r.rows[0].r.ok).toBe(true)
  const token = r.rows[0].r.token as string
  const v = await db.query<{ id: string; resposta_token: string }>(
    `select id, resposta_token from public.gostoso_club_vouchers where token = '${token}'`,
  )
  return { token, ...v.rows[0] }
}

async function aceitar(token: string, o: Partial<{ versao: string; texto: string; idioma: string }> = {}) {
  const r = await como<{ r: Resp }>(
    db,
    'anon',
    null,
    `select public.gostoso_club_aceitar_pergunta('${token}', '${o.versao ?? PERGUNTA_VERSAO}', '${(o.texto ?? TEXTO_PERGUNTA).replace(/'/g, "''")}', '${o.idioma ?? 'pt'}') as r`,
  )
  return r.rows[0].r
}

async function responder(token: string, usou: boolean) {
  const r = await como<{ r: Resp }>(db, 'anon', null, `select public.gostoso_club_responder_uso('${token}', ${usou}) as r`)
  return r.rows[0].r
}

async function linha(id: string) {
  return (await db.query<Record<string, unknown>>(`select * from public.gostoso_club_vouchers where id = '${id}'`)).rows[0]
}

/** Faz o resgate parecer de um dia atras (hora de Gostoso), para entrar na fila. */
async function envelhecer(id: string, horas = 36) {
  await db.exec(`update public.gostoso_club_vouchers set created_at = now() - interval '${horas} hours' where id = '${id}'`)
}

async function reservar(limite = 50, agora?: string) {
  const r = await como<{ id: string }>(
    db,
    'service_role',
    null,
    `select * from public.gostoso_club_pergunta_reservar(${limite}${agora ? `, '${agora}'::timestamptz` : ''})`,
  )
  return r.rows
}

beforeAll(async () => {
  db = await criarBanco([])
  await db.exec(`
    create table public.gostoso_categories (id uuid primary key, name text not null);
    alter table public.gostoso_businesses add column if not exists logo_url text;
    insert into public.gostoso_categories values ('${CAT}', 'Passeios');
    insert into public.gostoso_businesses (id, name, slug, profile_id, category_id, active, is_published) values
      ('${NEGOCIO_B}', 'Outro negocio', 'outro-negocio', '${IDS.perfilOutro}', '${CAT}', true, true);
    update public.gostoso_businesses set category_id = '${CAT}' where id = '${NEGOCIO_A}';
  `)
  for (const m of MIGRACOES) await db.exec(readFileSync(resolve(process.cwd(), 'supabase/migrations', m), 'utf8'))
  await db.exec(`
    insert into public.gostoso_club_partners (id, business_id, tipo, beneficio, status) values
      ('${P_A}', '${NEGOCIO_A}', 'Passeios', '10% no primeiro passeio', 'no_ar'),
      ('${P_B}', '${NEGOCIO_B}', 'Passeios', 'Sobremesa de cortesia', 'no_ar');
  `)
}, 60_000)

describe('usado_via aceita cliente e só os três valores', () => {
  it('cliente entra; outro valor é recusado', async () => {
    const a = await resgatar(P_A, 'Publicado')
    await db.exec(`update public.gostoso_club_vouchers set status = 'usado', usado_em = now(), usado_via = 'cliente' where id = '${a.id}'`)
    expect((await linha(a.id)).usado_via).toBe('cliente')
    await expect(
      db.exec(`update public.gostoso_club_vouchers set usado_via = 'robo' where id = '${a.id}'`),
    ).rejects.toThrow()
  })
})

describe('aceitar a pergunta (consentimento próprio)', () => {
  it('grava versão, texto exato e idioma; os resgates antigos ficam sem consentimento da pergunta', async () => {
    const a = await resgatar(P_A, 'Publicado')
    const antes = await linha(a.id)
    expect(antes.pergunta_aceita_em).toBeNull()
    expect(await aceitar(a.token, { idioma: 'en' })).toMatchObject({ ok: true, ja_aceito: false })
    const depois = await linha(a.id)
    expect(depois).toMatchObject({ pergunta_versao: PERGUNTA_VERSAO, pergunta_texto: TEXTO_PERGUNTA, pergunta_idioma: 'en' })
    expect(depois.pergunta_aceita_em).toBeTruthy()
  })

  it('aceitar de novo não muda o que foi gravado', async () => {
    const a = await resgatar(P_A, 'Publicado')
    await aceitar(a.token, { idioma: 'pt' })
    const primeira = await linha(a.id)
    expect(await aceitar(a.token, { idioma: 'es', texto: 'Quero que o Vive Gostoso me escreva outra coisa, tudo bem?' })).toMatchObject({ ok: true, ja_aceito: true })
    expect(await linha(a.id)).toMatchObject({ pergunta_idioma: 'pt', pergunta_texto: TEXTO_PERGUNTA })
    expect((await linha(a.id)).pergunta_aceita_em).toEqual(primeira.pergunta_aceita_em)
  })

  it('recusa token inválido, texto sem o Vive Gostoso, texto curto, versão e idioma ruins, e cupom cancelado', async () => {
    const a = await resgatar(P_A, 'Publicado')
    expect(await aceitar('x'.repeat(64))).toMatchObject({ ok: false, motivo: 'invalido' })
    expect(await aceitar('curto')).toMatchObject({ ok: false, motivo: 'invalido' })
    expect(await aceitar(a.token, { texto: 'Aceito receber qualquer mensagem da empresa por e-mail.' })).toMatchObject({ ok: false, motivo: 'consentimento' })
    expect(await aceitar(a.token, { texto: 'Vive Gostoso' })).toMatchObject({ ok: false, motivo: 'consentimento' })
    expect(await aceitar(a.token, { versao: 'ontem' })).toMatchObject({ ok: false, motivo: 'consentimento' })
    expect(await aceitar(a.token, { idioma: 'fr' })).toMatchObject({ ok: false, motivo: 'consentimento' })
    expect((await linha(a.id)).pergunta_aceita_em).toBeNull()
    await db.exec(`update public.gostoso_club_vouchers set status = 'cancelado' where id = '${a.id}'`)
    expect(await aceitar(a.token)).toMatchObject({ ok: false, motivo: 'cancelado' })
  })
})

describe('responder: usou ou não', () => {
  it('sim pelo token da pergunta: vira usado, com usado_via cliente e hora', async () => {
    const a = await resgatar(P_A, 'Publicado')
    expect(await responder(a.resposta_token, true)).toMatchObject({ ok: true, resposta: 'sim' })
    const l = await linha(a.id)
    expect(l).toMatchObject({ status: 'usado', usado_via: 'cliente', resposta_uso: 'sim' })
    expect(l.usado_em).toBeTruthy()
    expect(l.resposta_em).toBeTruthy()
  })

  it('sim pelo token do cupom também vale (aviso na página do cupom)', async () => {
    const a = await resgatar(P_A, 'Publicado')
    expect(await responder(a.token, true)).toMatchObject({ ok: true, resposta: 'sim' })
    expect((await linha(a.id)).usado_via).toBe('cliente')
  })

  it('sim é definitivo e repetir não muda a hora', async () => {
    const a = await resgatar(P_A, 'Publicado')
    await responder(a.resposta_token, true)
    const antes = await linha(a.id)
    expect(await responder(a.resposta_token, true)).toMatchObject({ ok: true, resposta: 'sim', ja_respondido: true })
    expect(await responder(a.resposta_token, false)).toMatchObject({ ok: true, resposta: 'sim', ja_respondido: true })
    const depois = await linha(a.id)
    expect(depois.usado_em).toEqual(antes.usado_em)
    expect(depois.resposta_uso).toBe('sim')
  })

  it('não registra a resposta e o cupom continua válido; depois pode virar sim', async () => {
    const a = await resgatar(P_A, 'Publicado')
    expect(await responder(a.resposta_token, false)).toMatchObject({ ok: true, resposta: 'nao' })
    expect(await linha(a.id)).toMatchObject({ status: 'valido', usado_em: null, usado_via: null, resposta_uso: 'nao' })
    expect(await responder(a.resposta_token, true)).toMatchObject({ ok: true, resposta: 'sim' })
    expect(await linha(a.id)).toMatchObject({ status: 'usado', usado_via: 'cliente', resposta_uso: 'sim' })
  })

  it('se o parceiro já deu baixa, fica a baixa dele e só a resposta é registrada', async () => {
    const a = await resgatar(P_A, 'Publicado')
    await db.exec(`update public.gostoso_club_vouchers set status = 'usado', usado_em = now() - interval '1 day', usado_via = 'painel' where id = '${a.id}'`)
    const antes = await linha(a.id)
    await responder(a.resposta_token, true)
    const depois = await linha(a.id)
    expect(depois).toMatchObject({ status: 'usado', usado_via: 'painel', resposta_uso: 'sim' })
    expect(depois.usado_em).toEqual(antes.usado_em)
  })

  it('token inválido, token de outro formato e cupom cancelado são recusados', async () => {
    const a = await resgatar(P_A, 'Publicado')
    expect(await responder('0'.repeat(64), true)).toMatchObject({ ok: false, motivo: 'invalido' })
    expect(await responder('abc', true)).toMatchObject({ ok: false, motivo: 'invalido' })
    await db.exec(`update public.gostoso_club_vouchers set status = 'cancelado' where id = '${a.id}'`)
    expect(await responder(a.resposta_token, true)).toMatchObject({ ok: false, motivo: 'cancelado' })
    expect((await linha(a.id)).status).toBe('cancelado')
  })

  it('o painel do parceiro continua contando: usado pelo cliente entra em usados_mes', async () => {
    const antes = await como<{ p: { usados_mes: number } }>(db, 'authenticated', IDS.usuarioDono, `select public.gostoso_club_painel('${P_A}') as p`)
    const a = await resgatar(P_A, 'Publicado')
    await responder(a.resposta_token, true)
    const depois = await como<{ p: { usados_mes: number } }>(db, 'authenticated', IDS.usuarioDono, `select public.gostoso_club_painel('${P_A}') as p`)
    expect(Number(depois.rows[0].p.usados_mes)).toBe(Number(antes.rows[0].p.usados_mes) + 1)
  })

  it('o parceiro que tenta dar baixa em cupom já usado pelo cliente recebe ja_usado', async () => {
    const a = await resgatar(P_A, 'Publicado')
    await responder(a.resposta_token, true)
    const r = await como<{ r: Resp }>(db, 'authenticated', IDS.usuarioDono, `select public.gostoso_club_marcar_usado('${P_A}', '${a.id}') as r`)
    expect(r.rows[0].r).toMatchObject({ ok: false, motivo: 'ja_usado' })
  })
})

describe('dados da página de resposta', () => {
  it('só primeiro nome, negócio e vantagem; nunca e-mail, telefone ou token', async () => {
    const a = await resgatar(P_A, 'Publicado')
    const r = await como<{ r: Record<string, unknown> }>(db, 'anon', null, `select public.gostoso_club_pergunta_dados('${a.resposta_token}') as r`)
    expect(r.rows[0].r).toMatchObject({ status: 'valido', primeiro_nome: 'Ana', negocio: 'Publicado', beneficio: '10% no primeiro passeio', resposta: null })
    const texto = JSON.stringify(r.rows[0].r)
    expect(texto).not.toContain('exemplo.com')
    expect(texto).not.toContain(a.token)
    expect(texto).not.toContain(a.resposta_token)
    const nada = await como<{ r: Record<string, unknown> }>(db, 'anon', null, `select public.gostoso_club_pergunta_dados('${'1'.repeat(64)}') as r`)
    expect(nada.rows[0].r).toEqual({ status: 'invalido' })
  })
})

describe('fila de envio', () => {
  it('só entra quem aceitou, no dia seguinte, ainda válido e sem resposta; reservar marca e não repete', async () => {
    const semAceite = await resgatar(P_B, 'Outro negocio')
    const recente = await resgatar(P_B, 'Outro negocio')
    const pronto = await resgatar(P_B, 'Outro negocio')
    const respondido = await resgatar(P_B, 'Outro negocio')
    const usado = await resgatar(P_B, 'Outro negocio')
    const velho = await resgatar(P_B, 'Outro negocio')
    for (const x of [recente, pronto, respondido, usado, velho]) await aceitar(x.token, { idioma: 'es' })
    for (const x of [semAceite, pronto, respondido, usado]) await envelhecer(x.id, 36)
    await envelhecer(velho.id, 24 * 8)
    await responder(respondido.resposta_token, false)
    await db.exec(`update public.gostoso_club_vouchers set status = 'usado', usado_em = now(), usado_via = 'painel' where id = '${usado.id}'`)

    const fila = await reservar()
    expect(fila.map((l) => l.id)).toEqual([pronto.id])
    const l = fila[0] as unknown as Record<string, unknown>
    expect(l).toMatchObject({ nome: 'Ana Souza', idioma: 'es', negocio: 'Outro negocio', beneficio: 'Sobremesa de cortesia', resposta_token: pronto.resposta_token })
    expect((await linha(pronto.id)).pergunta_enviada_em).toBeTruthy()
    expect(await reservar()).toEqual([])
  })

  it('as duas regras de tempo, com o relógio fixado: dia civil anterior E pelo menos 12 horas', async () => {
    const x = await resgatar(P_B, 'Outro negocio')
    await aceitar(x.token)
    // resgatado as 23:00 de Gostoso do dia 15 (02:00Z do dia 16)
    await db.exec(`update public.gostoso_club_vouchers set created_at = '2026-11-16T02:00:00Z' where id = '${x.id}'`)
    // 09:00 do dia 16: dia anterior, mas so 10 horas depois: ainda nao
    expect((await reservar(50, '2026-11-16T12:00:00Z')).map((l) => l.id)).not.toContain(x.id)
    // 11:00 do dia 16: 12 horas depois: entra
    expect((await reservar(50, '2026-11-16T14:00:00Z')).map((l) => l.id)).toContain(x.id)

    // resgatado as 06:00 do dia 15 (09:00Z): ja passam de 12 horas as 19:00 do mesmo dia, mas o dia civil e o mesmo
    const y = await resgatar(P_B, 'Outro negocio')
    await aceitar(y.token)
    await db.exec(`update public.gostoso_club_vouchers set created_at = '2026-11-15T09:00:00Z' where id = '${y.id}'`)
    expect((await reservar(50, '2026-11-15T23:00:00Z')).map((l) => l.id)).not.toContain(y.id)
    expect((await reservar(50, '2026-11-16T12:00:00Z')).map((l) => l.id)).toContain(y.id)
  })

  it('falha devolve para a fila, até 3 tentativas', async () => {
    const x = await resgatar(P_B, 'Outro negocio')
    await aceitar(x.token)
    await envelhecer(x.id, 36)
    for (let i = 0; i < 3; i++) {
      expect((await reservar()).map((l) => l.id)).toContain(x.id)
      await como(db, 'service_role', null, `select public.gostoso_club_pergunta_falhou('${x.id}')`)
    }
    expect((await linha(x.id)).pergunta_tentativas).toBe(3)
    expect((await reservar()).map((l) => l.id)).not.toContain(x.id)
  })

  it('contar devolve o mesmo que reservar entregaria, sem reservar nada', async () => {
    const x = await resgatar(P_B, 'Outro negocio')
    await aceitar(x.token)
    await envelhecer(x.id, 36)
    const c = await como<{ n: number }>(db, 'service_role', null, `select public.gostoso_club_pergunta_contar() as n`)
    expect(Number(c.rows[0].n)).toBeGreaterThanOrEqual(1)
    expect((await linha(x.id)).pergunta_enviada_em).toBeNull()
    const reservados = await reservar()
    const depois = await como<{ n: number }>(db, 'service_role', null, `select public.gostoso_club_pergunta_contar() as n`)
    expect(Number(c.rows[0].n)).toBe(reservados.length)
    expect(Number(depois.rows[0].n)).toBe(0)
  })

  it('o limite de uma rodada é respeitado', async () => {
    for (let i = 0; i < 3; i++) {
      const x = await resgatar(P_B, 'Outro negocio')
      await aceitar(x.token)
      await envelhecer(x.id, 36)
    }
    expect((await reservar(2)).length).toBe(2)
    expect((await reservar(10)).length).toBe(1)
  })

  it('só o serviço mexe na fila: anon, dono e admin são recusados', async () => {
    for (const [papel, usuario] of [
      ['anon', null],
      ['authenticated', IDS.usuarioDono],
      ['authenticated', IDS.usuarioAdmin],
    ] as const) {
      await expect(como(db, papel, usuario, `select * from public.gostoso_club_pergunta_reservar(5)`)).rejects.toThrow(/permission denied/)
      await expect(como(db, papel, usuario, `select public.gostoso_club_pergunta_contar()`)).rejects.toThrow(/permission denied/)
      await expect(como(db, papel, usuario, `select public.gostoso_club_pergunta_falhou('${IDS.perfilDono}')`)).rejects.toThrow(/permission denied/)
    }
  })
})

describe('quem lê o quê', () => {
  it('o dono não lê token da pergunta, consentimento da pergunta nem a resposta pela tabela', async () => {
    for (const coluna of ['resposta_token', 'pergunta_texto', 'pergunta_versao', 'pergunta_idioma', 'pergunta_enviada_em', 'resposta_uso']) {
      await expect(
        como(db, 'authenticated', IDS.usuarioDono, `select ${coluna} from public.gostoso_club_vouchers`),
      ).rejects.toThrow(/permission denied/)
    }
    await expect(como(db, 'authenticated', IDS.usuarioDono, 'select * from public.gostoso_club_vouchers')).rejects.toThrow(/permission denied/)
  })

  it('o dono ainda lê o que já lia, com usado_via', async () => {
    const r = await como(db, 'authenticated', IDS.usuarioDono, `select nome, status, usado_via from public.gostoso_club_vouchers where partner_id = '${P_A}'`)
    expect(r.rows.length).toBeGreaterThan(0)
  })

  it('números de uso: o dono vê os dele, o outro dono não vê, o admin vê, o anon é recusado', async () => {
    const dono = await como<{ p: Record<string, number> | null }>(db, 'authenticated', IDS.usuarioDono, `select public.gostoso_club_uso_painel('${P_A}') as p`)
    expect(dono.rows[0].p).toMatchObject({ usados_pelo_cliente: expect.any(Number), respostas_sim: expect.any(Number) })
    expect(Number(dono.rows[0].p!.usados_pelo_cliente)).toBeGreaterThan(0)
    expect(Number(dono.rows[0].p!.usados)).toBe(Number(dono.rows[0].p!.usados_pelo_cliente) + Number(dono.rows[0].p!.usados_pelo_parceiro))
    const outro = await como<{ p: unknown }>(db, 'authenticated', IDS.usuarioOutro, `select public.gostoso_club_uso_painel('${P_A}') as p`)
    expect(outro.rows[0].p).toBeNull()
    const admin = await como<{ p: unknown }>(db, 'authenticated', IDS.usuarioAdmin, `select public.gostoso_club_uso_painel('${P_A}') as p`)
    expect(admin.rows[0].p).not.toBeNull()
    await expect(como(db, 'anon', null, `select public.gostoso_club_uso_painel('${P_A}')`)).rejects.toThrow(/permission denied/)
  })

  it('a visão mensal é só do serviço e não traz dado pessoal', async () => {
    const r = await como<Record<string, unknown>>(db, 'service_role', null, 'select * from public.gostoso_club_uso_mensal')
    expect(r.rows.length).toBeGreaterThan(0)
    expect(Object.keys(r.rows[0])).not.toEqual(expect.arrayContaining(['email']))
    expect(Object.keys(r.rows[0])).toEqual(expect.arrayContaining(['usados_pelo_cliente', 'respostas_sim', 'respostas_nao']))
    for (const [papel, usuario] of [['anon', null], ['authenticated', IDS.usuarioAdmin]] as const) {
      await expect(como(db, papel, usuario, 'select * from public.gostoso_club_uso_mensal')).rejects.toThrow(/permission denied/)
    }
  })

  it('o anon não escreve nem lê a tabela, só chama as três funções públicas', async () => {
    await expect(como(db, 'anon', null, `update public.gostoso_club_vouchers set resposta_uso = 'sim'`)).rejects.toThrow(/permission denied/)
    await expect(como(db, 'anon', null, `select resposta_token from public.gostoso_club_vouchers`)).rejects.toThrow(/permission denied/)
  })
})
