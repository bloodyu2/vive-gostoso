import type { EventoMare, TipoMare } from './extrair-tabua'

export type LinhaMare = {
  estacao: string
  data_hora: string
  altura_m: number
  tipo: TipoMare
  fonte: string
  ano: number
}

export function montarLinhas(eventos: EventoMare[], estacao: string, fonte: string, ano: number): LinhaMare[] {
  return eventos.map((e) => ({
    estacao,
    data_hora: `${e.data}T${e.hora.slice(0, 2)}:${e.hora.slice(2, 4)}:00-03:00`,
    altura_m: e.altura_m,
    tipo: e.tipo,
    fonte,
    ano,
  }))
}

export type Resumo = Record<string, Record<string, number>>

/** Contagem por estacao e por mes local (AAAA-MM, lido da propria data_hora). */
export function resumoPorMes(linhas: LinhaMare[]): Resumo {
  const resumo: Resumo = {}
  for (const l of linhas) {
    const mes = l.data_hora.slice(0, 7)
    resumo[l.estacao] ??= {}
    resumo[l.estacao][mes] = (resumo[l.estacao][mes] ?? 0) + 1
  }
  return resumo
}

export function formatarResumo(resumo: Resumo): string {
  const linhas: string[] = []
  for (const [estacao, meses] of Object.entries(resumo)) {
    linhas.push(`Estacao ${estacao}`)
    let total = 0
    for (const mes of Object.keys(meses).sort()) {
      linhas.push(`  ${mes}  ${meses[mes]}`)
      total += meses[mes]
    }
    linhas.push(`  total  ${total}`)
  }
  return linhas.join('\n')
}
