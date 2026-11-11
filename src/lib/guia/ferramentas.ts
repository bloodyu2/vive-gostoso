// KAN-686: ferramentas do guia. So leitura, funcoes fixas, sem SQL livre do modelo, com a chave anonima (RLS).
// Argumentos vem do modelo, que vem do visitante: tudo e validado por lista ou padrao antes de tocar o banco.

import type { SupabaseClient } from '@supabase/supabase-js'
import { PRAIAS_MARES, praiaPorSlug } from '@/data/praias-mares'
import { buscarLinhas } from '@/lib/mares/consulta'
import { dataLocal, formatarHora, somarDias } from '@/lib/mares/tempo'
import { linhasParaEventos } from '@/lib/mares/semana'
import { estacoesDa } from '@/lib/mares/carregar'
import { paraComparar, textoDeDadoSeguro } from './filtro'

export type ClienteGuia = Pick<SupabaseClient, 'from'>

export const DEFINICOES_DE_FERRAMENTA = [
  {
    type: 'function',
    function: {
      name: 'listar_categorias',
      description: 'Lista as categorias do guia (comer, ficar, passeios etc.) com o slug de cada uma.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_negocios',
      description: 'Busca negocios publicados no Vive Gostoso por categoria (slug) e/ou palavra. Devolve nome, slug, descricao curta, faixa de preco e endereco.',
      parameters: {
        type: 'object',
        properties: {
          categoria: { type: 'string', description: 'slug da categoria, ex. comer' },
          termo: { type: 'string', description: 'palavra ou nome, ate 40 caracteres' },
          limite: { type: 'integer', minimum: 1, maximum: 6 },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'eventos_proximos',
      description: 'Eventos de Sao Miguel do Gostoso nos proximos dias.',
      parameters: { type: 'object', properties: { dias: { type: 'integer', minimum: 1, maximum: 60 } }, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'tabua_de_mares',
      description: 'Horarios e alturas de mare de um dia. Pode filtrar por praia (slug).',
      parameters: {
        type: 'object',
        properties: {
          praia: { type: 'string', enum: PRAIAS_MARES.map((p) => p.slug) },
          data: { type: 'string', description: 'AAAA-MM-DD, de hoje ate 14 dias' },
        },
        additionalProperties: false,
      },
    },
  },
] as const

export type ResultadoDeFerramenta = { json: string; slugs: string[] }

const SLUG = /^[a-z0-9-]{1,40}$/
const DATA = /^\d{4}-\d{2}-\d{2}$/

function termoSeguro(t: unknown): string {
  // so letras, numeros, espaco e hifen: nada que o PostgREST leia como operador, virgula ou parentese
  return paraComparar(String(t ?? '')).replace(/[^a-z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40)
}

function inteiro(v: unknown, min: number, max: number, padrao: number): number {
  const n = Number(v)
  return Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : padrao
}

export async function executarFerramenta(
  nome: string,
  argumentos: unknown,
  cliente: ClienteGuia | null,
  agora: Date = new Date(),
): Promise<ResultadoDeFerramenta> {
  const args = typeof argumentos === 'object' && argumentos !== null ? (argumentos as Record<string, unknown>) : {}
  if (!cliente) return { json: JSON.stringify({ erro: 'dados_indisponiveis' }), slugs: [] }

  try {
    switch (nome) {
      case 'listar_categorias': {
        const { data } = await cliente.from('gostoso_categories').select('name, slug').eq('active', true).order('display_order').limit(20)
        const itens = (data ?? []).map((c: { name: string; slug: string }) => ({ nome: textoDeDadoSeguro(c.name, 40), slug: c.slug }))
        return { json: JSON.stringify({ categorias: itens }), slugs: [] }
      }

      case 'buscar_negocios': {
        const limite = inteiro(args.limite, 1, 6, 5)
        const slugCategoria = typeof args.categoria === 'string' && SLUG.test(args.categoria) ? args.categoria : null
        const termo = termoSeguro(args.termo)

        let categoriaId: string | number | null = null
        if (slugCategoria) {
          const { data: cat } = await cliente.from('gostoso_categories').select('id').eq('slug', slugCategoria).eq('active', true).maybeSingle()
          if (!cat) return { json: JSON.stringify({ negocios: [], aviso: 'categoria_nao_encontrada' }), slugs: [] }
          categoriaId = (cat as { id: string | number }).id
        }

        let consulta = cliente
          .from('gostoso_businesses')
          .select('name, slug, description, address, price_range, is_verified')
          .eq('active', true)
          .eq('is_published', true)
        if (categoriaId !== null) consulta = consulta.eq('category_id', categoriaId)
        if (termo) consulta = consulta.or(`name.ilike.%${termo}%,description.ilike.%${termo}%`)
        const { data } = await consulta.order('is_featured', { ascending: false }).order('display_order', { ascending: true }).limit(limite)

        const negocios = (data ?? []).map((n: Record<string, unknown>) => ({
          nome: textoDeDadoSeguro(String(n.name), 80),
          slug: String(n.slug),
          descricao: textoDeDadoSeguro(String(n.description ?? ''), 180),
          endereco: textoDeDadoSeguro(String(n.address ?? ''), 80),
          faixa_de_preco: textoDeDadoSeguro(String(n.price_range ?? ''), 20),
          verificado: n.is_verified === true,
        })).filter((n) => n.nome && SLUG.test(n.slug))
        return { json: JSON.stringify({ negocios }), slugs: negocios.map((n) => n.slug) }
      }

      case 'eventos_proximos': {
        const dias = inteiro(args.dias, 1, 60, 30)
        const ate = new Date(agora.getTime() + dias * 86_400_000)
        const { data } = await cliente
          .from('gostoso_events')
          .select('name, starts_at, ends_at, location, event_type')
          .eq('active', true)
          .gte('starts_at', agora.toISOString())
          .lte('starts_at', ate.toISOString())
          .order('starts_at', { ascending: true })
          .limit(6)
        const eventos = (data ?? []).map((e: Record<string, unknown>) => ({
          nome: textoDeDadoSeguro(String(e.name), 80),
          inicio: String(e.starts_at ?? '').slice(0, 16),
          local: textoDeDadoSeguro(String(e.location ?? ''), 80),
          tipo: textoDeDadoSeguro(String(e.event_type ?? ''), 30),
        })).filter((e) => e.nome)
        return { json: JSON.stringify({ eventos }), slugs: [] }
      }

      case 'tabua_de_mares': {
        const hoje = dataLocal(agora)
        const data = typeof args.data === 'string' && DATA.test(args.data) ? args.data : hoje
        if (data < hoje || data > somarDias(hoje, 14)) return { json: JSON.stringify({ erro: 'data_fora_da_janela', janela: `${hoje} a ${somarDias(hoje, 14)}` }), slugs: [] }
        const praia = typeof args.praia === 'string' ? praiaPorSlug(args.praia) : undefined
        const { principal } = estacoesDa(praia)
        const { linhas, erro } = await buscarLinhas(cliente as never, principal, data, somarDias(data, 1))
        if (erro || linhas.length === 0) return { json: JSON.stringify({ mares: [], aviso: 'sem_dado_para_o_dia' }), slugs: [] }
        const mares = linhasParaEventos(linhas).map((e) => ({ hora: formatarHora(e.instante), altura_m: Number(e.altura_m.toFixed(2)), tipo: e.tipo }))
        return { json: JSON.stringify({ data, praia: praia?.nome ?? 'Sao Miguel do Gostoso', mares }), slugs: [] }
      }

      default:
        return { json: JSON.stringify({ erro: 'ferramenta_desconhecida' }), slugs: [] }
    }
  } catch {
    return { json: JSON.stringify({ erro: 'falha_na_leitura' }), slugs: [] }
  }
}
