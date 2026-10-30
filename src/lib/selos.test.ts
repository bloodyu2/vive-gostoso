import { describe, expect, it } from 'vitest'
import { selosDoNegocio } from './selos'
import { hojeEmGostoso, idsNoAr, type LinhaParceiro } from './clube/parceiros-no-ar'
import { CLUBE_PUBLICO } from './clube/config'

describe('selosDoNegocio', () => {
  it('negocio comum nao tem selo', () => {
    expect(selosDoNegocio({ is_verified: false, plan: 'free' })).toEqual([])
    expect(selosDoNegocio({})).toEqual([])
  })

  it('verificado leva prata; assinante leva ouro', () => {
    expect(selosDoNegocio({ is_verified: true })).toEqual(['prata'])
    expect(selosDoNegocio({ plan: 'associado' })).toEqual(['ouro'])
    expect(selosDoNegocio({ plan: 'destaque' })).toEqual(['ouro'])
  })

  it('o selo do clube so aparece com a flag de lancamento ligada', () => {
    expect(selosDoNegocio({ is_verified: true }, { noClube: true, clubePublico: false })).toEqual(['prata'])
    expect(selosDoNegocio({}, { noClube: true, clubePublico: false })).toEqual([])
    expect(selosDoNegocio({}, { noClube: true, clubePublico: true })).toEqual(['clube'])
  })

  it('com a flag ligada, quem nao esta no clube nao ganha o selo', () => {
    expect(selosDoNegocio({ is_verified: true }, { noClube: false, clubePublico: true })).toEqual(['prata'])
    expect(selosDoNegocio({ is_verified: true }, { clubePublico: true })).toEqual(['prata'])
  })

  it('acumula, e a ordem e prata, ouro, clube', () => {
    expect(selosDoNegocio({ is_verified: true }, { noClube: true, clubePublico: true })).toEqual(['prata', 'clube'])
    expect(
      selosDoNegocio({ is_verified: true, plan: 'destaque' }, { noClube: true, clubePublico: true }),
    ).toEqual(['prata', 'ouro', 'clube'])
  })

  it('sem opcao nenhuma vale a flag de verdade do projeto', () => {
    const esperado = CLUBE_PUBLICO ? ['clube'] : []
    expect(selosDoNegocio({}, { noClube: true })).toEqual(esperado)
  })
})

describe('idsNoAr (quem tem vantagem do clube no ar)', () => {
  const l = (business_id: string, status: string, valido_ate: string | null = null): LinhaParceiro => ({
    business_id,
    status,
    valido_ate,
  })

  it('so conta status no_ar', () => {
    const ids = idsNoAr([l('a', 'no_ar'), l('b', 'em_combinacao'), l('c', 'pausado')], '2026-11-05')
    expect(ids).toEqual(['a'])
  })

  it('vantagem vencida nao conta; no dia do vencimento ainda vale', () => {
    const ids = idsNoAr(
      [l('vencida', 'no_ar', '2026-11-04'), l('hoje', 'no_ar', '2026-11-05'), l('futura', 'no_ar', '2026-12-01')],
      '2026-11-05',
    )
    expect(ids).toEqual(['hoje', 'futura'])
  })

  it('negocio repetido entra uma vez so', () => {
    expect(idsNoAr([l('a', 'no_ar'), l('a', 'no_ar')], '2026-11-05')).toEqual(['a'])
  })

  it('o dia e o de Gostoso, nao o de UTC', () => {
    // 02:30 UTC de 06/11 ainda e 23:30 de 05/11 em Fortaleza (UTC-3)
    expect(hojeEmGostoso(new Date('2026-11-06T02:30:00Z'))).toBe('2026-11-05')
  })
})
