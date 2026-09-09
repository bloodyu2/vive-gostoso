import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/* A assinatura da Balaio no rodape.
 *
 * A frase e o destino sao combinados entre os sites de cliente, e nao decisao
 * de quem mexe neste repositorio. Um "melhorei o texto" aqui desalinha a
 * assinatura dos quatro sites de uma vez, e ninguem percebe olhando so este.
 *
 * O teste roda no ambiente node desta configuracao de vitest, entao ele nao
 * renderiza React. Ele guarda as duas fontes que produzem o rodape servido: o
 * valor de traducao, que vira o texto, e a ancora do componente, que carrega o
 * destino, o target e o rel. Trocar qualquer um dos dois reprova aqui.
 */

const RAIZ = join(import.meta.dirname, '..', '..')
const locale = (nome: string) =>
  JSON.parse(readFileSync(join(RAIZ, 'locales', `${nome}.json`), 'utf8'))
const footer = readFileSync(join(import.meta.dirname, 'footer.tsx'), 'utf8')

const DESTINO = 'https://balaio.net'

describe('assinatura da Balaio no rodape', () => {
  it('em portugues diz "Feito com amor pela Balaio"', () => {
    expect(locale('pt').footer.feito_por).toBe('Feito com amor pela Balaio')
  })

  /* As outras duas linguas seguem o padrao que este repositorio ja tinha, que e
   * traduzir a assinatura. Deixar portugues cru para quem le em ingles seria
   * uma regressao, nao padronizacao. */
  it('em ingles e espanhol a assinatura tambem fala de amor', () => {
    expect(locale('en').footer.feito_por).toBe('Made with love by Balaio')
    expect(locale('es').footer.feito_por).toBe('Hecho con amor por Balaio')
  })

  it('nenhuma lingua carrega a frase antiga', () => {
    for (const nome of ['pt', 'en', 'es']) {
      expect(locale(nome).footer.feito_por).not.toMatch(/^(Feito por|Made by|Hecho por) Balaio$/)
    }
  })

  it('a ancora aponta para balaio.net em nova aba, com o rel que isso exige', () => {
    const ancora = footer.match(/<a\b[^>]*href="https:\/\/balaio\.net"[\s\S]*?>/)
    expect(ancora, 'nao achei a ancora da assinatura no rodape').not.toBeNull()
    const abertura = ancora![0]
    expect(abertura).toContain(`href="${DESTINO}"`)
    expect(abertura).toContain('target="_blank"')
    expect(abertura).toContain('rel="noopener noreferrer"')
  })

  it('a ancora usa a chave de traducao, e nao texto cravado', () => {
    expect(footer).toContain("t('footer.feito_por')")
  })
})
