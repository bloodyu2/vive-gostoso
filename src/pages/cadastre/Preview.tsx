import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { BusinessCard } from '@/components/business/business-card'
import { supabase } from '@/lib/supabase'
import type { Business } from '@/types/database'

export default function Preview() {
  return <AuthGuard><PreviewInner /></AuthGuard>
}

function PreviewInner() {
  const { user } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('gostoso_profiles')
      .select('business_id')
      .eq('auth_user_id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (!profile) return
        const p = profile as { business_id: string | null }
        if (!p.business_id) return
        supabase
          .from('gostoso_businesses')
          .select('*, category:gostoso_categories(*)')
          .eq('id', p.business_id)
          .single()
          .then(({ data: biz }) => {
            if (biz) setBusiness(biz as Business)
          })
      })
  }, [user])

  return (
    <main className="max-w-sm mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-2xl font-semibold mb-8">Como aparece no diretório</h1>
      {business
        ? <BusinessCard business={business} />
        : <p className="text-[#737373]">
            Nenhum negócio cadastrado ainda.{' '}
            <a href="/cadastre/perfil" className="text-teal font-medium">Cadastrar agora →</a>
          </p>
      }
    </main>
  )
}
