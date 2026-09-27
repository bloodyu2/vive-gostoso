import { cache } from 'react'
import { buscarLinhas, clienteAnonimo, type ClienteMares } from './consulta'
import {
  DIAS_NA_TELA,
  combinarEstacoes,
  diasSemDado,
  linhasParaEventos,
  montarSemana,
  type EventoLido,
  type LinhaLida,
} from './semana'
import { dataLocal, inicioDoDia, somarDias } from './tempo'
import { ESTACOES, praiaPorSlug, type CodigoEstacao, type PraiaMare } from '@/data/praias-mares'

/** Estacoes da pagina indice e de quem nao tem praia: Guamare, com Natal de reserva. */
export const ESTACAO_PADRAO: { principal: CodigoEstacao; reserva: CodigoEstacao } = { principal: 'GUAMARE', reserva: 'COM3DN' }

export function estacoesDa(praia?: PraiaMare): { principal: CodigoEstacao; reserva: CodigoEstacao } {
  return praia ? { principal: praia.estacaoPrincipal, reserva: praia.estacaoReserva } : ESTACAO_PADRAO
}

/** Uma leitura por estacao e por renderizacao, compartilhada entre
 *  generateMetadata e a pagina (cache do React). Le um dia antes e dois depois
 *  da janela da tela para a curva ter os extremos vizinhos nas pontas. */
export const lerEstacao = cache(async (hoje: string, estacao: CodigoEstacao) => {
  const fixture = await lerFixtureDeDesenvolvimento(hoje, estacao)
  if (fixture) return { eventos: linhasParaEventos(fixture), erro: false }
  return lerEstacaoDe(clienteAnonimo(), hoje, estacao)
})

export async function lerEstacaoDe(
  cliente: ClienteMares | null,
  hoje: string,
  estacao: CodigoEstacao,
): Promise<{ eventos: EventoLido[]; erro: boolean }> {
  const { linhas, erro } = await buscarLinhas(cliente, estacao, somarDias(hoje, -1), somarDias(hoje, DIAS_NA_TELA + 1))
  return { eventos: linhasParaEventos(linhas), erro }
}

/** Mares de uma praia (ou do indice): a principal, e a reserva nos dias em que
 *  a principal nao tem dado. */
export async function lerEventos(
  hoje: string,
  praia?: PraiaMare,
  ler: (hoje: string, estacao: CodigoEstacao) => Promise<{ eventos: EventoLido[] }> = lerEstacao,
) {
  const { principal, reserva } = estacoesDa(praia)
  const [p, r] = await Promise.all([ler(hoje, principal), ler(hoje, reserva)])
  return { ...combinarEstacoes(p.eventos, r.eventos), principal, reserva }
}

export async function carregarSemana(
  slug?: string,
  hoje = dataLocal(new Date()),
  ler?: (hoje: string, estacao: CodigoEstacao) => Promise<{ eventos: EventoLido[] }>,
) {
  const praia = slug ? praiaPorSlug(slug) : undefined
  const { eventos, diasDaReserva, principal, reserva } = await lerEventos(hoje, praia, ler)
  const semana = montarSemana(eventos, hoje, praia, diasDaReserva)
  const vazia = semana.every((d) => !d.temDados)
  return { hoje, semana, vazia, praia, principal, reserva }
}

/** Dias dos proximos 30 sem previsao gravada, por estacao (aviso do admin).
 *  Cobre as duas estacoes: a edicao nova da Marinha precisa entrar para ambas. */
export async function diasSemPrevisao(janelaDias = 30): Promise<Array<{ estacao: CodigoEstacao; nome: string; dias: string[] }>> {
  const hoje = dataLocal(new Date())
  const cliente = clienteAnonimo()
  const codigos = Object.keys(ESTACOES) as CodigoEstacao[]
  return Promise.all(
    codigos.map(async (estacao) => {
      const { linhas } = await buscarLinhas(cliente, estacao, hoje, somarDias(hoje, janelaDias))
      return { estacao, nome: ESTACOES[estacao].nome, dias: diasSemDado(linhasParaEventos(linhas), hoje, janelaDias) }
    }),
  )
}

/* So em desenvolvimento: MARES_FIXTURE_JSON aponta para a saida do importador
   com --json (uma ou mais estacoes), para ver a tela com dados antes da tabela
   ter a estacao em producao. Ignorado quando NODE_ENV e production. */
async function lerFixtureDeDesenvolvimento(hoje: string, estacao: CodigoEstacao): Promise<LinhaLida[] | null> {
  const caminho = process.env.MARES_FIXTURE_JSON
  if (!caminho || process.env.NODE_ENV === 'production') return null
  const { readFile } = await import('node:fs/promises')
  const todas = JSON.parse(await readFile(caminho, 'utf8')) as Array<LinhaLida & { estacao?: string }>
  const de = inicioDoDia(somarDias(hoje, -1)).getTime()
  const ate = inicioDoDia(somarDias(hoje, DIAS_NA_TELA + 1)).getTime()
  return todas.filter((l) => {
    const t = new Date(l.data_hora).getTime()
    return (l.estacao === undefined || l.estacao === estacao) && t >= de && t < ate
  })
}
