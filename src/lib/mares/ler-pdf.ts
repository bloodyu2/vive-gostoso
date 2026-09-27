import { readFile } from 'node:fs/promises'
import type { ItemTexto } from './extrair-tabua'

/** Le o PDF e devolve, por pagina, cada trecho de texto com sua posicao.
 *  So roda em Node (importador e testes); a pagina do site nunca importa isto. */
export async function lerItensDoPdf(caminho: string): Promise<ItemTexto[][]> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const dados = new Uint8Array(await readFile(caminho))
  const doc = await getDocument({ data: dados, useSystemFonts: true }).promise
  const paginas: ItemTexto[][] = []
  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n)
    const conteudo = await pagina.getTextContent()
    const itens: ItemTexto[] = []
    for (const item of conteudo.items) {
      if (!('str' in item) || !item.str.trim()) continue
      itens.push({ texto: item.str.trim(), x: item.transform[4], y: item.transform[5] })
    }
    paginas.push(itens)
  }
  await doc.destroy()
  return paginas
}
