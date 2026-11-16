import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/* A rota de envio da pergunta (KAN-896). O que importa aqui e a TRAVA: sem segredo nada
   acontece, desligada nao envia, sem configuracao nao envia, fora do horario nao envia, e
   quando envia usa so o que a fila entregou. Banco e SMTP sao simulados. */

const enviar = vi.fn()
const rpc = vi.fn()

vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail: enviar }) } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ rpc }) }))

const TOKEN = 'b'.repeat(64)
const FILA = [
  { id: 'v1', nome: 'Ana Souza', email: 'ana@exemplo.com', idioma: 'pt', resposta_token: TOKEN, negocio: 'Damy', beneficio: 'Um cafezinho de cortesia.', codigo: 'ABCD2345', expira_em: '2026-12-01' },
]

const AMBIENTE = {
  CRON_SECRET: 'segredo-de-teste',
  NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'servico',
  SMTP_HOST: 'smtp.exemplo.test',
  SMTP_PORT: '587',
  SMTP_USER: 'u',
  SMTP_PASS: 'p',
  CLUBE_PERGUNTA_REMETENTE: 'Vive Gostoso <contato@vivegostoso.com.br>',
  CLUBE_PERGUNTA_ATIVA: '1',
}

function pedido(url = 'http://x/api/clube/perguntar', segredo: string | null = AMBIENTE.CRON_SECRET) {
  return new Request(url, { headers: segredo ? { authorization: `Bearer ${segredo}` } : {} })
}

async function chamar(req: Request) {
  const { GET } = await import('../../../app/api/clube/perguntar/route')
  const r = await GET(req)
  return { status: r.status, corpo: (await r.json()) as Record<string, unknown> }
}

beforeEach(() => {
  vi.resetModules()
  enviar.mockReset().mockResolvedValue({})
  rpc.mockReset().mockImplementation(async (nome: string) => {
    if (nome === 'gostoso_club_pergunta_reservar') return { data: FILA, error: null }
    if (nome === 'gostoso_club_pergunta_contar') return { data: 3, error: null }
    return { data: null, error: null }
  })
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] })
  vi.setSystemTime(new Date('2026-11-17T13:00:00Z')) // 10:00 em Gostoso
  for (const [k, v] of Object.entries(AMBIENTE)) vi.stubEnv(k, v)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

async function chamarComRelogio(req: Request) {
  const p = chamar(req)
  await vi.runAllTimersAsync()
  return p
}

describe('autorização', () => {
  it('sem cabeçalho, com segredo errado ou sem CRON_SECRET no ambiente: 401 e nada é tocado', async () => {
    expect((await chamar(pedido(undefined, null))).status).toBe(401)
    expect((await chamar(pedido(undefined, 'errado'))).status).toBe(401)
    vi.stubEnv('CRON_SECRET', '')
    expect((await chamar(pedido(undefined, ''))).status).toBe(401)
    expect(rpc).not.toHaveBeenCalled()
    expect(enviar).not.toHaveBeenCalled()
  })
})

describe('trava de liga e desliga', () => {
  it('sem CLUBE_PERGUNTA_ATIVA=1 não faz nada', async () => {
    vi.stubEnv('CLUBE_PERGUNTA_ATIVA', '')
    expect((await chamarComRelogio(pedido())).corpo).toEqual({ estado: 'desligado' })
    vi.stubEnv('CLUBE_PERGUNTA_ATIVA', 'true')
    expect((await chamarComRelogio(pedido())).corpo).toEqual({ estado: 'desligado' })
    expect(rpc).not.toHaveBeenCalled()
    expect(enviar).not.toHaveBeenCalled()
  })

  it('ligada mas sem credencial de e-mail: diz o que falta e não reserva a fila', async () => {
    vi.stubEnv('SMTP_PASS', '')
    const r = await chamarComRelogio(pedido())
    expect(r.corpo).toEqual({ estado: 'sem_configuracao', faltam: ['SMTP_PASS'] })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('fora das 9h às 20h de Gostoso não reserva nem envia', async () => {
    vi.setSystemTime(new Date('2026-11-17T04:00:00Z')) // 01:00 em Gostoso
    expect((await chamarComRelogio(pedido())).corpo).toEqual({ estado: 'fora_da_janela' })
    expect(rpc).not.toHaveBeenCalled()
    expect(enviar).not.toHaveBeenCalled()
  })

  it('o ensaio (?seco=1) só conta, mesmo desligada e fora do horário, e não reserva nem envia', async () => {
    vi.stubEnv('CLUBE_PERGUNTA_ATIVA', '')
    vi.setSystemTime(new Date('2026-11-17T04:00:00Z'))
    const r = await chamarComRelogio(pedido('http://x/api/clube/perguntar?seco=1'))
    expect(r.corpo).toEqual({ estado: 'seco', na_fila: 3, ativa: false })
    expect(rpc.mock.calls.map((c) => c[0])).toEqual(['gostoso_club_pergunta_contar'])
    expect(enviar).not.toHaveBeenCalled()
  })
})

describe('envio', () => {
  it('manda um e-mail por linha da fila, para o endereço certo, com o link da pergunta e sem o do cupom', async () => {
    const r = await chamarComRelogio(pedido())
    expect(r.corpo).toEqual({ estado: 'enviado', reservados: 1, enviados: 1, falhas: 0 })
    expect(enviar).toHaveBeenCalledTimes(1)
    const msg = enviar.mock.calls[0][0] as { to: string; from: string; subject: string; text: string; replyTo: string }
    expect(msg.to).toBe('ana@exemplo.com')
    expect(msg.from).toBe(AMBIENTE.CLUBE_PERGUNTA_REMETENTE)
    expect(msg.subject).toContain('Damy')
    expect(msg.text).toContain(`https://www.vivegostoso.com.br/clube/usei/${TOKEN}`)
    expect(msg.text).not.toContain('/clube/cupom/')
  })

  it('a resposta e a rodada não carregam e-mail nem nome', async () => {
    const r = await chamarComRelogio(pedido())
    expect(JSON.stringify(r.corpo)).not.toContain('exemplo.com')
    expect(JSON.stringify(r.corpo)).not.toContain('Ana')
  })

  it('falha de SMTP devolve a linha para a fila e conta a falha', async () => {
    enviar.mockRejectedValueOnce(new Error('smtp fora'))
    const r = await chamarComRelogio(pedido())
    expect(r.corpo).toEqual({ estado: 'enviado', reservados: 1, enviados: 0, falhas: 1 })
    expect(rpc).toHaveBeenCalledWith('gostoso_club_pergunta_falhou', { p_id: 'v1' })
  })

  it('linha torta da fila não vira e-mail e volta para a fila', async () => {
    rpc.mockImplementation(async (nome: string) =>
      nome === 'gostoso_club_pergunta_reservar' ? { data: [{ ...FILA[0], email: 'sem-arroba' }], error: null } : { data: null, error: null },
    )
    const r = await chamarComRelogio(pedido())
    expect(r.corpo).toMatchObject({ enviados: 0, falhas: 1 })
    expect(enviar).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith('gostoso_club_pergunta_falhou', { p_id: 'v1' })
  })

  it('erro do banco na reserva: 500 e nenhum envio', async () => {
    rpc.mockImplementation(async () => ({ data: null, error: { message: 'x' } }))
    const r = await chamarComRelogio(pedido())
    expect(r.status).toBe(500)
    expect(enviar).not.toHaveBeenCalled()
  })
})
