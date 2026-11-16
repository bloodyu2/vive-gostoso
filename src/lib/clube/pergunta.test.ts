import { describe, expect, it } from 'vitest'
import {
  PERGUNTA_VERSAO,
  dentroDaJanela,
  escaparHtml,
  horaEmGostoso,
  idiomaDaPergunta,
  interpretarResposta,
  linhaValida,
  montarEmail,
  urlDaResposta,
} from './pergunta'

const TOKEN = 'a'.repeat(64)
const base = { nome: 'Ana Souza', negocio: 'Café com Biscoitos Damy', beneficio: 'Um cafezinho de cortesia.', url: `https://www.vivegostoso.com.br/clube/usei/${TOKEN}` }

describe('janela de envio (hora de Gostoso)', () => {
  it('12:00 UTC e 09:00 em Gostoso: dentro', () => {
    expect(horaEmGostoso(new Date('2026-11-17T12:00:00Z'))).toBe(9)
    expect(dentroDaJanela(new Date('2026-11-17T12:00:00Z'))).toBe(true)
  })
  it('08:59 e 20:00 em Gostoso: fora; 19:59: dentro', () => {
    expect(dentroDaJanela(new Date('2026-11-17T11:59:00Z'))).toBe(false)
    expect(dentroDaJanela(new Date('2026-11-17T22:59:00Z'))).toBe(true)
    expect(dentroDaJanela(new Date('2026-11-17T23:00:00Z'))).toBe(false)
  })
  it('madrugada: fora', () => {
    expect(dentroDaJanela(new Date('2026-11-17T05:00:00Z'))).toBe(false)
  })
})

describe('urlDaResposta', () => {
  it('português na raiz, en e es com prefixo, sem barra dobrada', () => {
    expect(urlDaResposta('https://www.vivegostoso.com.br/', 'pt', TOKEN)).toBe(`https://www.vivegostoso.com.br/clube/usei/${TOKEN}`)
    expect(urlDaResposta('https://www.vivegostoso.com.br', 'en', TOKEN)).toBe(`https://www.vivegostoso.com.br/en/clube/usei/${TOKEN}`)
    expect(urlDaResposta('https://www.vivegostoso.com.br', 'es', TOKEN)).toBe(`https://www.vivegostoso.com.br/es/clube/usei/${TOKEN}`)
  })
})

describe('idiomaDaPergunta', () => {
  it('só en e es mudam; qualquer outra coisa vira pt', () => {
    expect(idiomaDaPergunta('en')).toBe('en')
    expect(idiomaDaPergunta('es')).toBe('es')
    expect(idiomaDaPergunta('pt')).toBe('pt')
    expect(idiomaDaPergunta(null)).toBe('pt')
    expect(idiomaDaPergunta('fr')).toBe('pt')
  })
})

describe('montarEmail', () => {
  it('pt: assunto, saudação com o primeiro nome, vantagem sem ponto dobrado e o link', () => {
    const e = montarEmail({ ...base, idioma: 'pt' })
    expect(e.assunto).toBe('Você usou o cupom do Café com Biscoitos Damy?')
    expect(e.texto).toContain('Oi, Ana.')
    expect(e.texto).toContain('Você pegou um cupom do Passaporte Gostoso em Café com Biscoitos Damy. Vantagem: Um cafezinho de cortesia.')
    expect(e.texto).toContain(base.url)
    expect(e.html).toContain(`href="${base.url}"`)
  })
  it('en e es saem no idioma certo', () => {
    expect(montarEmail({ ...base, idioma: 'en' }).texto).toContain('Hi, Ana.')
    expect(montarEmail({ ...base, idioma: 'es' }).assunto).toContain('¿Usaste el cupón')
  })
  it('o HTML escapa o que veio de fora; o texto puro não leva tag', () => {
    const e = montarEmail({ ...base, idioma: 'pt', nome: 'Ana <script>x</script>', negocio: 'A&B "Bar"', beneficio: '<b>10%</b>' })
    expect(e.html).not.toContain('<script>')
    expect(e.html).not.toContain('<b>10%</b>')
    expect(e.html).toContain('A&amp;B &quot;Bar&quot;')
  })
  it('sem travessão longo, sem emoji e sem link do cupom em nenhum idioma', () => {
    for (const idioma of ['pt', 'en', 'es'] as const) {
      const e = montarEmail({ ...base, idioma })
      for (const parte of [e.assunto, e.texto, e.html]) {
        expect(parte).not.toMatch(/[–—]/)
        expect(parte).not.toMatch(/\p{Extended_Pictographic}/u)
      }
      expect(e.texto).not.toContain('/clube/cupom/')
    }
  })
  it('diz por que a pessoa recebe e que não vai escrever de novo', () => {
    expect(montarEmail({ ...base, idioma: 'pt' }).texto).toContain('Não vamos escrever de novo')
  })

  it('sem caracteres invisíveis nem aspas curvas (remove-ai-marks)', () => {
    for (const idioma of ['pt', 'en', 'es'] as const) {
      const e = montarEmail({ ...base, idioma })
      for (const parte of [e.assunto, e.texto, e.html]) {
        // \p{Cf} cobre os invisiveis (largura zero, marcas de direcao, hifen suave, BOM)
        expect(parte).not.toMatch(/\p{Cf}/u)
        expect(parte).not.toMatch(/[‘’“”]/)
      }
    }
  })
})

describe('escaparHtml', () => {
  it('troca os cinco caracteres perigosos', () => {
    expect(escaparHtml(`<a href="x">&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;')
  })
})

describe('linhaValida', () => {
  const ok = { id: 'x', nome: 'Ana', email: 'ana@exemplo.com', idioma: 'pt', resposta_token: TOKEN, negocio: 'Damy', beneficio: 'Café', codigo: 'ABCD2345', expira_em: '2026-12-01' }
  it('aceita a linha completa', () => expect(linhaValida(ok)).toBe(true))
  it('recusa e-mail torto, token curto e lixo', () => {
    expect(linhaValida({ ...ok, email: 'ana' })).toBe(false)
    expect(linhaValida({ ...ok, resposta_token: 'abc' })).toBe(false)
    expect(linhaValida(null)).toBe(false)
    expect(linhaValida('x')).toBe(false)
  })
})

describe('interpretarResposta', () => {
  it('sim e não viram ok', () => {
    expect(interpretarResposta({ ok: true, resposta: 'sim' }, null)).toEqual({ tipo: 'ok', resposta: 'sim' })
    expect(interpretarResposta({ ok: true, resposta: 'nao' }, null)).toEqual({ tipo: 'ok', resposta: 'nao' })
  })
  it('motivos conhecidos e erros de rede', () => {
    expect(interpretarResposta({ ok: false, motivo: 'invalido' }, null)).toEqual({ tipo: 'erro', motivo: 'invalido' })
    expect(interpretarResposta({ ok: false, motivo: 'cancelado' }, null)).toEqual({ tipo: 'erro', motivo: 'cancelado' })
    expect(interpretarResposta({ ok: false, motivo: 'qualquer' }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarResposta(null, new Error('x'))).toEqual({ tipo: 'erro', motivo: 'erro' })
    expect(interpretarResposta({ ok: true, resposta: 'talvez' }, null)).toEqual({ tipo: 'erro', motivo: 'erro' })
  })
})

describe('versão do consentimento', () => {
  it('é uma data AAAA-MM-DD', () => expect(PERGUNTA_VERSAO).toMatch(/^\d{4}-\d{2}-\d{2}$/))
})
