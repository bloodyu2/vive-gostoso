// src/hooks/useModeration.ts
// Shared factory for the "moderate this table" mutation pattern used by
// admin approve/reject flows that boil down to:
//   approve -> update `${activeField}` to true
//   reject  -> delete the row
// Tables whose moderation logic genuinely diverges from this shape (e.g.
// gostoso_claim_requests, which uses an atomic RPC + notification insert,
// or gostoso_transfers, which has a 3-state approve/reject/deactivate
// action) keep their own hooks instead of using this factory.
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/components/ui/toast'

interface ModerateListingOptions {
  /** Supabase table name, e.g. 'gostoso_job_listings' */
  table: string
  /** Boolean column set to `true` on approve. Defaults to 'is_active'. */
  activeField?: string
  /** Query keys to invalidate on success. */
  invalidateKeys: QueryKey[]
  /** Message shown in the error toast when the mutation fails. */
  errorMessage?: string
}

/** Approve (set active field true) or reject (delete row) a pending listing — admin only. */
export function useModerateListing({
  table,
  activeField = 'is_active',
  invalidateKeys,
  errorMessage = 'Não foi possível concluir a moderação. Tente novamente.',
}: ModerateListingOptions) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase
          .from(table)
          .update({ [activeField]: true })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => qc.invalidateQueries({ queryKey: key }))
    },
    onError: () => {
      showToast(errorMessage, 'error')
    },
  })
}
