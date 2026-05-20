// src/hooks/useAuth.ts
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading, supabase }
}
