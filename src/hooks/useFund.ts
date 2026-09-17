import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FundEntry } from '@/types/database'
import { resumirFundo, type LinhaDoFundo } from '@/lib/fundo'

export function useFundEntries(
  options?: Pick<UseQueryOptions<FundEntry[]>, 'initialData'>,
) {
  return useQuery({
    queryKey: ['fund-entries'],
    queryFn: async (): Promise<FundEntry[]> => {
      const { data, error } = await supabase
        .from('gostoso_fund_entries')
        .select('*')
        .order('entry_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as FundEntry[]
    },
    ...options,
  })
}

export function useFundSummary() {
  return useQuery({
    queryKey: ['fund-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_fund_entries')
        .select('amount_cents, status, category')
      if (error) throw error
      /* A conta mora em src/lib/fundo.ts, com teste. Ela ja publicou gasto como
         arrecadacao uma vez: nao volta a ser calculo solto dentro do hook. */
      return resumirFundo((data ?? []) as LinhaDoFundo[])
    },
  })
}
