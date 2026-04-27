import { createClient } from '@supabase/supabase-js'

// Using untyped client; queries are typed via explicit casts on query results
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)
