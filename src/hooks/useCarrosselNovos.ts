import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  montarCarrossel,
  type ItemCarrossel,
  type NegocioDoCarrossel,
} from '@/lib/carrossel-novos'

const COLUNAS = 'id, name, slug, cover_url, is_verified, category:gostoso_categories(name)'

type Linha = Omit<NegocioDoCarrossel, 'category'> & {
  category: { name: string } | { name: string }[] | null
}

function normalizar(linhas: Linha[] | null): NegocioDoCarrossel[] {
  return (linhas ?? []).map(b => ({
    ...b,
    category: Array.isArray(b.category) ? (b.category[0] ?? null) : b.category,
  }))
}

/** Destaques, novos e verificados da home, ja misturados por `montarCarrossel`. */
export function useCarrosselNovos() {
  return useQuery({
    queryKey: ['carrossel-novos'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ItemCarrossel[]> => {
      const base = () =>
        supabase
          .from('gostoso_businesses')
          .select(COLUNAS)
          .eq('active', true)
          .eq('is_published', true)
          .not('cover_url', 'is', null)
          .neq('cover_url', '')

      /* Os negocios novos nao entram mais aqui: tem faixa propria na home
         ("Novos em Gostoso", useNovosEmGostoso). Com 12 destaques eles ficavam
         nas ultimas posicoes do limite e ninguem chegava a ve-los. */
      const [destaques, verificados] = await Promise.all([
        /* O destaque mais recente abre o carrossel: quem acabou de ser destacado
         (updated_at) aparece primeiro, nao quem se cadastrou primeiro. */
        base().eq('is_featured', true).order('updated_at', { ascending: false }).limit(8),
        base().eq('is_verified', true).order('created_at', { ascending: false }).limit(6),
      ])

      return montarCarrossel({
        destaques: normalizar(destaques.data as Linha[] | null),
        novos: [],
        verificados: normalizar(verificados.data as Linha[] | null),
      })
    },
  })
}
