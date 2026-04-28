// src/types/reviews.ts

export interface Review {
  id: string
  business_id: string
  author_name: string | null
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  approved: boolean
  created_at: string
}

export interface ReviewInsert {
  business_id: string
  author_name?: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}
