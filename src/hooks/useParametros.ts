import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { indexarParametros, type Parametro, type Parametros } from '@/lib/parametros'

/**
 * Preço e percentual do produto, de uma fonte só.
 *
 * Sem `placeholderData` e sem valor padrão de propósito: enquanto não carregar,
 * quem chama recebe `undefined` e esconde o número. Um padrão aqui reintroduziria
 * o problema que a tabela resolve.
 */
export function useParametros(options?: Pick<UseQueryOptions<Parametros>, 'initialData'>) {
  return useQuery({
    queryKey: ['parametros-produto'],
    staleTime: 1000 * 60 * 60,
    queryFn: async (): Promise<Parametros> => {
      const { data, error } = await supabase
        .from('gostoso_parametros_produto')
        .select('chave, valor, unidade')
      if (error) throw error
      return indexarParametros((data ?? []) as Parametro[])
    },
    ...options,
  })
}
