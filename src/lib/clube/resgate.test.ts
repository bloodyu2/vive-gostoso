import { describe, expect, it } from 'vitest'
import {
  BOM,
  POLITICA_VERSAO,
  codigoCurtoNormalizado,
  csvDeLeads,
  emailValido,
  formatarCodigo,
  interpretarResgate,
  limparNome,
  mascararTelefone,
  nomeValido,
  normalizarTelefone,
  primeiroNome,
  textoConsentimento,
  validarResgate,
} from './resgate'

describe('normalizarTelefone', () => {
  it('aceita DDD e número, com ou sem máscara e com ou sem +55', () => {
    expect(normalizarTelefone('(84) 99999-1234')).toBe('84999991234')
    expect(normalizarTelefone('84 99999 1234')).toBe('84999991234')
    expect(normalizarTelefone('+55 84 99999-1234')).toBe('84999991234')
    expect(normalizarTelefone('5584999991234')).toBe('84999991234')
    expect(normalizarTelefone('(84) 3236-1234')).toBe('8432361234')
  })
  it('recusa o que não é telefone brasileiro', () => {
    expect(normalizarTelefone('')).toBeNull()
    expect(normalizarTelefone('12345')).toBeNull()
    expect(normalizarTelefone('(84) 9999-123')).toBeNull()
    expect(normalizarTelefone('(00) 99999-1234')).toBeNull()
    expect(normalizarTelefone('(84) 89999-1234')).toBeNull() // celular de 11 dígitos começa com 9
    expect(normalizarTelefone('abcdefghijk')).toBeNull()
    expect(normalizarTelefone('84999991234567')).toBeNull()
  })
})

describe('mascararTelefone', () => {
  it('formata enquanto a pessoa digita', () => {
    expect(mascararTelefone('')).toBe('')
    expect(mascararTelefone('8')).toBe('(8')
    expect(mascararTelefone('84')).toBe('(84')
    expect(mascararTelefone('849')).toBe('(84) 9')
    expect(mascararTelefone('8499999')).toBe('(84) 9999-9')
    expect(mascararTelefone('84999991234')).toBe('(84) 99999-1234')
    expect(mascararTelefone('8432361234')).toBe('(84) 3236-1234')
  })
  it('ignora letras, corta o excesso e tira o 55 colado', () => {
    expect(mascararTelefone('84a99999x1234999')).toBe('(84) 99999-1234')
    expect(mascararTelefone('+5584999991234')).toBe('(84) 99999-1234')
  })
})

describe('emailValido', () => {
  it('aceita e-mails comuns', () => {
    expect(emailValido('ana@exemplo.com')).toBe(true)
    expect(emailValido('ana.silva+clube@exemplo.com.br')).toBe(true)
  })
  it('recusa o que não é e-mail', () => {
    for (const e of ['', 'ana', 'ana@', '@exemplo.com', 'ana@exemplo', 'ana @exemplo.com', 'ana@exemplo..com', `${'a'.repeat(250)}@x.com`]) {
      expect(emailValido(e), e).toBe(false)
    }
  })
})

describe('nome', () => {
  it('limpa espaços e valida o tamanho', () => {
    expect(limparNome('  Ana   Maria  ')).toBe('Ana Maria')
    expect(nomeValido('Ana')).toBe(true)
    expect(nomeValido('A')).toBe(false)
    expect(nomeValido('   ')).toBe(false)
    expect(nomeValido('x'.repeat(81))).toBe(false)
  })
  it('primeiro nome', () => {
    expect(primeiroNome('Ana Maria Souza')).toBe('Ana')
    expect(primeiroNome('  joão ')).toBe('joão')
    expect(primeiroNome('')).toBe('')
  })
})

describe('validarResgate', () => {
  const base = { nome: 'Ana Souza', email: 'ana@exemplo.com', telefone: '(84) 99999-1234', consentimento: true }
  it('tudo certo devolve os dados limpos', () => {
    expect(validarResgate(base)).toEqual({
      ok: true,
      dados: { nome: 'Ana Souza', email: 'ana@exemplo.com', telefone: '84999991234' },
    })
  })
  it('sem consentimento não resgata', () => {
    expect(validarResgate({ ...base, consentimento: false })).toEqual({ ok: false, campo: 'consentimento' })
  })
  it('aponta o primeiro campo com problema', () => {
    expect(validarResgate({ ...base, nome: 'A' })).toEqual({ ok: false, campo: 'nome' })
    expect(validarResgate({ ...base, email: 'ana@' })).toEqual({ ok: false, campo: 'email' })
    expect(validarResgate({ ...base, telefone: '123' })).toEqual({ ok: false, campo: 'telefone' })
  })
  it('e-mail em maiúsculas e com espaços sai normalizado', () => {
    const r = validarResgate({ ...base, email: '  ANA@Exemplo.COM ' })
    expect(r).toMatchObject({ ok: true, dados: { email: 'ana@exemplo.com' } })
  })
})

describe('consentimento', () => {
  it('usa o nome do negócio e a versão da política é uma data', () => {
    const t = textoConsentimento('Autorizo repassar meu nome, e-mail e telefone a {negocio} para que ele me procure sobre esta vantagem.', 'Gostoso Expedições')
    expect(t).toBe('Autorizo repassar meu nome, e-mail e telefone a Gostoso Expedições para que ele me procure sobre esta vantagem.')
    expect(POLITICA_VERSAO).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('nome de negócio com $& não vira padrão de substituição', () => {
    expect(textoConsentimento('A {negocio}.', 'Bar $& do Zé')).toBe('A Bar $& do Zé.')
  })
})

describe('código curto', () => {
  it('normaliza o que o dono digita', () => {
    expect(codigoCurtoNormalizado('GP-7K4Q-9XMB')).toBe('7K4Q9XMB')
    expect(codigoCurtoNormalizado('gp 7k4q 9xmb')).toBe('7K4Q9XMB')
    expect(codigoCurtoNormalizado('7k4q9xmb')).toBe('7K4Q9XMB')
  })
  it('recusa tamanho errado e letras que o código não usa', () => {
    expect(codigoCurtoNormalizado('7K4Q9XM')).toBeNull()
    expect(codigoCurtoNormalizado('7K4Q9XMBB')).toBeNull()
    expect(codigoCurtoNormalizado('7K4Q9XM0')).toBeNull() // zero não existe no alfabeto
    expect(codigoCurtoNormalizado('7K4Q9XMI')).toBeNull()
    expect(codigoCurtoNormalizado('')).toBeNull()
  })
  it('mostra com o prefixo e o hífen', () => {
    expect(formatarCodigo('7K4Q9XMB')).toBe('GP-7K4Q-9XMB')
  })
})

describe('csvDeLeads', () => {
  const linha = {
    nome: 'Ana Souza',
    email: 'ana@exemplo.com',
    telefone: '84999991234',
    codigo: '7K4Q9XMB',
    status: 'valido',
    created_at: '2026-11-06T13:05:00.000Z',
    expira_em: '2026-12-06',
  }
  it('tem cabeçalho, uma linha por resgate e vírgula como separador', () => {
    const csv = csvDeLeads([linha])
    expect(csv.startsWith(BOM)).toBe(true)
    const [cab, l1] = csv.slice(BOM.length).split('\r\n')
    expect(cab).toBe('nome,email,telefone,codigo,status,resgatado_em,valido_ate')
    expect(l1).toBe('Ana Souza,ana@exemplo.com,(84) 99999-1234,GP-7K4Q-9XMB,valido,2026-11-06 10:05,2026-12-06')
  })
  it('escapa aspas, vírgulas e quebras de linha', () => {
    const csv = csvDeLeads([{ ...linha, nome: 'Silva, "Zé"\nJr' }])
    expect(csv).toContain('"Silva, ""Zé""\nJr"')
  })
  it('não deixa a planilha executar fórmula', () => {
    const csv = csvDeLeads([{ ...linha, nome: '=HYPERLINK("http://x")' }, { ...linha, nome: '+55 84', email: '@x' }])
    expect(csv).toContain("\"'=HYPERLINK(\"\"http://x\"\")\"")
    expect(csv).toContain("'+55 84")
    expect(csv).toContain("'@x")
  })
  it('lista vazia só tem o cabeçalho', () => {
    expect(csvDeLeads([]).slice(BOM.length)).toBe('nome,email,telefone,codigo,status,resgatado_em,valido_ate')
  })
})

describe('interpretarResgate', () => {
  const token = 'ab'.repeat(32)
  it('resgate ok devolve token e código', () => {
    expect(interpretarResgate({ ok: true, token, codigo: '7K4Q9XMB', expira_em: '2026-12-05' }, null)).toEqual({
      tipo: 'ok',
      token,
      codigo: '7K4Q9XMB',
    })
  })
  it('cada motivo de recusa vira o seu', () => {
    for (const motivo of ['consentimento', 'nome', 'email', 'telefone', 'indisponivel', 'ja_tem', 'esgotada', 'muitos']) {
      expect(interpretarResgate({ ok: false, motivo }, null)).toEqual({ tipo: 'erro', motivo })
    }
  })
  it('motivo desconhecido, falha de rede e resposta torta viram erro genérico, nunca cupom', () => {
    expect(interpretarResgate({ ok: false, motivo: 'estranho' }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarResgate(null, { message: 'boom' })).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarResgate({ ok: true }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarResgate({ ok: true, token: 'curto', codigo: '7K4Q9XMB' }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarResgate({ ok: true, token, codigo: 'ZZ' }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
  })
})
