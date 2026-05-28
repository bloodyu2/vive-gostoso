'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/hooks/useCategories'
import { useInvalidateMyBusinesses } from '@/hooks/useMyBusinesses'
import type { Business } from '@/types/database'
import { ArrowLeft, Camera, ExternalLink, Loader2 } from 'lucide-react'
import { validateImageFile, compressImage } from '@/lib/image-upload'

export default function Perfil() {
  return <AuthGuard><PerfilInner /></AuthGuard>
}

type ServiceItem = { name: string; description?: string; price?: string }

type DayKey = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab'
type DayHours = { open: string; close: string; closed: boolean }
type OpeningHoursValue = Record<DayKey, DayHours>

type PartialBusiness = Partial<Pick<Business,
  | 'id' | 'name' | 'description' | 'address' | 'whatsapp' | 'instagram' | 'website'
  | 'category_id' | 'price_range' | 'menu_url' | 'amenities'
  | 'is_published' | 'services' | 'cover_url' | 'photos' | 'opening_hours'
>>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+$/g, '')
    .replace(/^-+/g, '')
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let suffix = 2
  for (;;) {
    let q = supabase
      .from('gostoso_businesses')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
    if (excludeId) q = q.neq('id', excludeId)
    const { count } = await q
    if (!count) break
    slug = `${baseSlug}-${suffix}`
    suffix++
  }
  return slug
}

const INPUT_CLS =
  'w-full rounded-xl border border-[#E8E4DF] px-4 py-3 text-sm focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none'

const SECTION_CLS = 'mb-8 pb-8 border-b border-[#F0ECE8]'

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'dom', label: 'Domingo' },
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
  { key: 'sab', label: 'Sábado' },
]

const EMPTY_HOURS: OpeningHoursValue = Object.fromEntries(
  DAYS.map(d => [d.key, { open: '', close: '', closed: true }])
) as OpeningHoursValue

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
    const compressed = await compressImage(file)
    const safeName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    const toUpload = new File([compressed], safeName, { type: 'image/jpeg' })
    const { error: upErr } = await supabase.storage
      .from('business-photos')
      .upload(path, toUpload, { upsert: true, contentType: 'image/jpeg' })
    if (upErr) throw upErr
    return supabase.storage.from('business-photos').getPublicUrl(path).data.publicUrl
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !bizId) return
    setError(null)
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      if (coverRef.current) coverRef.current.value = ''
      return
    }
    setUploadingCover(true)
    try {
      const path = `${bizId}/${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.jpg`
      const url = await uploadFile(file, path)
      await supabase.from('gostoso_businesses').update({ cover_url: url }).eq('id', bizId)
      onCoverChange(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'erro inesperado'
      setError(`Erro ao enviar foto de capa: ${msg}`)
    } finally {
      setUploadingCover(false)
      if (coverRef.current) coverRef.current.value = ''
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !bizId) return
    setError(null)

    for (const f of files) {
      const validationError = validateImageFile(f)
      if (validationError) {
        setError(`${f.name}: ${validationError}`)
        if (galleryRef.current) galleryRef.current.value = ''
        return
      }
    }

    const slots = 10 - currentPhotos.length
    if (slots <= 0) {
      setError('Galeria cheia (máximo 10 fotos).')
      return
    }
    const toUpload = files.slice(0, slots)

    setUploadingGallery(true)
    try {
      const urls = await Promise.all(
        toUpload.map(f => uploadFile(f, `${bizId}/${Date.now()}-${f.name.replace(/\.[^.]+$/, '')}.jpg`))
      )
      const next = [...currentPhotos, ...urls]
      await supabase.from('gostoso_businesses').update({ photos: next }).eq('id', bizId)
      onPhotosChange(next)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'erro inesperado'
      setError(`Erro ao enviar fotos: ${msg}`)
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
            <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        ) : (
          <div className="w-full h-40 rounded-2xl border-2 border-dashed border-[#E8E4DF] flex flex-col items-center justify-center gap-2 text-sm text-[#A0A0A0] mb-2 bg-[#FAFAF9]">
            <Camera className="w-7 h-7 text-[#C4BFBA]" />
            <span>Sem foto de capa</span>
          </div>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
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
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
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
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
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

// ---------------------------------------------------------------------------
// Opening hours editor
// ---------------------------------------------------------------------------

function OpeningHoursSection({
  value,
  onChange,
}: {
  value: OpeningHoursValue | null
  onChange: (v: OpeningHoursValue) => void
}) {
  // If no saved value yet, start empty (all closed, no times)
  const [hours, setHours] = useState<OpeningHoursValue>(() =>
    value ? (value as OpeningHoursValue) : { ...EMPTY_HOURS }
  )

  // Sync if parent loads data after mount
  useEffect(() => {
    if (value) setHours(value as OpeningHoursValue)
  }, [value])

  function update(day: DayKey, field: keyof DayHours, val: string | boolean) {
    const next: OpeningHoursValue = { ...hours, [day]: { ...hours[day], [field]: val } }
    setHours(next)
    onChange(next)
  }

  return (
    <section className={SECTION_CLS}>
      <h2 className="font-display text-lg font-semibold mb-1">Horários de funcionamento</h2>
      <p className="text-sm text-[#737373] mb-4">
        Marque "Fechado" nos dias em que não atende. Deixe os campos em branco se o horário não se aplica.
      </p>
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const day = hours[key] ?? { open: '', close: '', closed: true }
          return (
            <div
              key={key}
              className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                day.closed
                  ? 'border-[#E8E4DF] bg-[#F9F7F5] opacity-60'
                  : 'border-[#E8E4DF] bg-white'
              }`}
            >
              {/* Day label */}
              <span className="text-sm font-medium text-[#1A1A1A] w-28 flex-shrink-0">{label}</span>

              {/* Time inputs or "Fechado" text */}
              {!day.closed ? (
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                  <input
                    type="time"
                    value={day.open}
                    onChange={e => update(key, 'open', e.target.value)}
                    className="border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-sm w-28 focus:border-teal focus:outline-none"
                  />
                  <span className="text-xs text-[#737373]">até</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={e => update(key, 'close', e.target.value)}
                    className="border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-sm w-28 focus:border-teal focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-[#A0A0A0] flex-1">Fechado</span>
              )}

              {/* Closed toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer ml-auto flex-shrink-0">
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={e => update(key, 'closed', e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8E4DF] accent-teal"
                />
                <span className="text-xs text-[#737373]">Fechado</span>
              </label>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Services section (inline services shown on business profile)
// ---------------------------------------------------------------------------

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
      <div className="flex items-start justify-between mb-1 gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Serviços do negócio</h2>
          <p className="text-sm text-[#737373] mt-0.5">
            Aparecem no perfil do negócio.{' '}
            <Link
              href="/contrate"
              target="_blank"
              className="inline-flex items-center gap-1 text-teal hover:underline"
            >
              Para listar no diretório CONTRATE clique aqui
              <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
        {services.length < 10 && (
          <button
            type="button"
            onClick={addService}
            className="flex-shrink-0 text-sm font-semibold text-teal hover:text-teal/80 transition-colors"
          >
            + Adicionar
          </button>
        )}
      </div>

      {services.length === 0 && (
        <p className="text-sm text-[#737373] mt-3">
          Nenhum serviço cadastrado ainda. Clique em "+ Adicionar" para começar.
        </p>
      )}

      <div className="space-y-4 mt-4">
        {services.map((svc, i) => (
          <div key={i} className="rounded-2xl border border-[#E8E4DF] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1 text-[#737373]">Nome do serviço *</label>
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
                Descrição <span className="font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={svc.description ?? ''}
                onChange={e => updateService(i, 'description', e.target.value)}
                placeholder="Breve descrição do serviço"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#737373]">
                Preço <span className="font-normal">(opcional)</span>
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const bizId = searchParams?.get('bizId') ?? null
  const invalidateMyBusinesses = useInvalidateMyBusinesses()

  const [biz, setBiz] = useState<PartialBusiness>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [dupMatches, setDupMatches] = useState<{ id: string; name: string; slug: string; profile_id: string | null }[]>([])

  // Duplicate detection — only active in "new business" mode (no bizId)
  useEffect(() => {
    if (bizId) return
    const name = biz.name?.trim() ?? ''
    if (name.length < 3) { setDupMatches([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, profile_id')
        .eq('active', true)
        .ilike('name', `%${name}%`)
        .limit(3)
      setDupMatches((data ?? []) as typeof dupMatches)
    }, 500)
    return () => clearTimeout(t)
  }, [biz.name, bizId])

  useEffect(() => {
    if (!user) return

    // Ensure profile exists and get its ID
    ;(async () => {
      setProfileLoading(true)
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (profile) {
        setProfileId((profile as { id: string }).id)
        setProfileLoading(false)
        return
      }

      // Profile doesn't exist yet — create it
      const { data: newProfile, error: insertErr } = await supabase
        .from('gostoso_profiles')
        .insert([{ auth_user_id: user.id, email: user.email ?? '' }])
        .select('id')
        .single()

      if (insertErr || !newProfile) {
        setSaveError('Erro ao inicializar seu perfil. Tente recarregar a página.')
      } else {
        setProfileId((newProfile as { id: string }).id)
      }
      setProfileLoading(false)
    })()
  }, [user])

  useEffect(() => {
    // Load existing business when bizId is present
    if (!bizId) return
    supabase
      .from('gostoso_businesses')
      .select(
        'id, name, description, address, whatsapp, instagram, website, category_id, ' +
        'price_range, menu_url, amenities, is_published, services, cover_url, photos, opening_hours'
      )
      .eq('id', bizId)
      .maybeSingle()
      .then(({ data: b }) => {
        if (b) setBiz(b as PartialBusiness)
      })
  }, [bizId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)

    if (!profileId) {
      setSaveError('Perfil ainda não carregado. Aguarde um momento e tente novamente.')
      return
    }

    setSaving(true)

    try {
      const baseSlug = makeSlug(biz.name ?? '')
      const services = (biz.services ?? []).filter(s => s.name.trim())
      let isNew = false

      if (biz.id) {
        // UPDATE
        const slug = await ensureUniqueSlug(baseSlug, biz.id)
        const { error } = await supabase
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
            opening_hours: biz.opening_hours ?? null,
          })
          .eq('id', biz.id)
        if (error) throw error
      } else {
        // INSERT
        isNew = true
        const slug = await ensureUniqueSlug(baseSlug)
        const { data: newBiz, error: insertErr } = await supabase
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
            opening_hours: biz.opening_hours ?? null,
          }])
          .select('id')
          .single()

        if (insertErr) throw insertErr

        if (newBiz) {
          const nb = newBiz as { id: string }
          setBiz(b => ({ ...b, id: nb.id }))
          await supabase
            .from('gostoso_profiles')
            .update({ business_id: nb.id })
            .eq('id', profileId)
        }
      }

      invalidateMyBusinesses()
      router.push(isNew ? '/cadastre/negocios?new=1' : '/cadastre/negocios')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError(`Erro ao salvar: ${msg}. Tente novamente ou entre em contato pelo WhatsApp.`)
      setSaving(false)
    }
  }

  const textFields = [
    { label: 'Nome do negócio', key: 'name' as const, required: true },
    { label: 'Endereço',        key: 'address' as const },
    { label: 'WhatsApp',        key: 'whatsapp' as const },
    { label: 'Instagram (sem @)', key: 'instagram' as const },
    { label: 'Website',         key: 'website' as const },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 h-14 flex items-center gap-3">
          <Link
            href="/cadastre/negocios"
            className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Meus negócios
          </Link>
          <span className="text-[#E8E4DF]">/</span>
          <span className="text-sm font-medium text-[#1A1A1A] truncate">
            {bizId ? (biz.name || 'Editar negócio') : 'Novo negócio'}
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 md:px-8 py-8">
        <div className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">
            {bizId ? 'Editar negócio' : 'Novo negócio'}
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            {bizId
              ? 'Atualize as informações que aparecem no diretório.'
              : 'Preencha os dados básicos e publique quando estiver pronto.'}
          </p>
        </div>

      {/* Duplicate detection banner — only in new-business mode */}
      {!bizId && dupMatches.length > 0 && (
        <div className="mb-8 rounded-2xl border border-ocre/40 bg-ocre/5 px-5 py-4">
          <p className="text-sm font-semibold text-ocre mb-2">
            Negócio similar já existe na plataforma
          </p>
          <p className="text-xs text-[#737373] mb-3">
            Antes de criar um novo, verifique se o seu já está cadastrado. Se for seu, você pode reivindicá-lo e assumir o controle.
          </p>
          <div className="space-y-2">
            {dupMatches.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-[#E8E4DF] px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-xs text-[#737373]">
                    {m.profile_id ? 'Já tem proprietário' : 'Sem proprietário, pode ser seu'}
                  </p>
                </div>
                <a
                  href={`/cadastre/claim/${m.slug}`}
                  className="flex-shrink-0 text-xs font-semibold text-teal border border-teal/30 px-3 py-1.5 rounded-xl hover:bg-teal/5 transition-colors"
                >
                  {m.profile_id ? 'Contestar' : 'Reivindicar'}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status banner - only shown when business already exists */}
      {biz.id && (
        <StatusBanner
          isPublished={biz.is_published ?? false}
          bizId={biz.id}
          onToggle={next => setBiz(b => ({ ...b, is_published: next }))}
        />
      )}

      <form ref={formRef} onSubmit={handleSave}>
        {/* Basic info */}
        <section className={SECTION_CLS}>
          <h2 className="font-display text-lg font-semibold mb-1">Informações básicas</h2>
          <p className="text-sm text-[#737373] mb-4">Nome, endereço, contato e como os turistas vão encontrar você.</p>
          <div className="space-y-4">
            {textFields.map(({ label, key, required }) => {
              const helperText: Partial<Record<typeof key, string>> = {
                whatsapp: 'Somente números com DDD, ex: 84999990000',
                instagram: 'Sem @, ex: vivegostoso',
                website: 'URL completa com https://',
                address: 'Rua, número ou referência de localização',
              }
              return (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">
                    {label}
                    {required && <span className="text-coral ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    required={required}
                    value={(biz[key] as string | null | undefined) ?? ''}
                    onChange={e => setBiz(b => ({ ...b, [key]: e.target.value }))}
                    className={INPUT_CLS}
                  />
                  {helperText[key] && (
                    <p className="text-xs text-[#A0A0A0] mt-1">{helperText[key]}</p>
                  )}
                </div>
              )
            })}
            <div>
              <label className="block text-sm font-medium mb-1.5">Descrição</label>
              <textarea
                rows={4}
                value={biz.description ?? ''}
                onChange={e => setBiz(b => ({ ...b, description: e.target.value }))}
                placeholder="Descreva seu negócio em poucas frases: o que oferece, o que torna especial..."
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

        {/* Opening hours */}
        <OpeningHoursSection
          value={biz.opening_hours as OpeningHoursValue | null}
          onChange={hours => setBiz(b => ({ ...b, opening_hours: hours }))}
        />

        {/* Details */}
        <section className={SECTION_CLS}>
          <h2 className="font-display text-lg font-semibold mb-4">Detalhes</h2>
          <div className="space-y-4">
            {/* Faixa de preco */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Faixa de preço</label>
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
                    {v || 'Não informar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Link do cardapio */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Link do cardápio{' '}
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
                  { key: 'wifi' as const,         label: 'WiFi grátis' },
                  { key: 'parking' as const,      label: 'Estacionamento' },
                  { key: 'accessible' as const,   label: 'Acessível' },
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

      </form>
      </main>

      {/* ── Sticky save footer ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E8E4DF] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        {saveError && (
          <div className="bg-red-50 border-b border-red-100 px-5 py-2">
            <p className="text-xs text-red-600 text-center max-w-2xl mx-auto">{saveError}</p>
          </div>
        )}
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/cadastre/negocios"
            className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-[#E8E4DF] text-sm font-medium text-[#737373] hover:border-[#737373] transition-colors"
          >
            Cancelar
          </Link>
          <Button
            type="button"
            variant="primary"
            disabled={saving || profileLoading}
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => formRef.current?.requestSubmit()}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
              : profileLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Carregando...</>
              : 'Salvar negócio'}
          </Button>
        </div>
      </div>
    </div>
  )
}
