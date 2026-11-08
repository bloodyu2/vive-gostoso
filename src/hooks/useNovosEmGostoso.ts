import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { selecionarNovos, type NegocioNovo } from '@/lib/novos-em-gostoso'

const COLUNAS = 'id, name, slug, cover_url, created_at, is_verified, category:gostoso_categories(name)'

type Linha = Omit<NegocioNovo, 'category'> & {
  category: { name: string } | { name: string }[] | null
}

/** Os negocios que entraram por ultimo, com foto. Busca uma folga (16) porque
 *  `selecionarNovos` ainda tira repetidos e quem ficou sem foto. */
export function useNovosEmGostoso() {
  return useQuery({
    queryKey: ['novos-em-gostoso'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<NegocioNovo[]> => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select(COLUNAS)
        .eq('active', true)
        .eq('is_published', true)
        .not('cover_url', 'is', null)
        .neq('cover_url', '')
        .order('created_at', { ascending: false })
        .limit(16)
      if (error) throw error
      const linhas = ((data ?? []) as Linha[]).map(b => ({
        ...b,
        category: Array.isArray(b.category) ? (b.category[0] ?? null) : b.category,
      }))
      return selecionarNovos(linhas)
    },
  })
}
