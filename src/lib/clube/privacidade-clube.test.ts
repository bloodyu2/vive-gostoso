import { describe, expect, it } from 'vitest'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import pt from '@/locales/pt.json'

/* A politica de privacidade e o que o Passaporte promete ao turista. Estes testes seguram
   tres coisas: a caixa de contato esta citada nos tres idiomas, nenhum texto promete
   "criptografado" (a cifra do disco e do provedor e nao foi verificada por este projeto) e
   o hash do IP e o fato de e-mail e telefone nao serem verificados estao ditos. */

const IDIOMAS = { pt, en, es } as const

describe('politica de privacidade e textos do Passaporte', () => {
  for (const [lang, d] of Object.entries(IDIOMAS)) {
    it(`${lang}: cita privacidade@vivegostoso.com.br nos direitos e no Passaporte`, () => {
      expect(d.privacidade.sec5_text).toContain('privacidade@vivegostoso.com.br')
      expect(d.privacidade.sec7_text).toContain('privacidade@vivegostoso.com.br')
    })

    it(`${lang}: o Passaporte diz que guarda o hash do IP e que nao verifica os dados`, () => {
      expect(d.privacidade.sec7_text).toMatch(/hash/i)
      expect(d.privacidade.sec7_text).toMatch(/\bIP\b/)
      expect(d.privacidade.sec7_text).toMatch(/12/)
    })

    it(`${lang}: a lista do parceiro avisa que e-mail e telefone nao sao verificados`, () => {
      expect(d.passaporte.leads_nao_verificados).toMatch(/verif/i)
      expect(d.passaporte.lead_contato_nao_verificado).toMatch(/verif/i)
    })

    it(`${lang}: nenhum texto do clube, da politica ou do painel promete criptografia`, () => {
      const texto = JSON.stringify([d.privacidade, d.clube, d.passaporte, d.cupom, d.plaquinha])
      expect(texto).not.toMatch(/criptograf|encrypt|cifrad|cifra[rd]|encript/i)
    })
  }
})
