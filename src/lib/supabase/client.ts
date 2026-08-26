// lib/supabase/client.ts
// Re-exports the singleton browser client so all client-side code shares one instance.
import { supabase } from '@/lib/supabase'
export function createClient() { return supabase }
