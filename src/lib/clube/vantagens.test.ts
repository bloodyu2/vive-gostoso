import { describe, expect, it } from 'vitest'
import { interpretarUso, linkParaAmigo, origemValida, paraVantagem, textoParaAmigo } from './vantagens'

describe('interpretarUso', () => {
  it('uso ok devolve o código', () => {
    expect(interpretarUso({ ok: true, codigo: 'GOSTOSO-4821', restantes: null }, null)).toEqual({
      tipo: 'codigo',
      codigo: 'GOSTOSO-4821',
    })
  })
  it('traduz cada motivo de recusa', () => {
    expect(interpretarUso({ ok: false, motivo: 'esgotada' }, null)).toEqual({ tipo: 'erro', motivo: 'esgotada' })
    expect(interpretarUso({ ok: false, motivo: 'muitos' }, null)).toEqual({ tipo: 'erro', motivo: 'muitos' })
    expect(interpretarUso({ ok: false, motivo: 'indisponivel' }, null)).toEqual({ tipo: 'erro', motivo: 'indisponivel' })
    expect(interpretarUso({ ok: false, motivo: 'qualquer outra' }, null)).toEqual({ tipo: 'erro', motivo: 'indisponivel' })
  })
  it('erro de rede ou resposta vazia vira erro genérico, nunca código', () => {
    expect(interpretarUso(null, { message: 'boom' })).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarUso(null, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarUso({ ok: true }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarUso({ ok: true, codigo: 'qualquer coisa' }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
  })
})

describe('origemValida', () => {
  it('aceita só dois dígitos', () => {
    expect(origemValida('07')).toBe('07')
    expect(origemValida(['03', '04'])).toBe('03')
    expect(origemValida('7')).toBeNull()
    expect(origemValida('0x')).toBeNull()
    expect(origemValida("1'; drop")).toBeNull()
    expect(origemValida(undefined)).toBeNull()
  })
})

describe('mandar para um amigo', () => {
  const v = { nome: 'Gostoso Expedições', beneficio: '5% de desconto no Pix ou em espécie, em qualquer passeio.' }
  it('monta o texto curto com o link e sem ponto duplicado', () => {
    const texto = textoParaAmigo('Olha: {beneficio} ({nome}). Grátis: {link}', v, 'https://www.vivegostoso.com.br/clube')
    expect(texto).toBe(
      'Olha: 5% de desconto no Pix ou em espécie, em qualquer passeio (Gostoso Expedições). Grátis: https://www.vivegostoso.com.br/clube',
    )
  })
  it('texto do parceiro com $& ou {link} não é interpretado como substituição', () => {
    const v2 = { nome: 'Bar $& do Zé', beneficio: 'Ganhe {link} e $1 de desconto' }
    const texto = textoParaAmigo('{nome}: {beneficio}. {link}', v2, 'https://x.test/clube')
    expect(texto).toBe('Bar $& do Zé: Ganhe {link} e $1 de desconto. https://x.test/clube')
  })
  it('o link é wa.me sem número, com o texto codificado', () => {
    const link = linkParaAmigo('oi amigo')
    expect(link).toBe('https://wa.me/?text=oi%20amigo')
  })
})

describe('paraVantagem', () => {
  it('status desconhecido cai em combinação, nunca no ar', () => {
    const base = {
      partner_id: 'p', business_id: 'b', nome: 'N', slug: 's', logo_url: null, tipo: null, beneficio: 'x1x',
      regra: null, limite_mensal: null, valido_ate: null, esgotada: false,
    }
    expect(paraVantagem({ ...base, status: 'no_ar' }).status).toBe('no_ar')
    expect(paraVantagem({ ...base, status: 'pausado' }).status).toBe('em_combinacao')
    expect(paraVantagem({ ...base, status: 'em_combinacao' }).status).toBe('em_combinacao')
  })
})
