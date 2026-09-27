import { cache } from 'react'
import { buscarLinhas, clienteAnonimo } from './consulta'
import { DIAS_NA_TELA, diasSemDado, linhasParaEventos, montarSemana, type LinhaLida } from './semana'
import { dataLocal, inicioDoDia, somarDias } from './tempo'
import { praiaPorSlug } from '@/data/praias-mares'

/** Uma leitura por renderizacao, compartilhada entre generateMetadata e a
 *  pagina (cache do React). Le um dia antes e dois depois da janela da tela
 *  para a curva ter os extremos vizinhos nas pontas. */
export const lerEventos = cache(async (hoje: string) => {
  const fixture = await lerFixtureDeDesenvolvimento(hoje)
  if (fixture) return { eventos: linhasParaEventos(fixture), erro: false }
  const { linhas, erro } = await buscarLinhas(
    clienteAnonimo(),
    'COM3DN',
    somarDias(hoje, -1),
    somarDias(hoje, DIAS_NA_TELA + 1),
  )
  return { eventos: linhasParaEventos(linhas), erro }
})

export async function carregarSemana(slug?: string) {
  const hoje = dataLocal(new Date())
  const { eventos } = await lerEventos(hoje)
  const praia = slug ? praiaPorSlug(slug) : undefined
  const semana = montarSemana(eventos, hoje, praia)
  const vazia = semana.every((d) => !d.temDados)
  return { hoje, semana, vazia, praia }
}

/** Dias dos proximos 30 sem previsao gravada (aviso do admin). */
export async function diasSemPrevisao(janelaDias = 30): Promise<string[]> {
  const hoje = dataLocal(new Date())
  const { linhas } = await buscarLinhas(clienteAnonimo(), 'COM3DN', hoje, somarDias(hoje, janelaDias))
  return diasSemDado(linhasParaEventos(linhas), hoje, janelaDias)
}

/* So em desenvolvimento: MARES_FIXTURE_JSON aponta para a saida do importador
   com --json, para ver a tela com dados antes da tabela existir em producao.
   Ignorado quando NODE_ENV e production. */
async function lerFixtureDeDesenvolvimento(hoje: string): Promise<LinhaLida[] | null> {
  const caminho = process.env.MARES_FIXTURE_JSON
  if (!caminho || process.env.NODE_ENV === 'production') return null
  const { readFile } = await import('node:fs/promises')
  const todas = JSON.parse(await readFile(caminho, 'utf8')) as LinhaLida[]
  const de = inicioDoDia(somarDias(hoje, -1)).getTime()
  const ate = inicioDoDia(somarDias(hoje, DIAS_NA_TELA + 1)).getTime()
  return todas.filter((l) => {
    const t = new Date(l.data_hora).getTime()
    return t >= de && t < ate
  })
}
