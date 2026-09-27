import { paraInstante } from './tempo'

/** Um trecho de texto do PDF com a posicao do canto inferior esquerdo. */
export type ItemTexto = { texto: string; x: number; y: number }

export type TipoMare = 'alta' | 'baixa'

export type EventoMare = {
  data: string // AAAA-MM-DD, local (UTC-3)
  hora: string // HHMM, como impresso
  instante: Date
  altura_m: number
  tipo: TipoMare
}

/* Leiaute das Tabuas de Mare do CHM (conferido na edicao 2026):
   cada pagina tem 4 meses, e cada mes duas colunas (dias 1-16 e 17-31), oito
   colunas no total. Cada dia e um bloco: o numero do dia em cima, o dia da
   semana embaixo, e ao lado de 3 a 4 pares "HHMM ALT". Nada aqui depende de
   texto corrido: tudo e posicao, o que torna a leitura imune a quebras de linha. */
const RE_DIA = /^\d{2}$/
const RE_HORA = /^\d{4}$/
const RE_ALTURA = /^-?\d\.\d{2}$/
const TOLERANCIA_Y = 2
const MESES_POR_PAGINA = 4

type Bruto = { data: string; hora: string; altura_m: number }

export function extrairEventos(paginas: ItemTexto[][], ano: number): EventoMare[] {
  const brutos: Bruto[] = []
  paginas.forEach((itens, indicePagina) => {
    brutos.push(...extrairPagina(itens, indicePagina, ano))
  })
  brutos.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
  return classificarTipos(
    brutos.map((b) => ({ ...b, instante: paraInstante(b.data, b.hora) })),
  )
}

function extrairPagina(itens: ItemTexto[], indicePagina: number, ano: number): Bruto[] {
  const cabecalhos = itens.filter((i) => i.texto.startsWith('HORA'))
  if (cabecalhos.length === 0) return []
  const yCabecalho = Math.min(...cabecalhos.map((c) => c.y))
  const abaixo = itens.filter((i) => i.y < yCabecalho - TOLERANCIA_Y)

  const dias = abaixo.filter((i) => RE_DIA.test(i.texto))
  // As colunas sao os x distintos dos numeros de dia, da esquerda para a direita.
  const colunas = agrupar(dias.map((d) => d.x)).sort((a, b) => a - b)
  if (colunas.length !== MESES_POR_PAGINA * 2) {
    throw new Error(`Pagina ${indicePagina + 1}: esperava 8 colunas de dias, achei ${colunas.length}`)
  }
  const colunaDe = (x: number) => {
    let indice = -1
    colunas.forEach((c, i) => {
      if (x >= c - TOLERANCIA_Y) indice = i
    })
    return indice
  }

  const horas = abaixo.filter((i) => RE_HORA.test(i.texto))
  const alturas = abaixo.filter((i) => RE_ALTURA.test(i.texto))
  const saida: Bruto[] = []

  for (const h of horas) {
    const coluna = colunaDe(h.x)
    // O dia dono do par e o numero de dia mais proximo acima (ou na mesma linha).
    const dono = dias
      .filter((d) => colunaDe(d.x) === coluna && d.y >= h.y - TOLERANCIA_Y)
      .sort((a, b) => a.y - b.y)[0]
    // A altura e o primeiro numero a direita, na mesma linha.
    const altura = alturas
      .filter((a) => Math.abs(a.y - h.y) <= TOLERANCIA_Y && a.x > h.x && colunaDe(a.x) === coluna)
      .sort((a, b) => a.x - b.x)[0]
    if (!dono || !altura) {
      throw new Error(`Pagina ${indicePagina + 1}: hora ${h.texto} sem dia ou sem altura`)
    }
    const mes = indicePagina * MESES_POR_PAGINA + Math.floor(coluna / 2) + 1
    const data = `${ano}-${String(mes).padStart(2, '0')}-${dono.texto}`
    if (!dataValida(data)) throw new Error(`Data invalida extraida: ${data}`)
    saida.push({ data, hora: h.texto, altura_m: Number(altura.texto) })
  }
  return saida
}

/** Alta ou baixa, pela vizinhanca: o extremo maior que o vizinho e alta. As
 *  mares semidiurnas alternam, entao basta comparar com o evento seguinte (ou
 *  com o anterior, no ultimo). */
export function classificarTipos<T extends { altura_m: number }>(eventos: T[]): Array<T & { tipo: TipoMare }> {
  return eventos.map((e, i) => {
    const vizinho = eventos[i + 1] ?? eventos[i - 1]
    const tipo: TipoMare = vizinho && e.altura_m > vizinho.altura_m ? 'alta' : 'baixa'
    return { ...e, tipo }
  })
}

function agrupar(valores: number[]): number[] {
  const grupos: number[] = []
  for (const v of valores) {
    if (!grupos.some((g) => Math.abs(g - v) <= TOLERANCIA_Y)) grupos.push(v)
  }
  return grupos
}

function dataValida(data: string): boolean {
  const d = new Date(`${data}T12:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data
}
