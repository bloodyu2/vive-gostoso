import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FundEntry } from '@/types/database'

export function useFundEntries() {
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
      const entries = (data ?? []) as Pick<FundEntry, 'amount_cents' | 'status' | 'category'>[]
      const totalCents = entries
        .filter(e => e.status === 'realizado' && e.amount_cents > 0)
        .reduce((s, e) => s + e.amount_cents, 0)
      const marketingCents = entries
        .filter(e => e.category === 'marketing')
        .reduce((s, e) => s + e.amount_cents, 0)
      const operacaoCents = entries
        .filter(e => e.category === 'operacao')
        .reduce((s, e) => s + e.amount_cents, 0)
      const acumuladoCents = entries
        .filter(e => e.category === 'acumulado')
        .reduce((s, e) => s + e.amount_cents, 0)
      return { totalCents, marketingCents, operacaoCents, acumuladoCents }
    },
  })
}
