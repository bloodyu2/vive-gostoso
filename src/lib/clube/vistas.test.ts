import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  MAX_IDS_POR_CHAMADA,
  cartaoVisivel,
  chaveDaVista,
  criarRegistradorDeVistas,
  type ArmazemDeVistas,
} from './vistas'

/* KAN-998: a lista do /clube mandava os ids de TODOS os parceiros a cada visita, e o banco
   soma 1 por id recebido. Resultado: todo parceiro com o mesmo n, que era so o numero de
   visitas a lista. Estes testes fixam o contrato novo: so o parceiro cujo cartao a pessoa
   viu entra, uma vez por dia por aparelho. */

function ambiente(dia = '2026-11-27') {
  const enviados: string[][] = []
  const fila: { fn: () => void; ms: number; vivo: boolean }[] = []
  const guardado = new Map<string, string>()
  const armazem: ArmazemDeVistas = {
    getItem: (k) => guardado.get(k) ?? null,
    setItem: (k, v) => void guardado.set(k, v),
  }
  const estado = { dia }
  const registrador = (opcoes: { armazem?: ArmazemDeVistas | null; memoria?: Set<string> } = {}) =>
    criarRegistradorDeVistas({
      dia: () => estado.dia,
      armazem: opcoes.armazem === undefined ? armazem : opcoes.armazem,
      memoria: opcoes.memoria ?? new Set(),
      enviar: (ids) => enviados.push(ids),
      agendar: (fn, ms) => {
        const item = { fn, ms, vivo: true }
        fila.push(item)
        return item
      },
      cancelar: (h) => {
        ;(h as { vivo: boolean }).vivo = false
      },
    })
  const disparar = () => {
    for (const item of fila.splice(0)) if (item.vivo) item.fn()
  }
  return { enviados, guardado, estado, registrador, disparar, fila }
}

describe('registrador de vistas', () => {
  it('manda so o parceiro que a pessoa viu, nunca a lista inteira', () => {
    const a = ambiente()
    const r = a.registrador()
    // a pagina tem tres parceiros; so o segundo ficou na tela
    r.vi('parceiro-2')
    a.disparar()
    expect(a.enviados).toEqual([['parceiro-2']])
  })

  it('junta o que foi visto na mesma janela em uma chamada so', () => {
    const a = ambiente()
    const r = a.registrador()
    r.vi('p1')
    r.vi('p2')
    r.vi('p3')
    expect(a.enviados).toEqual([])
    expect(a.fila).toHaveLength(1)
    a.disparar()
    expect(a.enviados).toEqual([['p1', 'p2', 'p3']])
  })

  it('o mesmo parceiro no mesmo dia conta uma vez, mesmo reabrindo a pagina', () => {
    const a = ambiente()
    const primeira = a.registrador()
    primeira.vi('p1')
    a.disparar()
    // outra montagem da lista (filtro, navegacao): memoria nova, armazem da aba igual
    const segunda = a.registrador()
    expect(segunda.vi('p1')).toBe(false)
    a.disparar()
    expect(a.enviados).toEqual([['p1']])
  })

  it('no dia seguinte o mesmo parceiro conta de novo', () => {
    const a = ambiente('2026-11-27')
    const r = a.registrador()
    r.vi('p1')
    a.disparar()
    a.estado.dia = '2026-11-28'
    expect(r.vi('p1')).toBe(true)
    a.disparar()
    expect(a.enviados).toEqual([['p1'], ['p1']])
  })

  it('sem sessionStorage (ou com ele lancando erro) ainda nao conta duas vezes na mesma pagina', () => {
    const a = ambiente()
    const quebrado: ArmazemDeVistas = {
      getItem: () => {
        throw new Error('bloqueado')
      },
      setItem: () => {
        throw new Error('bloqueado')
      },
    }
    const memoria = new Set<string>()
    const r = a.registrador({ armazem: quebrado, memoria })
    expect(r.vi('p1')).toBe(true)
    expect(r.vi('p1')).toBe(false)
    const semArmazem = a.registrador({ armazem: null, memoria: new Set(['x']) })
    expect(semArmazem.vi('p9')).toBe(true)
    a.disparar()
    expect(a.enviados.flat().sort()).toEqual(['p1', 'p9'])
  })

  it('respeita o teto de 30 ids por chamada que a funcao do banco aceita', () => {
    const a = ambiente()
    const r = a.registrador()
    for (let i = 0; i < MAX_IDS_POR_CHAMADA + 5; i++) r.vi(`p${i}`)
    a.disparar()
    expect(a.enviados.map((l) => l.length)).toEqual([MAX_IDS_POR_CHAMADA, 5])
  })

  it('esvaziar manda na hora o que esta pendente e cancela o agendamento', () => {
    const a = ambiente()
    const r = a.registrador()
    r.vi('p1')
    r.esvaziar()
    expect(a.enviados).toEqual([['p1']])
    a.disparar()
    expect(a.enviados).toEqual([['p1']])
  })

  it('id vazio nao entra', () => {
    const a = ambiente()
    const r = a.registrador()
    expect(r.vi('')).toBe(false)
    a.disparar()
    expect(a.enviados).toEqual([])
  })

  it('a chave guarda o dia e o parceiro', () => {
    expect(chaveDaVista('2026-11-27', 'abc')).toBe('vg-clube-vista-2026-11-27-abc')
  })
})

describe('cartao visivel', () => {
  it('metade do cartao na tela conta', () => {
    expect(cartaoVisivel({ ratio: 0.5, alturaVisivel: 200, alturaDaTela: 800 })).toBe(true)
    expect(cartaoVisivel({ ratio: 0.3, alturaVisivel: 120, alturaDaTela: 800 })).toBe(false)
  })

  it('cartao mais alto que a tela conta quando ocupa metade da tela', () => {
    expect(cartaoVisivel({ ratio: 0.2, alturaVisivel: 450, alturaDaTela: 800 })).toBe(true)
    expect(cartaoVisivel({ ratio: 0.2, alturaVisivel: 300, alturaDaTela: 800 })).toBe(false)
  })

  it('sem altura de tela, so vale a proporcao do cartao', () => {
    expect(cartaoVisivel({ ratio: 0.1, alturaVisivel: 900, alturaDaTela: 0 })).toBe(false)
  })
})

describe('a lista do /clube', () => {
  const fonte = readFileSync(resolve(process.cwd(), 'src/components/clube/lista-vantagens.tsx'), 'utf8')

  it('nao chama gostoso_club_registrar_vistas com a lista inteira de parceiros', () => {
    // Foi essa chamada, uma por visita com todos os ids, que deixou todos os parceiros
    // com o mesmo n. A chamada agora mora so em usar-vistas-por-cartao.ts, por cartao visto.
    expect(fonte).not.toContain('gostoso_club_registrar_vistas')
    expect(fonte).not.toMatch(/vantagens\.map\(\(v\) => v\.partnerId\)/)
  })

  it('liga a medicao por cartao', () => {
    expect(fonte).toContain('useVistasPorCartao')
    expect(fonte).toContain('data-parceiro')
  })
})
