import { createBrowserClient } from '@supabase/ssr'

// Browser client — session stored in cookies (shared with SSR middleware).
// Using untyped client; queries are typed via explicit casts on query results.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)
