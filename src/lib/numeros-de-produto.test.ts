import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * GUARDA CONTRA NÚMERO DE ESTADO DO PRODUTO ESCRITO À MÃO.
 *
 * O mesmo defeito apareceu quatro vezes neste site em um dia:
 *
 *   1. `cover_url` limpo no banco, array `photos` deixado para trás.
 *   2. Travessão varrido em três colunas, `faq_jsonld` deixado para trás.
 *   3. Custo removido do banco, lista estática da /apoie deixada para trás.
 *   4. Selo auditado no banco, contagem "verificados" da home deixada para trás.
 *
 * Não é falha de execução. É uma propriedade do produto: o mesmo fato mora em
 * dois lugares, um consultável e outro escrito à mão, e só o consultável é
 * auditado. Varrer melhor não resolve, porque a quinta ocorrência já existe.
 *
 * Este teste quebra quando alguém escreve preço, percentual ou contagem de
 * negócios à mão em componente ou em locale. A lista de exceções abaixo é
 * curta, explícita e comentada uma a uma: ela é o registro do que ainda não
 * saiu de literal.
 */

const RAIZ = join(__dirname, '..')

type Regra = {
  nome: string
  padrao: RegExp
  /** Por que este padrão indica número de estado do produto. */
  porque: string
}

const REGRAS: Regra[] = [
  {
    nome: 'preco',
    padrao: /R\$\s?\d/g,
    porque: 'preço vem de gostoso_parametros_produto, nunca de literal',
  },
  {
    nome: 'contagem-de-negocios',
    padrao: /\d+\s*\+?\s*(neg[óo]cios?|businesses?|negocios?)\b/gi,
    porque: 'contagem vem de count() no banco, nunca de literal',
  },
  {
    nome: 'percentual',
    padrao: /\b\d{1,3}%/g,
    porque: 'percentual de rateio vem de gostoso_parametros_produto',
  },
]

/**
 * EXCEÇÕES, uma linha por motivo. Nada entra aqui sem explicação.
 *
 * Cada entrada casa por `arquivo` (sufixo do caminho) e `trecho` (texto exato
 * encontrado). Manter estreito de propósito: exceção larga demais deixa passar
 * o caso seguinte.
 */
const EXCECOES: Array<{ arquivo: string; marcador: string; motivo: string }> = [
  // Placeholder de formulário: exemplo do que digitar, não preço praticado.
  { arquivo: 'locales/pt.json', marcador: 'services_price_placeholder', motivo: 'exemplo de preenchimento no formulário de serviço' },
  { arquivo: 'locales/en.json', marcador: 'services_price_placeholder', motivo: 'exemplo de preenchimento' },
  { arquivo: 'locales/es.json', marcador: 'services_price_placeholder', motivo: 'exemplo de preenchimento' },

  // Valor mínimo de doação: regra do meio de pagamento, não preço de plano.
  { arquivo: 'locales/pt.json', marcador: 'erro_valor_minimo', motivo: 'mínimo do Stripe para doação avulsa' },
  { arquivo: 'locales/en.json', marcador: 'erro_valor_minimo', motivo: 'mínimo do Stripe' },
  { arquivo: 'locales/es.json', marcador: 'erro_valor_minimo', motivo: 'mínimo do Stripe' },

  // AINDA HARDCODED, e este é o registro disso: a lista de custos operacionais
  // da /apoie. São fatos sobre o que a Balaio paga, e saem de literal quando
  // essas linhas virarem consulta ao fundo. Enquanto não saírem, ficam aqui à
  // vista em vez de escondidas.
  { arquivo: 'locales/pt.json', marcador: 'custo_vercel_hobby_valor_display', motivo: 'custo operacional da /apoie, registrado para sair de literal' },
  { arquivo: 'locales/en.json', marcador: 'custo_vercel_hobby_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/es.json', marcador: 'custo_vercel_hobby_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/pt.json', marcador: 'custo_email_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/en.json', marcador: 'custo_email_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/es.json', marcador: 'custo_email_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/pt.json', marcador: 'custo_dominio_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/en.json', marcador: 'custo_dominio_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/es.json', marcador: 'custo_dominio_valor_display', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/pt.json', marcador: 'custo_dominio_valor_sub', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/en.json', marcador: 'custo_dominio_valor_sub', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/es.json', marcador: 'custo_dominio_valor_sub', motivo: 'custo operacional da /apoie' },
  { arquivo: 'locales/pt.json', marcador: 'custo_vercel_pro_detalhe', motivo: 'preço de plano ainda não contratado, na lista de planejados' },
  { arquivo: 'locales/en.json', marcador: 'custo_vercel_pro_detalhe', motivo: 'plano ainda não contratado' },
  { arquivo: 'locales/es.json', marcador: 'custo_vercel_pro_detalhe', motivo: 'plano ainda não contratado' },
  { arquivo: 'locales/pt.json', marcador: 'aprende_item_1', motivo: 'programa APRENDE gratuito para associados, registrado' },
  { arquivo: 'locales/en.json', marcador: 'aprende_item_1', motivo: 'programa APRENDE' },
  { arquivo: 'locales/es.json', marcador: 'aprende_item_1', motivo: 'programa APRENDE' },

  // Texto sobre a cidade, não sobre o produto: o comércio local não aceita
  // aplicativo de entrega. Nada a consultar.
  { arquivo: 'locales/pt.json', marcador: 'infra_desc', motivo: 'texto da /conheca sobre o comércio da cidade' },
  { arquivo: 'locales/en.json', marcador: 'infra_desc', motivo: 'texto da /conheca' },
  { arquivo: 'locales/es.json', marcador: 'infra_desc', motivo: 'texto da /conheca' },
]

/** Marcadores de CSS e de classe do Tailwind. Um `%` aqui é geometria de
 *  layout, não afirmação sobre o produto. */
const CONTEXTO_DE_LAYOUT = [
  'className=', 'style=', 'transform', 'translate', 'border-radius', 'calc(',
  'width:', 'height:', 'background', 'gradient', 'stop-color', 'stopColor',
  'cx=', 'cy=', ' r=', 'offset=',
]

/**
 * Tira comentário do código antes de varrer.
 *
 * Comentário não é o que a página mostra, e vários docblocks deste projeto
 * citam de propósito os números errados que já foram publicados, para explicar
 * o defeito. Proibi-los apagaria a memória do erro.
 *
 * Precisa de máquina de estado, e não de "a linha começa com asterisco": num
 * bloco `/* ... *\/` de três linhas, a do meio começa com a palavra, e foi
 * exatamente por aí que a primeira versão deste teste deixou passar dez casos.
 */
function semComentarios(fonte: string): string[] {
  const saida: string[] = []
  let dentroDeBloco = false
  for (const linha of fonte.split(/\r?\n/)) {
    let resultado = ''
    let i = 0
    while (i < linha.length) {
      if (dentroDeBloco) {
        const fim = linha.indexOf('*/', i)
        if (fim === -1) { i = linha.length } else { dentroDeBloco = false; i = fim + 2 }
        continue
      }
      const abre = linha.indexOf('/*', i)
      const linhaSimples = linha.indexOf('//', i)
      if (linhaSimples !== -1 && (abre === -1 || linhaSimples < abre)) {
        resultado += linha.slice(i, linhaSimples)
        break
      }
      if (abre !== -1) {
        resultado += linha.slice(i, abre)
        dentroDeBloco = true
        i = abre + 2
        continue
      }
      resultado += linha.slice(i)
      break
    }
    saida.push(resultado)
  }
  return saida
}

function arquivosPara(dir: string, extensoes: string[], acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) {
      arquivosPara(caminho, extensoes, acc)
    } else if (extensoes.some((e) => nome.endsWith(e))) {
      acc.push(caminho)
    }
  }
  return acc
}

function normalizar(caminho: string): string {
  return relative(RAIZ, caminho).split('\\').join('/')
}

export function varrer(): Array<{ arquivo: string; regra: string; trecho: string; linha: number }> {
  const alvos = arquivosPara(RAIZ, ['.ts', '.tsx', '.json']).filter(
    (f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx')
  )
  const achados: Array<{ arquivo: string; regra: string; trecho: string; linha: number }> = []

  for (const caminho of alvos) {
    const arquivo = normalizar(caminho)
    const bruto = readFileSync(caminho, 'utf8')
    /* JSON nao tem comentario, e `//` dentro de uma URL nao pode ser cortado. */
    const linhas = arquivo.endsWith('.json')
      ? bruto.split(/\r?\n/)
      : semComentarios(bruto)
    linhas.forEach((texto, i) => {
      const perdoado = EXCECOES.some(
        (e) => arquivo.endsWith(e.arquivo) && texto.includes(e.marcador)
      )
      if (perdoado) return
      const ehLayout = CONTEXTO_DE_LAYOUT.some((m) => texto.includes(m))
      for (const regra of REGRAS) {
        if (regra.nome === 'percentual' && ehLayout) continue
        for (const m of texto.matchAll(new RegExp(regra.padrao.source, regra.padrao.flags))) {
          achados.push({ arquivo, regra: regra.nome, trecho: m[0], linha: i + 1 })
        }
      }
    })
  }
  return achados
}

describe('numero de estado do produto nao pode ser escrito a mao', () => {
  it('nenhum preco, percentual ou contagem literal fora da lista de excecoes', () => {
    const achados = varrer()
    const relatorio = achados
      .map((a) => `  ${a.arquivo}:${a.linha}  [${a.regra}]  ${a.trecho}`)
      .join('\n')
    expect(
      achados,
      `Numero de estado do produto escrito a mao:\n${relatorio}\n\n` +
        'Use gostoso_parametros_produto (preco e percentual) ou count() (contagem).\n' +
        'Se o caso for legitimo, adicione em EXCECOES com o motivo.'
    ).toHaveLength(0)
  })

  it('a varredura sabe achar: as regras casam quando o texto existe', () => {
    /* Controle positivo. Sem isto, o teste acima passando nao prova nada: um
       regex quebrado tambem devolve zero. */
    const linhaDeTeste = 'const copy = "+182 negocios verificados, R$39,90 por mes, 80% para a cidade"'
    const casadas = REGRAS.filter((r) => new RegExp(r.padrao.source, r.padrao.flags).test(linhaDeTeste))
    expect(casadas.map((r) => r.nome).sort()).toEqual(['contagem-de-negocios', 'percentual', 'preco'])
  })
})
