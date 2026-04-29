import { useEffect, useRef, useState } from 'react'
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

type ServiceItem = { name: string; description?: string; price?: string }

type PartialBusiness = Partial<Pick<Business,
  | 'id' | 'name' | 'description' | 'address' | 'whatsapp' | 'instagram' | 'website'
  | 'category_id' | 'price_range' | 'menu_url' | 'amenities'
  | 'is_published' | 'services' | 'cover_url' | 'photos'
>>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const INPUT_CLS =
  'w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none'

const SECTION_CLS = 'mb-8 pb-8 border-b border-[#E8E4DF]'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBanner({
  isPublished,
  bizId,
  onToggle,
}: {
  isPublished: boolean
  bizId: string | undefined
  onToggle: (next: boolean) => void
}) {
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!bizId) return
    setLoading(true)
    const next = !isPublished
    await supabase
      .from('gostoso_businesses')
      .update({ is_published: next })
      .eq('id', bizId)
    onToggle(next)
    setLoading(false)
  }

  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-8 border ${
        isPublished
          ? 'bg-teal/5 border-teal/30'
          : 'bg-[#F5F2EE] border-[#E8E4DF]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isPublished
              ? 'bg-teal text-white'
              : 'bg-[#E8E4DF] text-[#737373]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-white' : 'bg-[#737373]'}`}
          />
          {isPublished ? 'Publicado' : 'Rascunho'}
        </span>
        <span className="text-sm text-[#737373]">
          {isPublished
            ? 'Seu negócio está visível no Vive Gostoso.'
            : 'Seu negócio ainda não está visível para o público.'}
        </span>
      </div>
      {bizId && (
        <button
          type="button"
          disabled={loading}
          onClick={toggle}
          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
            isPublished
              ? 'border border-[#E8E4DF] text-[#737373] hover:border-[#737373]'
              : 'bg-teal text-white hover:bg-teal/90'
          }`}
        >
          {loading ? '...' : isPublished ? 'Despublicar' : 'Publicar agora'}
        </button>
      )}
    </div>
  )
}

function PhotoSection({
  bizId,
  coverUrl,
  photos,
  onCoverChange,
  onPhotosChange,
}: {
  bizId: string | undefined
  coverUrl: string | null | undefined
  photos: string[] | undefined
  onCoverChange: (url: string) => void
  onPhotosChange: (urls: string[]) => void
}) {
  const coverRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPhotos = photos ?? []

  async function uploadFile(file: File, path: string): Promise<string> {
    const { error: upErr } = await supabase.storage
      .from('business-photos')
      .upload(path, file, { upsert: true })
    if (upErr) throw upErr
    return supabase.storage.from('business-photos').getPublicUrl(path).data.publicUrl
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !bizId) return
    setError(null)
    setUploadingCover(true)
    try {
      const path = `${bizId}/${Date.now()}-${file.name}`
      const url = await uploadFile(file, path)
      await supabase.from('gostoso_businesses').update({ cover_url: url }).eq('id', bizId)
      onCoverChange(url)
    } catch {
      setError('Erro ao enviar foto de capa. Tente novamente.')
    } finally {
      setUploadingCover(false)
      if (coverRef.current) coverRef.current.value = ''
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !bizId) return
    setError(null)

    const slots = 10 - currentPhotos.length
    if (slots <= 0) {
      setError('Galeria cheia (máximo 10 fotos).')
      return
    }
    const toUpload = files.slice(0, slots)

    setUploadingGallery(true)
    try {
      const urls = await Promise.all(
        toUpload.map(f => uploadFile(f, `${bizId}/${Date.now()}-${f.name}`))
      )
      const next = [...currentPhotos, ...urls]
      await supabase.from('gostoso_businesses').update({ photos: next }).eq('id', bizId)
      onPhotosChange(next)
    } catch {
      setError('Erro ao enviar fotos. Tente novamente.')
    } finally {
      setUploadingGallery(false)
      if (galleryRef.current) galleryRef.current.value = ''
    }
  }

  async function removePhoto(url: string) {
    if (!bizId) return
    const next = currentPhotos.filter(p => p !== url)
    await supabase.from('gostoso_businesses').update({ photos: next }).eq('id', bizId)
    onPhotosChange(next)
  }

  return (
    <section className={SECTION_CLS}>
      <h2 className="font-display text-lg font-semibold mb-4">Fotos</h2>
      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      {/* Cover photo */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Foto de capa</label>
        {coverUrl ? (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-2 border border-[#E8E4DF]">
            <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-40 rounded-2xl border-2 border-dashed border-[#E8E4DF] flex items-center justify-center text-sm text-[#737373] mb-2">
            Sem foto de capa
          </div>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleCoverUpload}
          disabled={!bizId}
        />
        <button
          type="button"
          disabled={uploadingCover || !bizId}
          onClick={() => coverRef.current?.click()}
          className="text-sm font-medium px-4 py-2 rounded-xl border border-[#E8E4DF] hover:border-teal transition-colors disabled:opacity-50"
        >
          {uploadingCover ? 'Enviando...' : coverUrl ? 'Trocar foto de capa' : 'Adicionar foto de capa'}
        </button>
        {!bizId && (
          <p className="text-xs text-[#737373] mt-1">Salve o negócio primeiro para enviar fotos.</p>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Galeria
          <span className="text-[#737373] font-normal ml-1">({currentPhotos.length}/10)</span>
        </label>
        {currentPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {currentPhotos.map(url => (
              <div key={url} className="relative aspect-square">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 transition-colors"
                  title="Remover foto"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        {currentPhotos.length < 10 && (
          <>
            <input
              ref={galleryRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
              disabled={!bizId}
            />
            <button
              type="button"
              disabled={uploadingGallery || !bizId}
              onClick={() => galleryRef.current?.click()}
              className="text-sm font-medium px-4 py-2 rounded-xl border border-[#E8E4DF] hover:border-teal transition-colors disabled:opacity-50"
            >
              {uploadingGallery ? 'Enviando...' : 'Adicionar fotos'}
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function ServicesSection({
  services,
  onChange,
}: {
  services: ServiceItem[]
  onChange: (items: ServiceItem[]) => void
}) {
  function addService() {
    if (services.length >= 10) return
    onChange([...services, { name: '', description: '', price: '' }])
  }

  function removeService(i: number) {
    onChange(services.filter((_, idx) => idx !== i))
  }

  function updateService(i: number, field: keyof ServiceItem, value: string) {
    onChange(services.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  return (
    <section className={SECTION_CLS}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">
          Servicos
          <span className="text-[#737373] font-normal text-sm ml-1">({services.length}/10)</span>
        </h2>
        {services.length < 10 && (
          <button
            type="button"
            onClick={addService}
            className="text-sm font-semibold text-teal hover:text-teal/80 transition-colors"
          >
            + Adicionar servico
          </button>
        )}
      </div>

      {services.length === 0 && (
        <p className="text-sm text-[#737373]">
          Nenhum servico cadastrado ainda. Clique em "Adicionar servico" para comecar.
        </p>
      )}

      <div className="space-y-4">
        {services.map((svc, i) => (
          <div key={i} className="rounded-2xl border border-[#E8E4DF] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1 text-[#737373]">Nome do servico *</label>
                <input
                  type="text"
                  required
                  value={svc.name}
                  onChange={e => updateService(i, 'name', e.target.value)}
                  placeholder="Ex: Corte de cabelo"
                  className={INPUT_CLS}
                />
              </div>
              <button
                type="button"
                onClick={() => removeService(i)}
                className="mt-5 text-sm text-[#737373] hover:text-red-500 transition-colors shrink-0"
                title="Remover"
              >
                Remover
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#737373]">
                Descricao <span className="font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={svc.description ?? ''}
                onChange={e => updateService(i, 'description', e.target.value)}
                placeholder="Breve descricao do servico"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#737373]">
                Preco <span className="font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={svc.price ?? ''}
                onChange={e => updateService(i, 'price', e.target.value)}
                placeholder="Ex: R$ 50 ou A partir de R$ 80"
                className={INPUT_CLS}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main inner component
// ---------------------------------------------------------------------------

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
            .select(
              'id, name, description, address, whatsapp, instagram, website, category_id, ' +
              'price_range, menu_url, amenities, is_published, services, cover_url, photos'
            )
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

    const slug = makeSlug(biz.name ?? '')
    const services = (biz.services ?? []).filter(s => s.name.trim())

    if (biz.id) {
      await supabase
        .from('gostoso_businesses')
        .update({
          name: biz.name,
          description: biz.description,
          address: biz.address,
          whatsapp: biz.whatsapp,
          instagram: biz.instagram,
          website: biz.website,
          category_id: biz.category_id,
          slug,
          price_range: biz.price_range ?? null,
          menu_url: biz.menu_url ?? null,
          amenities: biz.amenities ?? {},
          services,
        })
        .eq('id', biz.id)
    } else {
      const { data: newBiz } = await supabase
        .from('gostoso_businesses')
        .insert([{
          name: biz.name ?? 'Sem nome',
          slug,
          profile_id: profileId,
          active: true,
          is_published: false,
          description: biz.description ?? null,
          address: biz.address ?? null,
          whatsapp: biz.whatsapp ?? null,
          instagram: biz.instagram ?? null,
          website: biz.website ?? null,
          category_id: biz.category_id ?? null,
          price_range: biz.price_range ?? null,
          menu_url: biz.menu_url ?? null,
          amenities: biz.amenities ?? {},
          services,
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

  const textFields = [
    { label: 'Nome do negocio', key: 'name' as const, required: true },
    { label: 'Endereco',        key: 'address' as const },
    { label: 'WhatsApp',        key: 'whatsapp' as const },
    { label: 'Instagram (sem @)', key: 'instagram' as const },
    { label: 'Website',         key: 'website' as const },
  ]

  return (
    <main className="max-w-2xl mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-3xl font-semibold mb-8">Meu Negocio</h1>

      {/* Status banner - only shown when business already exists */}
      {biz.id && (
        <StatusBanner
          isPublished={biz.is_published ?? false}
          bizId={biz.id}
          onToggle={next => setBiz(b => ({ ...b, is_published: next }))}
        />
      )}

      <form onSubmit={handleSave}>
        {/* Basic info */}
        <section className={SECTION_CLS}>
          <h2 className="font-display text-lg font-semibold mb-4">Informacoes basicas</h2>
          <div className="space-y-4">
            {textFields.map(({ label, key, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input
                  type="text"
                  required={required}
                  value={(biz[key] as string | null | undefined) ?? ''}
                  onChange={e => setBiz(b => ({ ...b, [key]: e.target.value }))}
                  className={INPUT_CLS}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1.5">Descricao</label>
              <textarea
                rows={3}
                value={biz.description ?? ''}
                onChange={e => setBiz(b => ({ ...b, description: e.target.value }))}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Categoria</label>
              <select
                value={biz.category_id ?? ''}
                onChange={e => setBiz(b => ({ ...b, category_id: e.target.value }))}
                className={`${INPUT_CLS} bg-white`}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className={SECTION_CLS}>
          <h2 className="font-display text-lg font-semibold mb-4">Detalhes</h2>
          <div className="space-y-4">
            {/* Faixa de preco */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Faixa de preco</label>
              <div className="flex gap-2 flex-wrap">
                {(['', '$', '$$', '$$$'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      setBiz(b => ({ ...b, price_range: (v === '' ? null : v) as '$' | '$$' | '$$$' | null }))
                    }
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                      (biz.price_range ?? '') === v
                        ? 'bg-teal text-white border-teal'
                        : 'bg-white text-[#737373] border-[#E8E4DF] hover:border-teal'
                    }`}
                  >
                    {v || 'Nao informar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Link do cardapio */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Link do cardapio{' '}
                <span className="text-[#737373] font-normal">(opcional)</span>
              </label>
              <input
                type="url"
                value={biz.menu_url ?? ''}
                onChange={e => setBiz(b => ({ ...b, menu_url: e.target.value || null }))}
                placeholder="https://... link do PDF, site ou WhatsApp"
                className={INPUT_CLS}
              />
            </div>

            {/* Comodidades */}
            <div>
              <label className="block text-sm font-medium mb-2">Comodidades</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'wifi' as const,         label: 'WiFi gratis' },
                  { key: 'parking' as const,      label: 'Estacionamento' },
                  { key: 'accessible' as const,   label: 'Acessivel' },
                  { key: 'reservations' as const, label: 'Aceita reservas' },
                ]).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={biz.amenities?.[key] ?? false}
                      onChange={e =>
                        setBiz(b => ({
                          ...b,
                          amenities: { ...b.amenities, [key]: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#E8E4DF] accent-teal"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Photos */}
        <PhotoSection
          bizId={biz.id}
          coverUrl={biz.cover_url}
          photos={biz.photos}
          onCoverChange={url => setBiz(b => ({ ...b, cover_url: url }))}
          onPhotosChange={urls => setBiz(b => ({ ...b, photos: urls }))}
        />

        {/* Services */}
        <ServicesSection
          services={biz.services ?? []}
          onChange={items => setBiz(b => ({ ...b, services: items }))}
        />

        <Button type="submit" variant="primary" disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Salvar negocio'}
        </Button>
      </form>
    </main>
  )
}
