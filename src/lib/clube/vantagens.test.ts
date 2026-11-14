import { describe, expect, it } from 'vitest'
import {
  formatarWhatsApp,
  interpretarUso,
  juntarRegra,
  limparContato,
  linkAgendamento,
  linkParaAmigo,
  origemValida,
  paraVantagem,
  textoParaAmigo,
} from './vantagens'

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

describe('paraVantagem: foto do card', () => {
  const base = {
    partner_id: 'p', business_id: 'b', nome: 'N', slug: 's', logo_url: null, tipo: null, beneficio: 'x1x',
    regra: null, limite_mensal: null, valido_ate: null, esgotada: false, status: 'no_ar',
  }
  it('leva a capa que o banco mandou; sem capa, null', () => {
    expect(paraVantagem({ ...base, capa_url: 'https://x.test/a.jpg' }).capaUrl).toBe('https://x.test/a.jpg')
    expect(paraVantagem({ ...base, capa_url: null }).capaUrl).toBeNull()
    expect(paraVantagem(base).capaUrl).toBeNull()
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

describe('agendamento previo', () => {
  const linha = {
    partner_id: 'p', business_id: 'b', nome: 'Casa Surya', slug: 'casa-surya', logo_url: null, tipo: 'Yoga',
    beneficio: '10% de desconto na primeira aula de yoga.', regra: null, limite_mensal: 5, valido_ate: '2026-11-30',
    status: 'no_ar', esgotada: false,
  }

  it('linha sem os campos novos (migration ainda nao rodou) vale como "nao exige"', () => {
    expect(paraVantagem(linha)).toMatchObject({ requerAgendamento: false, agendamentoContato: null, agendamentoCom: null })
  })

  it('linha com agendamento leva o contato so com digitos e o nome', () => {
    const v = paraVantagem({ ...linha, requer_agendamento: true, agendamento_contato: '5561981760790', agendamento_com: ' Satya ' })
    expect(v).toMatchObject({ requerAgendamento: true, agendamentoContato: '5561981760790', agendamentoCom: 'Satya' })
  })

  it('contato malformado nunca vira link, e sem exigencia o contato e ignorado', () => {
    expect(paraVantagem({ ...linha, requer_agendamento: true, agendamento_contato: 'abc' }).agendamentoContato).toBeNull()
    expect(paraVantagem({ ...linha, requer_agendamento: false, agendamento_contato: '5561981760790' }).agendamentoContato).toBeNull()
    expect(limparContato('(61) 98176-0790')).toBe('61981760790')
    expect(limparContato('123')).toBeNull()
    expect(limparContato(null)).toBeNull()
  })

  it('formata o WhatsApp brasileiro', () => {
    expect(formatarWhatsApp('5561981760790')).toBe('(61) 98176-0790')
    expect(formatarWhatsApp('61981760790')).toBe('(61) 98176-0790')
    expect(formatarWhatsApp('556132221234')).toBe('(61) 3222-1234')
  })

  it('o link leva ao numero certo com a mensagem pronta e sem ponto duplicado', () => {
    const url = linkAgendamento('5561981760790', 'Quero agendar: {beneficio} ({negocio}).', linha)
    expect(url.startsWith('https://wa.me/5561981760790?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Quero agendar: 10% de desconto na primeira aula de yoga (Casa Surya).')
  })

  it('texto do parceiro nao e lido como padrao de substituicao', () => {
    const url = linkAgendamento('5561981760790', '{negocio}', { nome: "Casa $& {beneficio}", beneficio: 'x' })
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Casa $& {beneficio}')
  })
})

describe('juntarRegra', () => {
  it('termina cada pedaco em ponto, sem duplicar, e ignora o vazio', () => {
    expect(juntarRegra(['Vale na primeira aula', 'Limite de 5 por mês', 'Válida até 30/11/2026'])).toBe(
      'Vale na primeira aula. Limite de 5 por mês. Válida até 30/11/2026.',
    )
    expect(juntarRegra(['Já tem ponto.', null, '', 'Limite de 5 por mês'])).toBe('Já tem ponto. Limite de 5 por mês.')
    expect(juntarRegra([null, undefined])).toBe('')
  })
})
