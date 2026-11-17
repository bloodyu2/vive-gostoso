import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { passoSeguinte, type StatusPedido } from './painel'

// As chaves que a aba Pedidos monta em tempo de execucao (`pedidos_status_${status}` e afins)
// nao passam pelo conferidor de traducoes (scripts/check-i18n.mjs, que so le texto literal).
// Este teste garante que cada valor possivel tem texto nos tres idiomas.

const abas = (lang: string): Record<string, string> =>
  JSON.parse(readFileSync(resolve(__dirname, `../../locales/${lang}.json`), 'utf8')).painel.abas

const STATUS: StatusPedido[] = ['recebido', 'aceito', 'preparo', 'pronto', 'a_caminho', 'entregue', 'cancelado']
const PAGTO = ['pix', 'cartao_entrega', 'dinheiro']
const FASES = ['ofertando', 'geral', 'aguardando_pronto', 'atribuido', 'encerrado', 'desconhecida']
const CHAVES_DE_ACAO = new Set(
  STATUS.flatMap((s) => [passoSeguinte({ status: s, mesa: null }), passoSeguinte({ status: s, mesa: '7' })])
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => p.chave),
)
const MOTIVOS_DO_ITEM = ['nome', 'secao', 'preco']
const MOTIVOS_DA_LOJA = ['horario', 'tempo']

describe('traducoes da aba Pedidos (pt, en, es)', () => {
  for (const lang of ['pt', 'en', 'es']) {
    it(`${lang}: todo valor montado em execucao tem texto`, () => {
      const a = abas(lang)
      const faltando: string[] = []
      const quer = (k: string) => {
        if (typeof a[k] !== 'string' || a[k].trim() === '') faltando.push(k)
      }
      STATUS.forEach((s) => quer(`pedidos_status_${s}`))
      PAGTO.forEach((p) => quer(`pedidos_pagto_${p}`))
      FASES.forEach((f) => quer(`pedidos_fase_${f}`))
      CHAVES_DE_ACAO.forEach((c) => quer(`pedidos_acao_${c}`))
      MOTIVOS_DO_ITEM.forEach((m) => quer(`cardapio_erro_${m}`))
      MOTIVOS_DA_LOJA.forEach((m) => quer(`loja_erro_${m}`))
      ;['pedidos', 'pedidos_sub_pedidos', 'pedidos_sub_cardapio', 'pedidos_sub_loja'].forEach(quer)
      expect(faltando).toEqual([])
    })

    it(`${lang}: sem travessao longo nem emoji nos textos novos`, () => {
      const a = abas(lang)
      const novos = Object.entries(a).filter(([k]) => k === 'pedidos' || k.startsWith('pedidos_') || k.startsWith('cardapio_') || k.startsWith('loja_'))
      expect(novos.length).toBeGreaterThan(90)
      for (const [k, v] of novos) {
        expect(v, k).not.toMatch(/—/)
        expect(v, k).not.toMatch(/\p{Extended_Pictographic}/u)
      }
    })
  }

  it('as acoes que a logica oferece sao exatamente as que a tela traduz', () => {
    expect([...CHAVES_DE_ACAO].sort()).toEqual(['aceitar', 'entregue_mesa', 'preparar', 'pronto'])
  })
})
