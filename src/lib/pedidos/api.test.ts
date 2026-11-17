import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  COLUNAS_PEDIDO,
  ErroPainel,
  avancarPedido,
  criarItem,
  definirAberto,
  definirAtivo,
  faseDoDespacho,
  lerLoja,
  listarCardapio,
  listarPedidos,
  mudarPreco,
  pedidoDaLinha,
  recusarPedido,
  removerItem,
  salvarHorarioETempo,
  traduzirErro,
} from './api'

type Resposta = { data: unknown; error: { code?: string; message?: string; status?: number } | null; status?: number }

/** Cliente falso: guarda cada chamada encadeada e responde o que o teste mandou. Nada de rede. */
function falso(resposta: Resposta) {
  const chamadas: { alvo: string; passos: [string, unknown[]][] }[] = []
  const construir = (alvo: string) => {
    const passos: [string, unknown[]][] = []
    chamadas.push({ alvo, passos })
    const proxy: unknown = new Proxy(
      {},
      {
        get(_t, nome: string) {
          if (nome === 'then') return (ok: (v: Resposta) => unknown) => Promise.resolve(resposta).then(ok)
          return (...args: unknown[]) => {
            passos.push([nome, args])
            return proxy
          }
        },
      },
    )
    return proxy
  }
  const cliente = {
    from: (t: string) => construir(`from:${t}`),
    rpc: (fn: string, args: unknown) => {
      const p = construir(`rpc:${fn}`)
      ;(chamadas[chamadas.length - 1].passos as [string, unknown[]][]).push(['args', [args]])
      return p
    },
  } as unknown as SupabaseClient
  return { cliente, chamadas }
}

const ok = (data: unknown): Resposta => ({ data, error: null })

describe('traduzirErro', () => {
  it('42501, 401, 403 e PGRST301 viram sem_acesso', () => {
    expect(traduzirErro({ code: '42501' }).motivo).toBe('sem_acesso')
    expect(traduzirErro({ status: 401 }).motivo).toBe('sem_acesso')
    expect(traduzirErro({ status: 403 }).motivo).toBe('sem_acesso')
    expect(traduzirErro({ code: 'PGRST301' }).motivo).toBe('sem_acesso')
  })
  it('22023 vira passo_invalido e o resto falha', () => {
    expect(traduzirErro({ code: '22023' }).motivo).toBe('passo_invalido')
    expect(traduzirErro({ code: '08006', message: 'x' }).motivo).toBe('falha')
    expect(traduzirErro(null).motivo).toBe('falha')
  })
})

describe('leitura', () => {
  it('lista os pedidos do negocio, do mais novo para o mais velho, e converte numeric em numero', async () => {
    const linha = {
      id: 'p1',
      status: 'recebido',
      total: '40.00',
      subtotal: '34.00',
      taxa_entrega: '6.00',
      forma_pagto: 'dinheiro',
      troco_para: '50.00',
      endereco: 'Rua das Dunas, 10',
      mesa: null,
      criado_em: '2026-11-17T14:50:00Z',
      vg_app_pedido_itens: [{ nome: 'Pizza', opcao: 'Grande', qtd: 2, preco: '17.00' }],
    }
    const { cliente, chamadas } = falso(ok([linha]))
    const r = await listarPedidos(cliente, 'biz-1')
    expect(r).toEqual([
      {
        id: 'p1',
        status: 'recebido',
        total: 40,
        subtotal: 34,
        taxaEntrega: 6,
        formaPagto: 'dinheiro',
        trocoPara: 50,
        endereco: 'Rua das Dunas, 10',
        mesa: null,
        criadoEm: '2026-11-17T14:50:00Z',
        itens: [{ nome: 'Pizza', opcao: 'Grande', qtd: 2, preco: 17 }],
      },
    ])
    expect(chamadas[0].alvo).toBe('from:vg_app_pedidos')
    expect(chamadas[0].passos).toEqual([
      ['select', [COLUNAS_PEDIDO]],
      ['eq', ['business_id', 'biz-1']],
      ['order', ['criado_em', { ascending: false }]],
      ['limit', [100]],
    ])
  })

  it('pedido sem itens e troco nulo nao quebra', () => {
    const p = pedidoDaLinha({
      id: 'p2', status: 'aceito', total: 10, subtotal: 10, taxa_entrega: 0, forma_pagto: 'pix', troco_para: null, endereco: 'x y z', mesa: '4', criado_em: '2026-11-17T14:50:00Z', vg_app_pedido_itens: null,
    })
    expect(p.itens).toEqual([])
    expect(p.trocoPara).toBeNull()
    expect(p.mesa).toBe('4')
  })

  it('401 ou 403 que vem so no status da resposta (erro sem codigo) tambem vira sem_acesso', async () => {
    const { cliente } = falso({ data: null, error: { message: 'JWT expired' }, status: 401 })
    await expect(listarPedidos(cliente, 'biz-1')).rejects.toMatchObject({ motivo: 'sem_acesso' })
    const { cliente: c2 } = falso({ data: null, error: { message: 'x' }, status: 500 })
    await expect(listarPedidos(c2, 'biz-1')).rejects.toMatchObject({ motivo: 'falha' })
  })

  it('erro do servidor sobe como ErroPainel', async () => {
    const { cliente } = falso({ data: null, error: { code: '42501', message: 'negado' } })
    await expect(listarPedidos(cliente, 'biz-1')).rejects.toMatchObject({ name: 'ErroPainel', motivo: 'sem_acesso' })
  })

  it('le a loja e devolve null quando a Vive ainda nao criou', async () => {
    const { cliente: a } = falso(ok(null))
    expect(await lerLoja(a, 'biz-1')).toBeNull()
    const { cliente: b, chamadas } = falso(
      ok({ business_id: 'biz-1', entrega_ativa: true, mesa_ativa: false, aberto: true, tempo_min: 30, tempo_max: 45, pedido_minimo: '15.00', taxa_entrega: '6.00', horario: '18h as 23h' }),
    )
    expect(await lerLoja(b, 'biz-1')).toEqual({ businessId: 'biz-1', entregaAtiva: true, mesaAtiva: false, aberto: true, tempoMin: 30, tempoMax: 45, pedidoMinimo: 15, taxaEntrega: 6, horario: '18h as 23h' })
    expect(chamadas[0].alvo).toBe('from:vg_app_loja')
  })

  it('lista o cardapio em ordem e converte o preco', async () => {
    const { cliente, chamadas } = falso(ok([{ id: 'i1', secao: 'Pizzas', nome: 'Marguerita', descricao: null, preco: '49.90', ativo: true, ordem: 1 }]))
    expect(await listarCardapio(cliente, 'biz-1')).toEqual([{ id: 'i1', secao: 'Pizzas', nome: 'Marguerita', descricao: null, preco: 49.9, ativo: true, ordem: 1 }])
    expect(chamadas[0].passos.at(-1)).toEqual(['order', ['ordem', { ascending: true }]])
  })

  it('fase do despacho vem da funcao do banco', async () => {
    const { cliente, chamadas } = falso(ok({ fase: 'ofertando', tentativas: 1 }))
    expect(await faseDoDespacho(cliente, 'p1')).toBe('ofertando')
    expect(chamadas[0].alvo).toBe('rpc:vg_app_despacho_resumo')
    expect(chamadas[0].passos[0]).toEqual(['args', [{ p_tipo: 'pedido', p_ref: 'p1' }]])
  })
})

describe('pedido: chama as funcoes do banco, sem recalcular nada', () => {
  it('avancar usa vg_app_pedido_avancar com o passo pedido', async () => {
    const { cliente, chamadas } = falso(ok(null))
    await avancarPedido(cliente, 'p1', 'preparo')
    expect(chamadas[0].alvo).toBe('rpc:vg_app_pedido_avancar')
    expect(chamadas[0].passos[0]).toEqual(['args', [{ p_pedido: 'p1', p_para: 'preparo' }]])
  })

  it('recusar usa vg_app_pedido_recusar', async () => {
    const { cliente, chamadas } = falso(ok(null))
    await recusarPedido(cliente, 'p1')
    expect(chamadas[0].alvo).toBe('rpc:vg_app_pedido_recusar')
  })

  it('passo que o banco nao aceita (22023) sobe como passo_invalido', async () => {
    const { cliente } = falso({ data: null, error: { code: '22023', message: 'passo invalido' } })
    await expect(avancarPedido(cliente, 'p1', 'pronto')).rejects.toMatchObject({ motivo: 'passo_invalido' })
  })

  it('dono de outro negocio (42501) sobe como sem_acesso', async () => {
    const { cliente } = falso({ data: null, error: { code: '42501', message: 'sem acesso' } })
    await expect(recusarPedido(cliente, 'p1')).rejects.toBeInstanceOf(ErroPainel)
  })
})

describe('escritas: a RLS nega em silencio, entao zero linhas e erro', () => {
  const escritas: [string, (c: SupabaseClient) => Promise<void>][] = [
    ['definirAberto', (c) => definirAberto(c, 'biz-1', false)],
    ['salvarHorarioETempo', (c) => salvarHorarioETempo(c, 'biz-1', { horario: null, tempoMin: 30, tempoMax: 45 })],
    ['mudarPreco', (c) => mudarPreco(c, 'i1', 12.5)],
    ['definirAtivo', (c) => definirAtivo(c, 'i1', false)],
    ['criarItem', (c) => criarItem(c, 'biz-1', { secao: 'Pizzas', nome: 'X', preco: 10 })],
    ['removerItem', (c) => removerItem(c, 'i1')],
  ]

  for (const [nome, fazer] of escritas) {
    it(`${nome}: lista vazia vira sem_acesso`, async () => {
      const { cliente } = falso(ok([]))
      await expect(fazer(cliente)).rejects.toMatchObject({ motivo: 'sem_acesso' })
    })
    it(`${nome}: resposta nula vira sem_acesso`, async () => {
      const { cliente } = falso(ok(null))
      await expect(fazer(cliente)).rejects.toMatchObject({ motivo: 'sem_acesso' })
    })
    it(`${nome}: com linha de volta passa`, async () => {
      const { cliente } = falso(ok([{ id: 'x' }]))
      await expect(fazer(cliente)).resolves.toBeUndefined()
    })
  }

  it('cada escrita pede a linha de volta (select) e filtra pelo alvo', async () => {
    const { cliente, chamadas } = falso(ok([{ id: 'x' }]))
    await definirAberto(cliente, 'biz-1', true)
    await mudarPreco(cliente, 'i1', 12.5)
    await definirAtivo(cliente, 'i1', false)
    await removerItem(cliente, 'i1')
    await salvarHorarioETempo(cliente, 'biz-1', { horario: '18h', tempoMin: 20, tempoMax: 30 })
    expect(chamadas.map((c) => c.alvo)).toEqual(['from:vg_app_loja', 'from:vg_app_cardapio', 'from:vg_app_cardapio', 'from:vg_app_cardapio', 'from:vg_app_loja'])
    expect(chamadas[0].passos).toEqual([['update', [{ aberto: true }]], ['eq', ['business_id', 'biz-1']], ['select', ['business_id']]])
    expect(chamadas[1].passos).toEqual([['update', [{ preco: 12.5 }]], ['eq', ['id', 'i1']], ['select', ['id']]])
    expect(chamadas[2].passos).toEqual([['update', [{ ativo: false }]], ['eq', ['id', 'i1']], ['select', ['id']]])
    expect(chamadas[3].passos).toEqual([['delete', []], ['eq', ['id', 'i1']], ['select', ['id']]])
    expect(chamadas[4].passos[0]).toEqual(['update', [{ horario: '18h', tempo_min: 20, tempo_max: 30 }]])
  })

  it('item novo leva o negocio, a secao, o nome, o preco e a ordem quando vier', async () => {
    const { cliente, chamadas } = falso(ok([{ id: 'x' }]))
    await criarItem(cliente, 'biz-1', { secao: 'Pizzas', nome: 'Calabresa', preco: 39.9, ordem: 7 })
    await criarItem(cliente, 'biz-1', { secao: 'Pizzas', nome: 'Calabresa', preco: 39.9 })
    expect(chamadas[0].passos[0]).toEqual(['insert', [{ business_id: 'biz-1', secao: 'Pizzas', nome: 'Calabresa', preco: 39.9, ordem: 7 }]])
    expect(chamadas[1].passos[0]).toEqual(['insert', [{ business_id: 'biz-1', secao: 'Pizzas', nome: 'Calabresa', preco: 39.9 }]])
  })

  it('erro real do servidor vence a checagem de linhas', async () => {
    const { cliente } = falso({ data: null, error: { code: '23514', message: 'check' } })
    await expect(mudarPreco(cliente, 'i1', 99999)).rejects.toMatchObject({ motivo: 'falha' })
  })
})
