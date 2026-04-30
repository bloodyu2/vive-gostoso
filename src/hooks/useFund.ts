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

export function useAssociadosCount() {
  return useQuery({
    queryKey: ['associados-count'],
    queryFn: async () => {
      // Conta negócios com plano ativo: assinatura mensal OU pagamento anual válido
      const now = new Date().toISOString()
      const { count, error } = await supabase
        .from('gostoso_businesses')
        .select('*', { count: 'exact', head: true })
        .in('plan', ['associado', 'destaque'])
        .or(`stripe_subscription_id.not.is.null,plan_expires_at.gte.${now}`)
      if (error) throw error
      return count ?? 0
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
      const realized = entries.filter(e => e.status === 'realizado')
      const totalCents = realized
        .filter(e => e.amount_cents > 0)
        .reduce((s, e) => s + e.amount_cents, 0)
      const marketingCents = realized
        .filter(e => e.category === 'marketing')
        .reduce((s, e) => s + e.amount_cents, 0)
      const operacaoCents = realized
        .filter(e => e.category === 'operacao')
        .reduce((s, e) => s + e.amount_cents, 0)
      const acumuladoCents = realized
        .filter(e => e.category === 'acumulado')
        .reduce((s, e) => s + e.amount_cents, 0)
      return { totalCents, marketingCents, operacaoCents, acumuladoCents }
    },
  })
}
