import { describe, expect, it } from 'vitest'
import {
  ABAS,
  abaDaUrl,
  abaPorTecla,
  abaValida,
  codigosDaPlaquinha,
  corteDaJanela,
  destinoDaRotaAntiga,
  diaMenos,
  filtrarLeads,
  hojeNoFuso,
  nomeDoArquivoCsv,
  queryDaAba,
  somarVistas,
  urlDaPlaquinha,
} from './painel-abas'
import { BOM, csvDeLeads, type LinhaLead } from './resgate'

const lead = (o: Partial<LinhaLead>): LinhaLead => ({
  nome: 'Ana Souza',
  email: 'ana@exemplo.com',
  telefone: '84999991234',
  codigo: '7K4Q9XMB',
  status: 'valido',
  created_at: '2026-11-05T15:30:00Z',
  expira_em: '2026-12-05',
  ...o,
})

describe('abas na URL', () => {
  it('so aceita as cinco abas, com ou sem #, em qualquer caixa', () => {
    expect(ABAS).toEqual(['resumo', 'perfil', 'passaporte', 'contatos', 'plaquinha'])
    expect(abaValida('contatos')).toBe('contatos')
    expect(abaValida('#Passaporte')).toBe('passaporte')
    expect(abaValida('qualquer')).toBeNull()
    expect(abaValida(null)).toBeNull()
    expect(abaValida('')).toBeNull()
  })

  it('?aba= vale mais que o #hash, e sem nenhum abre o resumo', () => {
    expect(abaDaUrl('perfil', '#contatos')).toBe('perfil')
    expect(abaDaUrl(null, '#contatos')).toBe('contatos')
    expect(abaDaUrl('lixo', '#plaquinha')).toBe('plaquinha')
    expect(abaDaUrl(null, null)).toBe('resumo')
  })

  it('troca so a aba e mantem o resto da query', () => {
    expect(queryDaAba('aba=resumo&bizId=abc', 'contatos')).toBe('?aba=contatos&bizId=abc')
    expect(queryDaAba(new URLSearchParams(''), 'passaporte')).toBe('?aba=passaporte')
  })

  it('tira da URL o que so vale em outra aba', () => {
    expect(queryDaAba('aba=perfil&vista=previa&bizId=x', 'contatos')).toBe('?aba=contatos&bizId=x')
    expect(queryDaAba('aba=perfil&vista=previa', 'perfil')).toBe('?aba=perfil&vista=previa')
    expect(queryDaAba('aba=resumo&new=1', 'perfil')).toBe('?aba=perfil')
  })
})

describe('teclado das abas', () => {
  it('setas andam e dao a volta', () => {
    expect(abaPorTecla('resumo', 'ArrowRight')).toBe('perfil')
    expect(abaPorTecla('plaquinha', 'ArrowRight')).toBe('resumo')
    expect(abaPorTecla('resumo', 'ArrowLeft')).toBe('plaquinha')
    expect(abaPorTecla('contatos', 'ArrowLeft')).toBe('passaporte')
  })

  it('Home e End vao para as pontas; outra tecla nao faz nada', () => {
    expect(abaPorTecla('contatos', 'Home')).toBe('resumo')
    expect(abaPorTecla('contatos', 'End')).toBe('plaquinha')
    expect(abaPorTecla('contatos', 'Enter')).toBeNull()
    expect(abaPorTecla('contatos', 'a')).toBeNull()
  })

  it('respeita uma lista menor de abas', () => {
    expect(abaPorTecla('resumo', 'ArrowRight', ['resumo', 'perfil'])).toBe('perfil')
    expect(abaPorTecla('perfil', 'ArrowRight', ['resumo', 'perfil'])).toBe('resumo')
    expect(abaPorTecla('contatos', 'ArrowRight', ['resumo', 'perfil'])).toBeNull()
  })
})

describe('janelas de 7 e 30 dias', () => {
  const agora = new Date('2026-11-08T12:00:00Z')

  it('o corte e agora menos N dias de 24 h', () => {
    expect(corteDaJanela(agora, 7)).toBe('2026-11-01T12:00:00.000Z')
    expect(corteDaJanela(agora, 30)).toBe('2026-10-09T12:00:00.000Z')
  })

  it('um cupom de 7 dias atras e 1 minuto entra na janela de 30 e fica fora da de 7', () => {
    const corte7 = corteDaJanela(agora, 7)
    const corte30 = corteDaJanela(agora, 30)
    const pego = '2026-11-01T11:59:00.000Z'
    expect(pego >= corte7).toBe(false)
    expect(pego >= corte30).toBe(true)
  })

  it('calcula o dia civil sem depender do fuso do computador', () => {
    expect(diaMenos('2026-11-08', 6)).toBe('2026-11-02')
    expect(diaMenos('2026-03-01', 1)).toBe('2026-02-28')
    expect(diaMenos('2027-01-02', 5)).toBe('2026-12-28')
  })

  it('hoje no fuso de Gostoso: 23h de Gostoso ainda e o mesmo dia, mesmo ja sendo dia seguinte em UTC', () => {
    expect(hojeNoFuso(new Date('2026-11-09T02:30:00Z'))).toBe('2026-11-08')
    expect(hojeNoFuso(new Date('2026-11-08T12:00:00Z'))).toBe('2026-11-08')
  })

  it('soma as vistas de hoje e dos 6 dias anteriores (7 dias) e dos 29 anteriores (30 dias)', () => {
    const linhas = [
      { dia: '2026-11-08', n: 4 },
      { dia: '2026-11-02', n: 3 },
      { dia: '2026-11-01', n: 10 },
      { dia: '2026-10-10', n: 5 },
      { dia: '2026-10-09', n: 100 },
    ]
    expect(somarVistas(linhas, '2026-11-08', 7)).toBe(7)
    expect(somarVistas(linhas, '2026-11-08', 30)).toBe(22)
  })

  it('ignora dia futuro e contagem invalida', () => {
    const linhas = [
      { dia: '2026-11-09', n: 50 },
      { dia: '2026-11-08', n: Number.NaN },
      { dia: '2026-11-08', n: -2 },
      { dia: '2026-11-08', n: 2 },
    ]
    expect(somarVistas(linhas, '2026-11-08', 7)).toBe(2)
    expect(somarVistas([], '2026-11-08', 7)).toBe(0)
  })
})

describe('busca nos contatos', () => {
  const lista = [
    lead({ nome: 'Ana Souza', email: 'ana@exemplo.com', telefone: '84999991234', codigo: '7K4Q9XMB' }),
    lead({ nome: 'João Álvares', email: 'joao@mail.com', telefone: '11988887777', codigo: 'ABCD2345' }),
    lead({ nome: 'Maria', email: 'maria@mail.com', telefone: '8432361234', codigo: 'ZZZZ9999' }),
  ]

  it('busca vazia devolve tudo, sem mexer na lista original', () => {
    const r = filtrarLeads(lista, '   ')
    expect(r).toHaveLength(3)
    expect(r).not.toBe(lista)
  })

  it('ignora acento e caixa no nome', () => {
    expect(filtrarLeads(lista, 'joao').map((l) => l.nome)).toEqual(['João Álvares'])
    expect(filtrarLeads(lista, 'ÁLVARES').map((l) => l.nome)).toEqual(['João Álvares'])
  })

  it('acha por e-mail', () => {
    expect(filtrarLeads(lista, 'maria@').map((l) => l.nome)).toEqual(['Maria'])
  })

  it('acha por telefone com ou sem mascara', () => {
    expect(filtrarLeads(lista, '(84) 99999-1234').map((l) => l.nome)).toEqual(['Ana Souza'])
    expect(filtrarLeads(lista, '3236').map((l) => l.nome)).toEqual(['Maria'])
  })

  it('acha pelo codigo do cupom, com o GP- na frente', () => {
    expect(filtrarLeads(lista, 'GP-ABCD-2345').map((l) => l.nome)).toEqual(['João Álvares'])
    expect(filtrarLeads(lista, 'zzzz').map((l) => l.nome)).toEqual(['Maria'])
  })

  it('sem resultado devolve lista vazia', () => {
    expect(filtrarLeads(lista, 'ninguem')).toEqual([])
  })
})

describe('CSV dos contatos', () => {
  it('o nome do arquivo leva o negocio e a data, sem caractere estranho', () => {
    expect(nomeDoArquivoCsv('casa-surya', '2026-11-08')).toBe('passaporte-contatos-casa-surya-2026-11-08.csv')
    expect(nomeDoArquivoCsv('Café do Zé!', '2026-11-08')).toBe('passaporte-contatos-cafe-do-ze-2026-11-08.csv')
    expect(nomeDoArquivoCsv('', '2026-11-08')).toBe('passaporte-contatos-2026-11-08.csv')
  })

  it('o CSV da lista filtrada sai com BOM, cabecalho e uma linha por contato', () => {
    const lista = [lead({}), lead({ nome: 'Pedro', email: 'pedro@mail.com', codigo: 'ABCD2345' })]
    const csv = csvDeLeads(filtrarLeads(lista, 'pedro'))
    const linhas = csv.replace(BOM, '').split('\r\n')
    expect(csv.startsWith(BOM)).toBe(true)
    expect(linhas[0]).toBe('nome,email,telefone,codigo,status,resgatado_em,valido_ate,contato_verificado')
    expect(linhas).toHaveLength(2)
    expect(linhas[1]).toContain('Pedro')
    expect(linhas[1]).toContain('GP-ABCD-2345')
    expect(linhas[1]).toContain(',nao')
  })

  it('nome que a planilha leria como formula sai com apostrofo', () => {
    const csv = csvDeLeads([lead({ nome: '=HYPERLINK("x")' })])
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
  })

  it('lista vazia gera so o cabecalho', () => {
    expect(csvDeLeads([]).replace(BOM, '').split('\r\n')).toHaveLength(1)
  })
})

describe('plaquinha do negocio', () => {
  it('acha o codigo pelo slug do negocio principal', () => {
    expect(codigosDaPlaquinha('gostoso-expedicoes')).toEqual(['01'])
    expect(codigosDaPlaquinha('casa-surya')).toEqual(['11'])
  })

  it('negocio extra de uma plaquinha usa o codigo dela', () => {
    expect(codigosDaPlaquinha('lokos-por-kite')).toEqual(['07'])
  })

  it('negocio sem plaquinha devolve lista vazia', () => {
    expect(codigosDaPlaquinha('nao-existe')).toEqual([])
  })

  it('a URL e a mesma que vai no QR impresso', () => {
    expect(urlDaPlaquinha('07')).toBe('https://www.vivegostoso.com.br/p/07')
  })
})

describe('rotas antigas', () => {
  const BIZ = '3f2b8c1e-5a4d-4c7e-9b1a-2d6e8f0a1b3c'

  it('passaporte vai para a aba do passaporte', () => {
    expect(destinoDaRotaAntiga('passaporte')).toBe('/cadastre/painel?aba=passaporte')
  })

  it('negocios vai para o resumo e guarda o aviso de negocio criado', () => {
    expect(destinoDaRotaAntiga('negocios')).toBe('/cadastre/painel?aba=resumo')
    expect(destinoDaRotaAntiga('negocios', { new: '1' })).toBe('/cadastre/painel?aba=resumo&new=1')
    expect(destinoDaRotaAntiga('negocios', { new: '0' })).toBe('/cadastre/painel?aba=resumo')
  })

  it('perfil com bizId vai para a aba do perfil naquele negocio', () => {
    expect(destinoDaRotaAntiga('perfil', { bizId: BIZ })).toBe(`/cadastre/painel?aba=perfil&bizId=${BIZ}`)
    expect(destinoDaRotaAntiga('perfil', { bizId: [BIZ, 'outro'] })).toBe(`/cadastre/painel?aba=perfil&bizId=${BIZ}`)
  })

  it('perfil sem bizId e a tela de criar negocio: fica onde esta', () => {
    expect(destinoDaRotaAntiga('perfil')).toBeNull()
    expect(destinoDaRotaAntiga('perfil', { bizId: '' })).toBeNull()
    expect(destinoDaRotaAntiga('perfil', { bizId: 'nao-e-uuid' })).toBeNull()
  })

  it('preview vai para a vista previa dentro do perfil', () => {
    expect(destinoDaRotaAntiga('preview')).toBe('/cadastre/painel?aba=perfil&vista=previa')
  })

  it('bizId que nao e UUID nunca vai para a URL nova', () => {
    expect(destinoDaRotaAntiga('passaporte', { bizId: '"><script>' })).toBe('/cadastre/painel?aba=passaporte')
  })
})
