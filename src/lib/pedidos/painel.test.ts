import { describe, expect, it } from 'vitest'
import {
  agrupar,
  brl,
  cardapioPorSecao,
  idsNovos,
  idsRecebidos,
  lerPreco,
  lojaRecebePedidos,
  minutosDesde,
  passoSeguinte,
  podeRecusar,
  resumoDeHoje,
  tituloDaAba,
  validarItemNovo,
  validarLoja,
  type ItemDoCardapio,
  type LojaDoDono,
  type PedidoDoDono,
  type StatusPedido,
} from './painel'

const AGORA = new Date('2026-11-17T15:00:00Z') // 12h em Gostoso

const pedido = (id: string, status: StatusPedido, o: Partial<PedidoDoDono> = {}): PedidoDoDono => ({
  id,
  status,
  total: 40,
  subtotal: 34,
  taxaEntrega: 6,
  formaPagto: 'pix',
  trocoPara: null,
  endereco: 'Rua das Dunas, 10',
  mesa: null,
  criadoEm: '2026-11-17T14:50:00Z',
  itens: [{ nome: 'Pizza', opcao: null, qtd: 1, preco: 34 }],
  ...o,
})

describe('passoSeguinte: o que o dono pode fazer com o pedido', () => {
  it('segue recebido, aceito, preparo, pronto', () => {
    expect(passoSeguinte({ status: 'recebido', mesa: null })?.para).toBe('aceito')
    expect(passoSeguinte({ status: 'aceito', mesa: null })?.para).toBe('preparo')
    expect(passoSeguinte({ status: 'preparo', mesa: null })?.para).toBe('pronto')
  })

  it('pedido de entrega pronto fica com o entregador: o dono nao tem passo', () => {
    expect(passoSeguinte({ status: 'pronto', mesa: null })).toBeNull()
    expect(passoSeguinte({ status: 'a_caminho', mesa: null })).toBeNull()
  })

  it('pedido de mesa pronto o dono entrega na mesa', () => {
    expect(passoSeguinte({ status: 'pronto', mesa: '7' })?.para).toBe('entregue')
  })

  it('pedido encerrado nao tem passo', () => {
    expect(passoSeguinte({ status: 'entregue', mesa: null })).toBeNull()
    expect(passoSeguinte({ status: 'cancelado', mesa: '3' })).toBeNull()
  })

  it('so o pedido recem-chegado pode ser recusado', () => {
    expect(podeRecusar({ status: 'recebido' })).toBe(true)
    for (const s of ['aceito', 'preparo', 'pronto', 'a_caminho', 'entregue', 'cancelado'] as const) {
      expect(podeRecusar({ status: s })).toBe(false)
    }
  })
})

describe('agrupar', () => {
  it('separa em novos, preparo, prontos e encerrados', () => {
    const g = agrupar(
      [
        pedido('a', 'recebido'),
        pedido('b', 'aceito'),
        pedido('c', 'preparo'),
        pedido('d', 'pronto'),
        pedido('e', 'a_caminho'),
        pedido('f', 'entregue'),
        pedido('g', 'cancelado'),
      ],
      AGORA,
    )
    expect(g.novos.map((p) => p.id)).toEqual(['a'])
    expect(g.preparo.map((p) => p.id)).toEqual(['b', 'c'])
    expect(g.prontos.map((p) => p.id)).toEqual(['d', 'e'])
    expect(g.encerrados.map((p) => p.id).sort()).toEqual(['f', 'g'])
  })

  it('o que espera ha mais tempo vem primeiro; encerrado do mais novo para o mais velho', () => {
    const g = agrupar(
      [
        pedido('novo', 'recebido', { criadoEm: '2026-11-17T14:55:00Z' }),
        pedido('velho', 'recebido', { criadoEm: '2026-11-17T14:40:00Z' }),
        pedido('e1', 'entregue', { criadoEm: '2026-11-17T10:00:00Z' }),
        pedido('e2', 'entregue', { criadoEm: '2026-11-17T13:00:00Z' }),
      ],
      AGORA,
    )
    expect(g.novos.map((p) => p.id)).toEqual(['velho', 'novo'])
    expect(g.encerrados.map((p) => p.id)).toEqual(['e2', 'e1'])
  })

  it('encerrado com mais de 24 horas sai da tela', () => {
    const g = agrupar(
      [pedido('antigo', 'entregue', { criadoEm: '2026-11-16T14:59:00Z' }), pedido('ontem', 'entregue', { criadoEm: '2026-11-16T15:01:00Z' })],
      AGORA,
    )
    expect(g.encerrados.map((p) => p.id)).toEqual(['ontem'])
  })

  it('nao altera a lista recebida', () => {
    const lista = [pedido('b', 'recebido', { criadoEm: '2026-11-17T14:59:00Z' }), pedido('a', 'recebido', { criadoEm: '2026-11-17T14:30:00Z' })]
    agrupar(lista, AGORA)
    expect(lista.map((p) => p.id)).toEqual(['b', 'a'])
  })
})

describe('idsNovos: o alarme so toca para pedido que chegou depois', () => {
  it('na primeira leitura nada e novo', () => {
    expect(idsNovos(null, [pedido('a', 'recebido')])).toEqual([])
  })

  it('devolve so o recebido que nao estava na leitura anterior', () => {
    const antes = idsRecebidos([pedido('a', 'recebido')])
    expect(idsNovos(antes, [pedido('a', 'recebido'), pedido('b', 'recebido'), pedido('c', 'aceito')])).toEqual(['b'])
  })

  it('pedido que ja estava e mudou de estado nao vira novo', () => {
    const antes = idsRecebidos([pedido('a', 'recebido')])
    expect(idsNovos(antes, [pedido('a', 'aceito')])).toEqual([])
  })

  it('guarda como visto so os recebidos', () => {
    const vistos = idsRecebidos([pedido('a', 'recebido'), pedido('b', 'aceito')])
    expect([...vistos]).toEqual(['a'])
  })
})

describe('lerPreco', () => {
  it('aceita virgula, ponto e R$', () => {
    expect(lerPreco('12,5')).toBe(12.5)
    expect(lerPreco('12.50')).toBe(12.5)
    expect(lerPreco('R$ 12,50')).toBe(12.5)
    expect(lerPreco(' 8 ')).toBe(8)
  })

  it('aceita milhar com ponto e virgula decimal', () => {
    expect(lerPreco('1.234,50')).toBe(1234.5)
  })

  it('recusa vazio, zero, negativo, texto e mais de duas casas', () => {
    for (const ruim of ['', '   ', '0', '0,00', '-5', 'abc', '12,345', '1,2,3', '12e3', 'R$']) {
      expect(lerPreco(ruim), ruim).toBeNull()
    }
  })

  it('o teto e o do banco: 5.000', () => {
    expect(lerPreco('5000')).toBe(5000)
    expect(lerPreco('5000,01')).toBeNull()
  })
})

describe('validarItemNovo', () => {
  it('aceita item completo e limpa os espacos', () => {
    expect(validarItemNovo({ nome: '  Pizza grande ', secao: ' Pizzas ', preco: '59,90' })).toEqual({ ok: true, nome: 'Pizza grande', secao: 'Pizzas', preco: 59.9 })
  })

  it('diz qual campo esta ruim', () => {
    expect(validarItemNovo({ nome: ' ', secao: 'Pizzas', preco: '10' })).toEqual({ ok: false, motivo: 'nome' })
    expect(validarItemNovo({ nome: 'x', secao: '', preco: '10' })).toEqual({ ok: false, motivo: 'secao' })
    expect(validarItemNovo({ nome: 'x', secao: 'y', preco: 'dez' })).toEqual({ ok: false, motivo: 'preco' })
  })

  it('respeita os limites de tamanho do banco (nome 120, secao 40)', () => {
    expect(validarItemNovo({ nome: 'a'.repeat(121), secao: 'y', preco: '1' })).toEqual({ ok: false, motivo: 'nome' })
    expect(validarItemNovo({ nome: 'a'.repeat(120), secao: 'y', preco: '1' }).ok).toBe(true)
    expect(validarItemNovo({ nome: 'x', secao: 'y'.repeat(41), preco: '1' })).toEqual({ ok: false, motivo: 'secao' })
  })
})

describe('validarLoja', () => {
  it('aceita horario e tempo dentro dos limites do banco', () => {
    expect(validarLoja({ horario: ' 18h as 23h ', tempoMin: '30', tempoMax: '45' })).toEqual({ ok: true, horario: '18h as 23h', tempoMin: 30, tempoMax: 45 })
  })

  it('horario vazio vira null', () => {
    expect(validarLoja({ horario: '  ', tempoMin: '30', tempoMax: '45' })).toEqual({ ok: true, horario: null, tempoMin: 30, tempoMax: 45 })
  })

  it('recusa horario com mais de 60 caracteres', () => {
    expect(validarLoja({ horario: 'a'.repeat(61), tempoMin: '30', tempoMax: '45' })).toEqual({ ok: false, motivo: 'horario' })
  })

  it('recusa tempo fora de 5 a 240 (minimo) e 5 a 300 (maximo), nao inteiro ou com maximo menor', () => {
    expect(validarLoja({ horario: '', tempoMin: '4', tempoMax: '45' })).toEqual({ ok: false, motivo: 'tempo' })
    expect(validarLoja({ horario: '', tempoMin: '241', tempoMax: '300' })).toEqual({ ok: false, motivo: 'tempo' })
    expect(validarLoja({ horario: '', tempoMin: '30', tempoMax: '301' })).toEqual({ ok: false, motivo: 'tempo' })
    expect(validarLoja({ horario: '', tempoMin: '30.5', tempoMax: '45' })).toEqual({ ok: false, motivo: 'tempo' })
    expect(validarLoja({ horario: '', tempoMin: '', tempoMax: '45' })).toEqual({ ok: false, motivo: 'tempo' })
    expect(validarLoja({ horario: '', tempoMin: '45', tempoMax: '30' })).toEqual({ ok: false, motivo: 'tempo' })
  })
})

describe('textos e contas pequenas', () => {
  it('titulo da aba mostra a fila de novos', () => {
    expect(tituloDaAba('Pedidos', 0)).toBe('Pedidos')
    expect(tituloDaAba('Pedidos', 3)).toBe('(3) Pedidos')
  })

  it('minutos desde o pedido nunca fica negativo nem NaN', () => {
    expect(minutosDesde('2026-11-17T14:50:00Z', AGORA)).toBe(10)
    expect(minutosDesde('2026-11-17T15:10:00Z', AGORA)).toBe(0)
    expect(minutosDesde('lixo', AGORA)).toBe(0)
  })

  it('formata em reais', () => {
    expect(brl(12.5).replace(/\s/g, ' ')).toBe('R$ 12,50')
  })

  it('agrupa o cardapio por secao e usa Outros para secao vazia', () => {
    const item = (id: string, secao: string, ordem: number): ItemDoCardapio => ({ id, secao, nome: id, descricao: null, preco: 10, ativo: true, ordem })
    const g = cardapioPorSecao([item('c', 'Bebidas', 3), item('a', 'Pizzas', 1), item('b', 'Pizzas', 2), item('d', '  ', 4)])
    expect(g.map((s) => s.secao)).toEqual(['Pizzas', 'Bebidas', 'Outros'])
    expect(g[0].itens.map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('resumo de hoje conta so o dia de Gostoso e soma os itens, sem a taxa de entrega', () => {
    const venda = (id: string, status: StatusPedido, subtotal: number, criadoEm: string) => pedido(id, status, { subtotal, total: subtotal + 6, criadoEm })
    const r = resumoDeHoje(
      [
        venda('a', 'entregue', 40, '2026-11-17T13:00:00Z'),
        venda('b', 'entregue', 25.5, '2026-11-17T14:00:00Z'),
        venda('c', 'cancelado', 30, '2026-11-17T14:10:00Z'),
        venda('ontem', 'entregue', 99, '2026-11-16T14:00:00Z'),
        // 02h UTC de 18/11 ainda e 23h de 17/11 em Gostoso (UTC-3)
        venda('noite', 'entregue', 10, '2026-11-18T02:00:00Z'),
      ],
      new Date('2026-11-18T02:30:00Z'),
    )
    // 23h30 de 17/11 em Gostoso: a, b, c e "noite" sao de hoje; "ontem" nao. Soma 40 + 25,50 + 10 de itens (nao 46 + 31,50 + 16).
    expect(r).toEqual({ entregues: 3, receita: 75.5, cancelados: 1 })
    expect(resumoDeHoje([venda('a', 'entregue', 40, '2026-11-17T13:00:00Z'), venda('b', 'entregue', 25.5, '2026-11-17T14:00:00Z'), venda('c', 'cancelado', 30, '2026-11-17T14:10:00Z')], AGORA)).toEqual({ entregues: 2, receita: 65.5, cancelados: 1 })
  })

  it('a loja so recebe pedido com entrega ou mesa ligadas pela Vive', () => {
    const loja = (o: Partial<LojaDoDono>): LojaDoDono => ({ businessId: 'b', entregaAtiva: false, mesaAtiva: false, aberto: true, tempoMin: 30, tempoMax: 45, pedidoMinimo: 0, taxaEntrega: 6, horario: null, ...o })
    expect(lojaRecebePedidos(null)).toBe(false)
    expect(lojaRecebePedidos(loja({}))).toBe(false)
    expect(lojaRecebePedidos(loja({ entregaAtiva: true }))).toBe(true)
    expect(lojaRecebePedidos(loja({ mesaAtiva: true }))).toBe(true)
  })
})
