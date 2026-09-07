import { describe, it, expect } from 'vitest'
import { temLicenca, VERSAO_LICENCA_IMAGEM } from './licenca-imagem'

const FOTO = 'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/a/b.jpg'

describe('temLicenca', () => {
  it('foto listada no aceite recebe o rotulo', () => {
    expect(temLicenca([FOTO], FOTO)).toBe(true)
  })

  it('foto que ja estava no banco, sem aceite, NAO recebe', () => {
    expect(temLicenca([], FOTO)).toBe(false)
    expect(temLicenca(null, FOTO)).toBe(false)
    expect(temLicenca(undefined, FOTO)).toBe(false)
  })

  it('outra foto do mesmo negocio nao herda o aceite da primeira', () => {
    /* O aceite e por imagem, nao por negocio. Se herdasse, bastava o dono
       aceitar uma vez para 30 fotos de terceiro virarem "foto do proprio
       negocio". */
    expect(temLicenca([FOTO], FOTO.replace('b.jpg', 'c.jpg'))).toBe(false)
  })

  it('sem url nao ha rotulo', () => {
    expect(temLicenca([FOTO], null)).toBe(false)
    expect(temLicenca([FOTO], '')).toBe(false)
  })

  it('a versao e um identificador estavel, nao vazio', () => {
    expect(VERSAO_LICENCA_IMAGEM).toMatch(/^v\d+-\d{4}-\d{2}-\d{2}$/)
  })
})
