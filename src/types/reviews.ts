export interface Review {
  id: string
  business_id: string | null
  professional_id: string | null
  transfer_id: string | null
  author_name: string | null
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  approved: boolean
  created_at: string
}

export type ReviewTarget = 'business' | 'professional' | 'transfer'

export interface ReviewInsert {
  business_id?: string
  professional_id?: string
  transfer_id?: string
  author_name?: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}
