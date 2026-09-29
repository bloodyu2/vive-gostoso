import { createBrowserClient } from '@supabase/ssr'
import { fetchQueAvisa } from '@/lib/supabase/avisar-gravacao'

// Browser client — session stored in cookies (shared with SSR middleware).
// Using untyped client; queries are typed via explicit casts on query results.
// KAN-463: o fetch avisa o servidor depois de gravacao de quem esta logado, para
// as paginas publicas (em cache de dados) mostrarem o dado novo na hora.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { global: { fetch: fetchQueAvisa() } }
)
