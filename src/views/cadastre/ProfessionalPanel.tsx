// src/views/cadastre/ProfessionalPanel.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { Eye, EyeOff, Save, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useMyProfessional, useUpsertProfessional } from '@/hooks/useProfessionals'
import {
  PROFESSIONAL_CATEGORIES,
  PROFESSIONAL_CATEGORY_LABELS,
  validateWhatsApp,
  type ProfessionalCategory,
  type PortfolioItem,
} from '@/types/professional'

export default function ProfessionalPanel() {
  return <AuthGuard><ProfessionalPanelInner /></AuthGuard>
}

const PRESET_SPECIALTIES = [
  'Coaching', 'Mentoria', 'Liderança', 'Marketing', 'Design',
  'Fotografia', 'Vídeo', 'Drone', 'Finanças', 'Jurídico',
  'Educação', 'Tecnologia', 'Gestão', 'Vendas', 'RH',
]

function ProfessionalPanelInner() {
  const router = useRouter()
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { data: pro, isLoading } = useMyProfessional()
  const upsert = useUpsertProfessional()

  const initialized = useRef(false)

  const [tab, setTab] = useState<'perfil' | 'portfolio' | 'visibilidade'>('perfil')
  const [displayName, setDisplayName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [category, setCategory] = useState<ProfessionalCategory>('outro')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [website, setWebsite] = useState('')
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize form when pro data loads (only once — guard prevents re-hydration after save)
  useEffect(() => {
    if (pro && !initialized.current) {
      initialized.current = true
      setDisplayName(pro.display_name)
      setHeadline(pro.headline)
      setBio(pro.bio ?? '')
      setCategory(pro.category)
      setSpecialties(pro.specialties)
      setWhatsapp(pro.whatsapp ?? '')
      setInstagram(pro.instagram ?? '')
      setWebsite(pro.website ?? '')
      setPortfolioItems(pro.portfolio_items ?? [])
    }
  }, [pro])

  function toggleSpecialty(s: string) {
    setSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function addPortfolioItem() {
    setPortfolioItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), title: '', description: '', image_url: '', url: '' },
    ])
  }

  function removePortfolioItem(id: string) {
    setPortfolioItems(prev => prev.filter(i => i.id !== id))
  }

  function updatePortfolioItem(id: string, field: keyof PortfolioItem, value: string) {
    setPortfolioItems(prev =>
      prev.map(i => (i.id === id ? { ...i, [field]: value } : i))
    )
  }

  async function handleSave(publishOverride?: boolean) {
    setError(null)
    if (!displayName.trim()) { setError(t('professional_panel.error_display_name_required')); return }
    if (!headline.trim()) { setError(t('professional_panel.error_headline_required')); return }

    const sanitizedWa = whatsapp ? validateWhatsApp(whatsapp) : undefined
    if (whatsapp && !sanitizedWa) {
      setError(t('professional_panel.error_invalid_whatsapp'))
      return
    }

    const invalidPortfolioItem = portfolioItems.find(i => !i.title.trim())
    if (invalidPortfolioItem) {
      setError(t('professional_panel.error_portfolio_title_required'))
      return
    }

    setSaving(true)
    try {
      await upsert.mutateAsync({
        display_name: displayName.trim(),
        headline: headline.trim(),
        bio: bio.trim() || undefined,
        category,
        specialties,
        portfolio_items: portfolioItems,
        whatsapp: sanitizedWa ?? undefined,
        instagram: instagram.trim() || undefined,
        website: website.trim() || undefined,
        is_published: publishOverride ?? pro?.is_published ?? false,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('professional_panel.error_save'))
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish() {
    await handleSave(!(pro?.is_published ?? false))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'perfil' as const, label: t('professional_panel.tab_profile') },
    { id: 'portfolio' as const, label: t('professional_panel.tab_portfolio') },
    { id: 'visibilidade' as const, label: t('professional_panel.tab_visibility') },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-14 flex items-center gap-4">
          <button type="button" onClick={() => router.push(lp('/cadastre/painel'))} className="text-sm text-[#737373] hover:text-[#1A1A1A]">
            {t('professional_panel.back_to_painel')}
          </button>
          <span className="text-sm font-semibold text-[#1A1A1A]">{t('professional_panel.title')}</span>
          {pro?.is_published && (
            <a
              href={lp(`/contrate/profissional/${pro.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-teal hover:underline"
            >
              {t('professional_panel.view_profile')} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        {/* Tab nav */}
        <div className="flex gap-1 border-b border-[#E8E4DF] mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-teal text-teal'
                  : 'border-transparent text-[#737373] hover:text-[#1A1A1A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error / success */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            {t('professional_panel.saved_success')}
          </div>
        )}

        {/* ── Tab: Perfil ── */}
        {tab === 'perfil' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                {t('professional_panel.display_name_label')}
              </label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={t('professional_panel.display_name_placeholder')}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                {t('professional_panel.headline_label')}
              </label>
              <input
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder={t('professional_panel.headline_placeholder')}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                {t('professional_panel.category_label')}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProfessionalCategory)}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white"
              >
                {PROFESSIONAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{PROFESSIONAL_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                {t('professional_panel.specialties_label')}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SPECIALTIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      specialties.includes(s)
                        ? 'bg-teal text-white'
                        : 'bg-[#F5F2EE] text-[#555] hover:bg-[#E8E4DF]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                {t('professional_panel.bio_label')}
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                placeholder={t('professional_panel.bio_placeholder')}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                  {t('professional_panel.whatsapp_label')}
                </label>
                <input
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder={t('professional_panel.whatsapp_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <p className="text-[10px] text-[#aaa] mt-1">{t('professional_panel.whatsapp_hint')}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                  {t('professional_panel.instagram_label')}
                </label>
                <input
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder={t('professional_panel.instagram_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
                  {t('professional_panel.website_label')}
                </label>
                <input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder={t('professional_panel.website_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Portfólio ── */}
        {tab === 'portfolio' && (
          <div className="space-y-4">
            {portfolioItems.length === 0 && (
              <p className="text-sm text-[#737373]">{t('professional_panel.no_portfolio_items')}</p>
            )}
            {portfolioItems.map((item, idx) => (
              <div key={item.id} className="bg-white border border-[#E8E4DF] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#737373] uppercase tracking-wide">
                    {t('professional_panel.portfolio_item_label', { n: idx + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePortfolioItem(item.id)}
                    className="text-[#737373] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={item.title}
                  onChange={e => updatePortfolioItem(item.id, 'title', e.target.value)}
                  placeholder={t('professional_panel.portfolio_title_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <input
                  value={item.description ?? ''}
                  onChange={e => updatePortfolioItem(item.id, 'description', e.target.value)}
                  placeholder={t('professional_panel.portfolio_desc_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <input
                  value={item.image_url ?? ''}
                  onChange={e => updatePortfolioItem(item.id, 'image_url', e.target.value)}
                  placeholder={t('professional_panel.portfolio_image_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <input
                  value={item.url ?? ''}
                  onChange={e => updatePortfolioItem(item.id, 'url', e.target.value)}
                  placeholder={t('professional_panel.portfolio_url_placeholder')}
                  className="w-full border border-[#E8E4DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addPortfolioItem}
              className="flex items-center gap-2 text-sm font-semibold text-teal border border-teal/30 bg-teal/5 px-4 py-2.5 rounded-xl hover:bg-teal/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('professional_panel.add_portfolio_item')}
            </button>
          </div>
        )}

        {/* ── Tab: Visibilidade ── */}
        {tab === 'visibilidade' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8E4DF] rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm mb-1">
                    {t('professional_panel.profile_status')}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {pro?.is_published
                      ? t('professional_panel.profile_visible')
                      : t('professional_panel.profile_draft')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  pro?.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[#F5F2EE] text-[#737373]'
                }`}>
                  {pro?.is_published ? t('professional_panel.published') : t('professional_panel.draft')}
                </span>
              </div>
              <p className="text-xs text-[#aaa] mt-3">
                {t('professional_panel.approval_note')}
              </p>
            </div>
            {pro?.slug && (
              <div className="bg-white border border-[#E8E4DF] rounded-xl p-5">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-1">
                  {t('professional_panel.public_url')}
                </p>
                <p className="text-sm text-[#1A1A1A] font-mono">
                  vivegostoso.com.br/contrate/profissional/{pro.slug}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Save bar */}
        <div className="mt-8 flex items-center gap-3 border-t border-[#E8E4DF] pt-6">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 bg-teal text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? t('professional_panel.saving') : t('professional_panel.save')}
          </button>
          <button
            type="button"
            onClick={togglePublish}
            disabled={saving}
            className="flex items-center gap-2 border border-[#E8E4DF] text-[#737373] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F5F2EE] transition-colors disabled:opacity-50"
          >
            {pro?.is_published
              ? <><EyeOff className="w-4 h-4" /> {t('professional_panel.unpublish')}</>
              : <><Eye className="w-4 h-4" /> {t('professional_panel.publish')}</>
            }
          </button>
        </div>
      </main>
    </div>
  )
}
