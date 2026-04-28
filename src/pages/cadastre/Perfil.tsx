import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/hooks/useCategories'
import type { Business } from '@/types/database'

export default function Perfil() {
  return <AuthGuard><PerfilInner /></AuthGuard>
}

type PartialBusiness = Partial<Pick<Business, 'id' | 'name' | 'description' | 'address' | 'whatsapp' | 'instagram' | 'website' | 'category_id'>>

function PerfilInner() {
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const navigate = useNavigate()
  const [biz, setBiz] = useState<PartialBusiness>({})
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('gostoso_profiles')
      .select('id, business_id')
      .eq('auth_user_id', user.id)
      .single()
      .then(async ({ data: profile }) => {
        if (!profile) {
          const { data: p } = await supabase
            .from('gostoso_profiles')
            .insert([{ auth_user_id: user.id, email: user.email ?? '' }])
            .select('id')
            .single()
          if (p) setProfileId((p as { id: string }).id)
          return
        }
        const prof = profile as { id: string; business_id: string | null }
        setProfileId(prof.id)
        if (prof.business_id) {
          const { data: b } = await supabase
            .from('gostoso_businesses')
            .select('id, name, description, address, whatsapp, instagram, website, category_id')
            .eq('id', prof.business_id)
            .single()
          if (b) setBiz(b as PartialBusiness)
        }
      })
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profileId) return
    setSaving(true)

    const slug = (biz.name ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    if (biz.id) {
      await supabase
        .from('gostoso_businesses')
        .update({ name: biz.name, description: biz.description, address: biz.address, whatsapp: biz.whatsapp, instagram: biz.instagram, website: biz.website, category_id: biz.category_id, slug })
        .eq('id', biz.id)
    } else {
      const { data: newBiz } = await supabase
        .from('gostoso_businesses')
        .insert([{
          name: biz.name ?? 'Sem nome', slug,
          profile_id: profileId,
          description: biz.description ?? null,
          address: biz.address ?? null,
          whatsapp: biz.whatsapp ?? null,
          instagram: biz.instagram ?? null,
          website: biz.website ?? null,
          category_id: biz.category_id ?? null,
        }])
        .select('id')
        .single()
      if (newBiz) {
        const nb = newBiz as { id: string }
        setBiz(b => ({ ...b, id: nb.id }))
        await supabase
          .from('gostoso_profiles')
          .update({ business_id: nb.id })
          .eq('id', profileId)
      }
    }

    setSaving(false)
    navigate('/cadastre/painel')
  }

  const fields = [
    { label: 'Nome do negócio', key: 'name' as const, required: true },
    { label: 'Endereço',        key: 'address' as const },
    { label: 'WhatsApp',        key: 'whatsapp' as const },
    { label: 'Instagram (sem @)', key: 'instagram' as const },
    { label: 'Website',         key: 'website' as const },
  ]

  return (
    <main className="max-w-2xl mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-3xl font-semibold mb-8">Meu Negócio</h1>
      <form onSubmit={handleSave} className="space-y-5">
        {fields.map(({ label, key, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1.5">{label}</label>
            <input
              type="text"
              required={required}
              value={biz[key] ?? ''}
              onChange={e => setBiz(b => ({ ...b, [key]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1.5">Descrição</label>
          <textarea
            rows={3}
            value={biz.description ?? ''}
            onChange={e => setBiz(b => ({ ...b, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Categoria</label>
          <select
            value={biz.category_id ?? ''}
            onChange={e => setBiz(b => ({ ...b, category_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 bg-white"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="primary" disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Salvar negócio'}
        </Button>
      </form>
    </main>
  )
}
