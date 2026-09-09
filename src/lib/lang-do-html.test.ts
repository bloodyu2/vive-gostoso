import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

/* A rede do atributo `lang` da raiz.
 *
 * POR QUE ELA EXISTE, medido em 09/09/2026 no HTML servido de dezoito rotas de
 * producao: `<html lang="pt">` nas tres linguas, inclusive em /en e /es. Um
 * leitor de tela le o ingles com fonema portugues, e isso e falha de WCAG 3.1.1,
 * nivel A.
 *
 * O `LocaleSync` que existia nunca tocou no atributo: ele so trocava a lingua do
 * i18n. Nao era um valor certo corrigido tarde, era um valor errado sempre.
 *
 * A rede olha o arquivo do layout raiz, e nao o HTML renderizado, porque o
 * layout e assincrono e depende do middleware do next-intl: renderiza-lo em
 * teste de unidade exigiria simular a requisicao inteira, e o que precisa ser
 * guardado aqui e uma decisao de uma linha. A prova de que o valor chega ao ar
 * e a medida no HTML servido, em scripts/verificar-idioma.mjs.
 */

const LAYOUT = readFileSync(
  path.resolve(import.meta.dirname, '..', '..', 'app', 'layout.tsx'),
  'utf8',
)

describe('o lang da raiz', () => {
  it('nao esta cravado numa lingua', () => {
    const cravado = LAYOUT.match(/<html\s+lang="([a-zA-Z-]+)"/)
    expect(
      cravado,
      `o layout raiz escreve lang="${cravado?.[1]}" fixo. As tres linguas serviriam esse valor.`,
    ).toBeNull()
  })

  it('sai do idioma resolvido no servidor', () => {
    expect(LAYOUT).toContain('getLocale')
    expect(LAYOUT).toMatch(/<html\s+lang=\{/)
  })

  it('traduz pt para pt-BR, e deixa en e es sem regiao', () => {
    const m = LAYOUT.match(/const LANG_HTML: Record<string, string> = \{([^}]*)\}/)
    expect(m, 'nao achei a tabela LANG_HTML no layout raiz').not.toBeNull()
    const tabela = m![1]
    expect(tabela).toContain("pt: 'pt-BR'")
    expect(tabela).toContain("en: 'en'")
    expect(tabela).toContain("es: 'es'")
  })
})
