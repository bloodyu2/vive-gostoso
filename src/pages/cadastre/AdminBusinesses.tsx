import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Pencil, Check, X, ExternalLink } from 'lucide-react'
import { AdminGuard } from '@/components/auth/admin-guard'
import { supabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Business } from '@/types/database'

export default function AdminBusinesses() {
  return <AdminGuard><AdminBusinessesInner /></AdminGuard>
}

interface BusinessRow extends Pick<Business, 'id' | 'name' | 'slug' | 'active' | 'is_published' | 'plan' | 'created_at'> {
  category?: { name: string } | null
}

function useAdminBusinesses() {
  return useQuery<BusinessRow[]>({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, active, is_published, plan, created_at, category:gostoso_categories(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as BusinessRow[]
    },
  })
}

function SlugEditor({ biz, onDone }: { biz: BusinessRow; onDone: () => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(biz.slug)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!value.trim() || value === biz.slug) { setEditing(false); return }
    setSaving(true)
    await supabase.from('gostoso_businesses').update({ slug: value.trim() }).eq('id', biz.id)
    setSaving(false)
    setEditing(false)
    onDone()
  }

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-[#737373]">
        {biz.slug}
        <button onClick={() => setEditing(true)} title="Editar slug" className="ml-1 text-[#B0A99F] hover:text-teal transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        className="font-mono text-xs border border-teal rounded-lg px-2 py-0.5 focus:outline-none w-56"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        autoFocus
      />
      <button onClick={save} disabled={saving} className="text-teal hover:text-teal-dark disabled:opacity-50">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => { setValue(biz.slug); setEditing(false) }} className="text-[#B0A99F] hover:text-coral">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}

function PublishToggle({ biz, onDone }: { biz: BusinessRow; onDone: () => void }) {
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await supabase.from('gostoso_businesses').update({ is_published: !biz.is_published }).eq('id', biz.id)
    setLoading(false)
    onDone()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={biz.is_published ? 'Despublicar' : 'Publicar'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
        biz.is_published
          ? 'border-teal/30 text-teal hover:bg-teal/5'
          : 'border-[#E8E4DF] text-[#737373] hover:border-teal hover:text-teal'
      }`}
    >
      {biz.is_published
        ? <><EyeOff className="w-3.5 h-3.5" /> Despublicar</>
        : <><Eye className="w-3.5 h-3.5" /> Publicar</>}
    </button>
  )
}

function AdminBusinessesInner() {
  const { data: businesses = [], isLoading } = useAdminBusinesses()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')

  const filtered = businesses.filter(b => {
    if (filter === 'draft') return !b.is_published
    if (filter === 'published') return b.is_published
    return true
  })

  const draftCount = businesses.filter(b => !b.is_published).length

  function invalidate() { qc.invalidateQueries({ queryKey: ['admin-businesses'] }) }

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link to="/cadastre/admin" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Admin
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Negócios</h1>
          <p className="text-sm text-[#737373] mt-0.5">
            {businesses.length} total · {draftCount} rascunho{draftCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-[#F5F2EE] rounded-xl p-1">
          {(['all', 'draft', 'published'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === f ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#737373] hover:text-[#1A1A1A]'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'draft' ? 'Rascunho' : 'Publicados'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-20" />)}
        </div>
      )}

      {!isLoading && !filtered.length && (
        <div className="text-center py-16 text-[#B0A99F]">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold">Nenhum negócio nessa categoria</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-[#1A1A1A]">{b.name}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    b.is_published ? 'bg-teal/10 text-teal' : 'bg-[#E8E4DF] text-[#737373]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.is_published ? 'bg-teal' : 'bg-[#A0A0A0]'}`} />
                    {b.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                  {b.category && (
                    <span className="text-xs text-[#737373] bg-[#F5F2EE] px-2 py-0.5 rounded-full">{b.category.name}</span>
                  )}
                  {b.plan !== 'free' && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      b.plan === 'destaque' ? 'text-ocre bg-ocre/10' : 'text-teal bg-teal/10'
                    }`}>
                      {b.plan === 'destaque' ? '★ Destaque' : '✓ Associado'}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <SlugEditor biz={b} onDone={invalidate} />
                </div>
              </div>
              <a
                href={`/negocio/${b.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver página"
                className="flex-shrink-0 text-[#B0A99F] hover:text-teal transition-colors mt-0.5"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#F5F2EE]">
              <PublishToggle biz={b} onDone={invalidate} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
