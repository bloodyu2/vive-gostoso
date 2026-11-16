// @vitest-environment node
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { useTranslation } from 'react-i18next'
import { I18nPorIdioma } from './i18n-por-idioma'
import '@/i18n'

function Frase() {
  const { t } = useTranslation()
  return createElement('p', null, t('footer.tagline1'))
}

const html = (lang?: string) =>
  renderToString(
    lang ? createElement(I18nPorIdioma, { lang, children: createElement(Frase) }) : createElement(Frase),
  )

describe('I18nPorIdioma (HTML do servidor no idioma da URL)', () => {
  it('en sai em ingles na renderizacao do servidor', () => {
    expect(html('en')).toContain('The digital infrastructure')
  })

  it('es sai em espanhol', () => {
    expect(html('es')).toContain('La infraestructura digital')
  })

  it('pt e idioma desconhecido saem em portugues', () => {
    expect(html('pt')).toContain('A infraestrutura digital')
    expect(html('xx')).toContain('A infraestrutura digital')
  })

  it('controle negativo: sem o provider o servidor so sabe portugues (o defeito de 16/11/2026)', () => {
    expect(html()).toContain('A infraestrutura digital')
    expect(html()).not.toContain('The digital infrastructure')
  })

  it('uma requisicao em ingles nao contamina a seguinte em portugues', () => {
    html('en')
    expect(html('pt')).toContain('A infraestrutura digital')
    expect(html()).toContain('A infraestrutura digital')
  })
})
