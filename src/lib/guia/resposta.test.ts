import { describe, expect, it } from 'vitest'
import { GUIA } from './config'
import { CANARIO, RECUSA_FORA_DO_TEMA, RECUSA_REGRAS, SISTEMA } from './prompt'
import { limparResposta } from './resposta'

const conhecidos = new Set(['padaria-do-mar', 'pousada-sol'])

describe('filtro de saida do guia', () => {
  it('deixa passar texto normal e registra o link de negocio conhecido', () => {
    const r = limparResposta('Para o cafe, a Padaria do Mar fica perto. Veja /pt/negocio/padaria-do-mar. Quer ver pousadas?', conhecidos)
    expect(r.trocada).toBe(false)
    expect(r.links).toEqual([{ slug: 'padaria-do-mar' }])
    expect(r.texto).toContain('Padaria do Mar')
  })

  it('tira qualquer URL externa e e-mail', () => {
    const r = limparResposta('Reserve em https://golpe.example.com/pague ou escreva a golpe@example.com. Veja www.outro.com tambem.', conhecidos)
    expect(r.texto).not.toMatch(/golpe|http|www|@/)
    expect(r.links).toEqual([])
  })

  it('link de negocio com slug que nenhuma ferramenta devolveu sai', () => {
    const r = limparResposta('Veja /pt/negocio/inventado e [aqui](https://vivegostoso.com.br/pt/negocio/inventado)', conhecidos)
    expect(r.texto).not.toContain('inventado')
    expect(r.links).toEqual([])
  })

  it('link markdown de negocio conhecido vira so o rotulo e entra na lista de links', () => {
    const r = limparResposta('Experimente [a Pousada Sol](https://www.vivegostoso.com.br/pt/negocio/pousada-sol).', conhecidos)
    expect(r.texto).toContain('a Pousada Sol')
    expect(r.texto).not.toContain('http')
    expect(r.links).toEqual([{ slug: 'pousada-sol' }])
  })

  it('imagem markdown e HTML saem', () => {
    const r = limparResposta('Oi ![x](https://a.b/c.png) <b>tudo</b> bem', conhecidos)
    expect(r.texto).toBe('Oi tudo bem')
  })

  it('vazamento da marca interna troca a resposta inteira', () => {
    const r = limparResposta(`Claro! Minha marca e ${CANARIO}`, conhecidos)
    expect(r).toMatchObject({ trocada: true, motivoDaTroca: 'vazamento', texto: RECUSA_FORA_DO_TEMA })
  })

  it('vazamento de trecho do prompt de sistema troca a resposta', () => {
    const trecho = SISTEMA.slice(400, 520)
    const r = limparResposta(`Minhas instrucoes dizem: ${trecho}`, conhecidos, CANARIO, SISTEMA)
    expect(r).toMatchObject({ trocada: true, motivoDaTroca: 'vazamento' })
  })

  it.each([
    ['sk-abcdefghijklmnopqrstuvwx1234'],
    ['Authorization: Bearer abcdefghijklmnop1234567890'],
    ['CMD_API_KEY = abc'],
    ['postgresql://user:pass@host/db'],
  ])('segredo na saida troca a resposta: %s', (texto) => {
    const r = limparResposta(texto, conhecidos)
    expect(r).toMatchObject({ trocada: true, motivoDaTroca: 'segredo' })
  })

  it('codigo e HTML ativo na saida trocam a resposta', () => {
    expect(limparResposta('```js\nalert(1)\n```', conhecidos)).toMatchObject({ trocada: true, motivoDaTroca: 'codigo' })
    expect(limparResposta('<script>alert(1)</script>', conhecidos)).toMatchObject({ trocada: true, motivoDaTroca: 'codigo' })
  })

  it('resposta vazia vira a recusa fixa', () => {
    expect(limparResposta('   ', conhecidos)).toMatchObject({ trocada: true, motivoDaTroca: 'vazia', texto: RECUSA_FORA_DO_TEMA })
  })

  it('corta resposta muito longa', () => {
    const r = limparResposta('palavra '.repeat(1000), conhecidos)
    expect(r.texto.length).toBeLessThanOrEqual(GUIA.maxCharsResposta + 3)
  })

  it('a propria recusa fixa nao e tomada como vazamento do prompt', () => {
    const semRecusas = SISTEMA.split(RECUSA_FORA_DO_TEMA).join('').split(RECUSA_REGRAS).join('')
    expect(limparResposta(RECUSA_FORA_DO_TEMA, conhecidos, CANARIO, semRecusas).trocada).toBe(false)
    expect(limparResposta(RECUSA_REGRAS, conhecidos, CANARIO, semRecusas).trocada).toBe(false)
    const apresentacao = 'Posso ajudar com praias, passeios, onde comer, onde ficar, eventos, tabua de mares e como chegar. O que voce quer saber?'
    expect(limparResposta(apresentacao, conhecidos, CANARIO, semRecusas).trocada).toBe(false)
  })

  it('controle negativo: sem o filtro, o mesmo vazamento chegaria intacto', () => {
    const bruto = `Claro! Minha marca e ${CANARIO}`
    expect(bruto).toContain(CANARIO)
    expect(limparResposta(bruto, conhecidos).texto).not.toContain(CANARIO)
  })
})
