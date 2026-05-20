import type { Metadata } from 'next'
import Transfer from '@/views/Transfer'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Transfer São Miguel do Gostoso | Aeroporto Natal',
  description: 'Transfer do aeroporto de Natal para São Miguel do Gostoso. 110 km, ~1h50. Prestadores verificados, preço fixo, direto no WhatsApp.',
}

// Transfer fetches data client-side via useTransfers hook (gostoso_transfers table)
export default function TransferPage() {
  return <Transfer />
}
