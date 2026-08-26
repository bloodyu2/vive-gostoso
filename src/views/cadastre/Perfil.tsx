'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/hooks/useCategories'
import { useInvalidateMyBusinesses, useMyBusinesses } from '@/hooks/useMyBusinesses'
import type { Business } from '@/types/database'
import { ArrowLeft, Camera, ChevronDown, ExternalLink, Loader2 } from 'lucide-react'
import { validateImageFile, compressImage } from '@/lib/image-upload'
import { translateSupabaseError, assertSession } from '@/lib/supabase-errors'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import { showToast } from '@/components/ui/toast'

export default function Perfil() {
  return <AuthGuard><PerfilInner /></AuthGuard>
}

type ServiceItem = { name: string; description?: string; price?: string; photos?: string[] }

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

const DAYS: DayKey[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

const EMPTY_HOURS: OpeningHoursValue = Object.fromEntries(
  DAYS.map(d => [d, { open: '', close: '', closed: true }])
) as OpeningHoursValue

// ---------------------------------------------------------------------------
// Save result modal
// ---------------------------------------------------------------------------

function SaveResultModal({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error'
  message: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'success' ? 'bg-teal/10' : 'bg-red-50'}`}>
          {type === 'success' ? (
            <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          )}
        </div>
        <p className="text-center font-semibold text-[#1A1A1A] mb-2">
          {type === 'success' ? 'Negócio salvo!' : 'Não foi possível salvar'}
        </p>
        <p className="text-center text-sm text-[#737373] mb-5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${type === 'success' ? 'bg-teal text-white hover:bg-teal/90' : 'border border-[#E8E4DF] text-[#737373] hover:border-[#737373]'}`}
        >
          {type === 'success' ? 'Continuar editando' : 'Fechar'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Business switcher (Spec 3)
// ---------------------------------------------------------------------------

function BusinessSwitcher({ currentBizId, currentName }: { currentBizId: string | null; currentName: string | undefined }) {
  const { data: businesses = [] } = useMyBusinesses()
  const lp = useLocalePath()
  const [open, setOpen] = useState(false)

  if (businesses.length <= 1) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] hover:text-teal transition-colors max-w-[180px] truncate"
      >
        <span className="truncate">{currentName || 'Negócio atual'}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#E8E4DF] rounded-xl shadow-lg z-20 min-w-[200px] py-1 max-h-60 overflow-y-auto">
            {businesses.map(b => (
              <Link
                key={b.id}
                href={lp(`/cadastre/perfil?bizId=${b.id}`)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#F5F2EE] transition-colors ${b.id === currentBizId ? 'font-semibold text-teal' : 'text-[#1A1A1A]'}`}
              >
                {b.cover_url && (
                  <img src={b.cover_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                )}
                <span className="truncate">{b.name}</span>
              </Link>
            ))}
            <div className="border-t border-[#F0ECE8] mt-1 pt-1">
              <Link
                href={lp('/cadastre/perfil')}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-teal hover:bg-[#F5F2EE] font-semibold"
              >
                + Novo negócio
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

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
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!bizId) return
    setLoading(true)
    try { await assertSession(supabase) } catch { showToast('Sua sessão expirou. Faça login novamente.', 'error'); setLoading(false); return }
    const next = !isPublished
    await supabase
      .from('gostoso_businesses')
      .update({ is_published: next })
      .eq('id', bizId)
    onToggle(next)
    setLoading(false)
    showToast(
      next ? 'Negócio publicado! Já aparece nas buscas.' : 'Negócio despublicado.',
      next ? 'success' : undefined
    )
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
          {isPublished ? t('perfil:status_published') : t('perfil:status_draft')}
        </span>
        <span className="text-sm text-[#737373]">
          {isPublished
            ? t('perfil:status_published_desc')
            : t('perfil:status_draft_desc')}
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
          {loading ? '...' : isPublished ? t('perfil:status_unpublish') : t('perfil:status_publish')}
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
  const { t } = useTranslation()
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
      await assertSession(supabase)
      const path = `${bizId}/${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.jpg`
      const url = await uploadFile(file, path)
      const { error: updateError } = await supabase.from('gostoso_businesses').update({ cover_url: url }).eq('id', bizId)
      if (updateError) throw updateError
      onCoverChange(url)
      showToast('Foto de capa atualizada!', 'success')
    } catch (err) {
      setError(translateSupabaseError(err))
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
      setError(t('perfil:error_gallery_full'))
      return
    }
    const toUpload = files.slice(0, slots)

    setUploadingGallery(true)
    try {
      await assertSession(supabase)
      const urls = await Promise.all(
        toUpload.map(f => uploadFile(f, `${bizId}/${Date.now()}-${f.name.replace(/\.[^.]+$/, '')}.jpg`))
      )
      const next = [...currentPhotos, ...urls]
      const { error: updateError } = await supabase.from('gostoso_businesses').update({ photos: next }).eq('id', bizId)
      if (updateError) throw updateError
      onPhotosChange(next)
    } catch (err) {
      setError(translateSupabaseError(err))
    } finally {
      setUploadingGallery(false)
      if (galleryRef.current) galleryRef.current.value = ''
    }
  }

  async function removePhoto(url: string) {
    if (!bizId) return
    try { await assertSession(supabase) } catch { showToast('Sua sessão expirou. Faça login novamente.', 'error'); return }
    const next = currentPhotos.filter(p => p !== url)
    const { error: updateError } = await supabase.from('gostoso_businesses').update({ photos: next }).eq('id', bizId)
    if (updateError) {
      showToast(translateSupabaseError(updateError), 'error')
      return
    }
    onPhotosChange(next)
  }

  return (
    <section className={SECTION_CLS}>
      <h2 className="font-display text-lg font-semibold mb-4">{t('perfil:photos_title')}</h2>
      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      {/* Cover photo */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">{t('perfil:photos_cover_label')}</label>
        {coverUrl ? (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-2 border border-[#E8E4DF]">
            <img src={coverUrl} alt={t('perfil:photos_cover_label')} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        ) : (
          <div className="w-full h-40 rounded-2xl border-2 border-dashed border-[#E8E4DF] flex flex-col items-center justify-center gap-2 text-sm text-[#737373] mb-2 bg-[#FAFAF9]">
            <Camera className="w-7 h-7 text-[#C4BFBA]" />
            <span>{t('perfil:photos_no_cover')}</span>
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
          {uploadingCover ? t('perfil:photos_uploading') : coverUrl ? t('perfil:photos_change_cover') : t('perfil:photos_add_cover')}
        </button>
        {!bizId && (
          <p className="text-xs text-[#737373] mt-1">{t('perfil:photos_save_first')}</p>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('perfil:photos_gallery')}
          <span className="text-[#737373] font-normal ml-1">({currentPhotos.length}/10)</span>
        </label>
        {currentPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
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
                  title={t('perfil:photos_remove')}
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
              {uploadingGallery ? t('perfil:photos_uploading') : t('perfil:photos_add')}
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
  const { t } = useTranslation()
  const [hours, setHours] = useState<OpeningHoursValue>(() =>
    value ? (value as OpeningHoursValue) : { ...EMPTY_HOURS }
  )

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
      <h2 className="font-display text-lg font-semibold mb-1">{t('perfil:hours_title')}</h2>
      <p className="text-sm text-[#737373] mb-4">
        {t('perfil:hours_desc')}
      </p>
      <div className="space-y-2">
        {DAYS.map(key => {
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
              <span className="text-sm font-medium text-[#1A1A1A] w-28 flex-shrink-0">{t('perfil:day_' + key)}</span>

              {!day.closed ? (
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                  <input
                    type="time"
                    value={day.open}
                    onChange={e => update(key, 'open', e.target.value)}
                    className="border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-sm w-28 focus:border-teal focus:outline-none"
                  />
                  <span className="text-xs text-[#737373]">{t('perfil:hours_until')}</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={e => update(key, 'close', e.target.value)}
                    className="border border-[#E8E4DF] rounded-lg px-3 py-1.5 text-sm w-28 focus:border-teal focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-[#737373] flex-1">{t('perfil:hours_closed')}</span>
              )}

              <label className="flex items-center gap-1.5 cursor-pointer ml-auto flex-shrink-0">
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={e => update(key, 'closed', e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8E4DF] accent-teal"
                />
                <span className="text-xs text-[#737373]">{t('perfil:hours_closed')}</span>
              </label>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Service photo uploader (up to 3 photos per service)
// ---------------------------------------------------------------------------

function ServicePhotoUploader({
  bizId,
  serviceIndex,
  photos,
  onChange,
}: {
  bizId: string
  serviceIndex: number
  photos: string[]
  onChange: (urls: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function uploadFile(file: File): Promise<string> {
    const compressed = await compressImage(file)
    const safeName = `${Date.now()}.jpg`
    const path = `${bizId}/services/${serviceIndex}/${safeName}`
    const toUpload = new File([compressed], safeName, { type: 'image/jpeg' })
    const { error: upErr } = await supabase.storage
      .from('business-photos')
      .upload(path, toUpload, { upsert: true, contentType: 'image/jpeg' })
    if (upErr) throw upErr
    return supabase.storage.from('business-photos').getPublicUrl(path).data.publicUrl
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setError(null)

    const slots = 3 - photos.length
    if (slots <= 0) {
      setError('Limite de 3 fotos por serviço atingido.')
      return
    }

    for (const f of files) {
      const ve = validateImageFile(f)
      if (ve) { setError(ve); return }
    }

    setUploading(true)
    try {
      await assertSession(supabase)
      const toUpload = files.slice(0, slots)
      const urls = await Promise.all(toUpload.map(uploadFile))
      onChange([...photos, ...urls])
    } catch (err) {
      setError(translateSupabaseError(err))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove(url: string) {
    onChange(photos.filter(p => p !== url))
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-[#737373]">
        Fotos <span className="font-normal">({photos.length}/3)</span>
      </label>
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {photos.map(url => (
            <div key={url} className="relative w-16 h-16">
              <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      {photos.length < 3 && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E8E4DF] hover:border-teal transition-colors disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : '+ Adicionar foto'}
          </button>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Services section (inline services shown on business profile)
// ---------------------------------------------------------------------------

function ServicesSection({
  bizId,
  services,
  onChange,
}: {
  bizId: string | undefined
  services: ServiceItem[]
  onChange: (items: ServiceItem[]) => void
}) {
  const { t } = useTranslation()
  const lp = useLocalePath()

  function addService() {
    if (services.length >= 10) return
    onChange([...services, { name: '', description: '', price: '', photos: [] }])
  }

  function removeService(i: number) {
    onChange(services.filter((_, idx) => idx !== i))
  }

  function updateService(i: number, field: keyof ServiceItem, value: string | string[]) {
    onChange(services.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  return (
    <section className={SECTION_CLS}>
      <div className="flex items-start justify-between mb-1 gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{t('perfil:services_title')}</h2>
          <p className="text-sm text-[#737373] mt-0.5">
            {t('perfil:services_desc')}{' '}
            <Link
              href={lp('/contrate')}
              target="_blank"
              className="inline-flex items-center gap-1 text-teal hover:underline"
            >
              {t('perfil:services_contrate_link')}
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
            {t('perfil:services_add')}
          </button>
        )}
      </div>

      {services.length === 0 && (
        <p className="text-sm text-[#737373] mt-3">
          {t('perfil:services_empty')}
        </p>
      )}

      <div className="space-y-4 mt-4">
        {services.map((svc, i) => (
          <div key={i} className="rounded-2xl border border-[#E8E4DF] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1 text-[#737373]">{t('perfil:services_name_label')}</label>
                <input
                  type="text"
                  required
                  value={svc.name}
                  onChange={e => updateService(i, 'name', e.target.value)}
                  placeholder={t('perfil:services_name_placeholder')}
                  className={INPUT_CLS}
                />
              </div>
              <button
                type="button"
                onClick={() => removeService(i)}
                className="mt-5 text-sm text-[#737373] hover:text-red-500 transition-colors shrink-0"
                title={t('perfil:services_remove')}
              >
                {t('perfil:services_remove')}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#737373]">
                {t('perfil:services_desc_label')} <span className="font-normal">{t('perfil:services_desc_optional')}</span>
              </label>
              <input
                type="text"
                value={svc.description ?? ''}
                onChange={e => updateService(i, 'description', e.target.value)}
                placeholder={t('perfil:services_desc_label')}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#737373]">
                {t('perfil:services_price_label')} <span className="font-normal">{t('perfil:services_price_optional')}</span>
              </label>
              <input
                type="text"
                value={svc.price ?? ''}
                onChange={e => updateService(i, 'price', e.target.value)}
                placeholder={t('perfil:services_price_placeholder')}
                className={INPUT_CLS}
              />
            </div>
            {/* Fotos do serviço (Spec 1.4) */}
            {bizId && (
              <ServicePhotoUploader
                bizId={bizId}
                serviceIndex={i}
                photos={svc.photos ?? []}
                onChange={urls => updateService(i, 'photos', urls)}
              />
            )}
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
  const { t } = useTranslation()
  const lp = useLocalePath()
  const bizId = searchParams?.get('bizId') ?? null
  const invalidateMyBusinesses = useInvalidateMyBusinesses()

  const [biz, setBiz] = useState<PartialBusiness>({})
  const [saving, setSaving] = useState(false)
  const [saveModal, setSaveModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [notOwner, setNotOwner] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [dupMatches, setDupMatches] = useState<{ id: string; name: string; slug: string; profile_id: string | null }[]>([])

  // Duplicate detection — only active in "new business" mode (no bizId)
  useEffect(() => {
    if (bizId) return
    const name = biz.name?.trim() ?? ''
    if (name.length < 3) { setDupMatches([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, profile_id')
        .eq('active', true)
        .ilike('name', `%${name}%`)
        .limit(3)
      setDupMatches((data ?? []) as typeof dupMatches)
    }, 500)
    return () => clearTimeout(timer)
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
        setSaveModal({ type: 'error', message: t('perfil:error_init_profile') })
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
        'price_range, menu_url, amenities, is_published, services, cover_url, photos, opening_hours, profile_id'
      )
      .eq('id', bizId)
      .maybeSingle()
      .then(({ data: b }) => {
        if (!b) return
        // Spec 1.1: ownership guard — only allow editing if this profile owns the business
        const bizProfileId = (b as unknown as { profile_id: string | null }).profile_id
        if (profileId && bizProfileId !== profileId) {
          setNotOwner(true)
          return
        }
        if (!profileId && bizProfileId !== null) {
          // profileId not loaded yet — we'll re-check after profileId is set
        }
        setBiz(b as PartialBusiness)
      })
  }, [bizId, profileId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!profileId) {
      setSaveModal({ type: 'error', message: t('perfil:error_profile') })
      return
    }

    setSaving(true)

    try {
      await assertSession(supabase)
      const baseSlug = makeSlug(biz.name ?? '')
      const services = (biz.services ?? []).filter(s => s.name.trim())

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
        invalidateMyBusinesses()
        setSaveModal({ type: 'success', message: 'As informações do negócio foram atualizadas.' })
      } else {
        // INSERT
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
        invalidateMyBusinesses()
        setSaveModal({ type: 'success', message: 'Negócio criado! Adicione fotos e publique quando estiver pronto.' })
      }
    } catch (err: unknown) {
      setSaveModal({ type: 'error', message: translateSupabaseError(err) })
    } finally {
      setSaving(false)
    }
  }

  const textFields = [
    { key: 'name' as const, required: true },
    { key: 'address' as const },
    { key: 'whatsapp' as const },
    { key: 'instagram' as const },
    { key: 'website' as const },
  ]

  // Spec 1.1 — show "not owner" screen instead of broken form
  if (notOwner) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8E4DF]">
          <div className="max-w-2xl mx-auto px-5 md:px-8 h-14 flex items-center gap-3">
            <Link
              href={lp('/cadastre/negocios')}
              className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('perfil:my_businesses')}
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-ocre/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-ocre" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-10v4m9 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-[#1A1A1A] mb-2">
              Negócio ainda não vinculado
            </h2>
            <p className="text-sm text-[#737373] mb-6">
              Você ainda não é o dono confirmado deste negócio. Reivindique-o para poder editar as informações.
            </p>
            <Link
              href={lp('/cadastre/claim')}
              className="inline-flex items-center gap-2 bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal/90 transition-colors"
            >
              Reivindicar negócio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      {/* Save result modal */}
      {saveModal && (
        <SaveResultModal
          type={saveModal.type}
          message={saveModal.message}
          onClose={() => setSaveModal(null)}
        />
      )}

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 h-14 flex items-center gap-3">
          <Link
            href={lp('/cadastre/negocios')}
            className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('perfil:my_businesses')}
          </Link>
          <span className="text-[#E8E4DF]">/</span>
          {/* Business switcher (Spec 3) */}
          {bizId
            ? <BusinessSwitcher currentBizId={bizId} currentName={biz.name} />
            : <span className="text-sm font-medium text-[#1A1A1A] truncate">{t('perfil:new_business')}</span>
          }
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 md:px-8 py-8">
        <div className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">
            {bizId ? t('perfil:edit_business') : t('perfil:new_business')}
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            {bizId
              ? t('perfil:edit_desc')
              : t('perfil:new_desc')}
          </p>
        </div>

      {/* Duplicate detection banner — only in new-business mode */}
      {!bizId && dupMatches.length > 0 && (
        <div className="mb-8 rounded-2xl border border-ocre/40 bg-ocre/5 px-5 py-4">
          <p className="text-sm font-semibold text-ocre mb-2">
            {t('perfil:dup_title')}
          </p>
          <p className="text-xs text-[#737373] mb-3">
            {t('perfil:dup_desc')}
          </p>
          <div className="space-y-2">
            {dupMatches.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-[#E8E4DF] px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-xs text-[#737373]">
                    {m.profile_id ? t('perfil:dup_has_owner') : t('perfil:dup_no_owner')}
                  </p>
                </div>
                <a
                  href={lp(`/cadastre/claim/${m.slug}`)}
                  className="flex-shrink-0 text-xs font-semibold text-teal border border-teal/30 px-3 py-1.5 rounded-xl hover:bg-teal/5 transition-colors"
                >
                  {m.profile_id ? t('perfil:dup_contest') : t('perfil:dup_claim')}
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
          <h2 className="font-display text-lg font-semibold mb-1">{t('perfil:basic_title')}</h2>
          <p className="text-sm text-[#737373] mb-4">{t('perfil:basic_desc')}</p>
          <div className="space-y-4">
            {textFields.map(({ key, required }) => {
              const helpers: Record<string, string> = {
                whatsapp: t('perfil:helper_whatsapp'),
                instagram: t('perfil:helper_instagram'),
                website: t('perfil:helper_website'),
                address: t('perfil:helper_address'),
              }
              return (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">
                    {t('perfil:field_' + key)}
                    {required && <span className="text-coral ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    required={required}
                    value={(biz[key] as string | null | undefined) ?? ''}
                    onChange={e => setBiz(b => ({ ...b, [key]: e.target.value }))}
                    className={INPUT_CLS}
                  />
                  {helpers[key] && (
                    <p className="text-xs text-[#737373] mt-1">{helpers[key]}</p>
                  )}
                </div>
              )
            })}
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('perfil:field_desc')}</label>
              <textarea
                rows={4}
                value={biz.description ?? ''}
                onChange={e => setBiz(b => ({ ...b, description: e.target.value }))}
                placeholder={t('perfil:field_desc_placeholder')}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('perfil:field_category')}</label>
              <select
                value={biz.category_id ?? ''}
                onChange={e => setBiz(b => ({ ...b, category_id: e.target.value }))}
                className={`${INPUT_CLS} bg-white`}
              >
                <option value="">{t('perfil:field_category_placeholder')}</option>
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
          <h2 className="font-display text-lg font-semibold mb-4">{t('perfil:details_title')}</h2>
          <div className="space-y-4">
            {/* Faixa de preco */}
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('perfil:price_label')}</label>
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
                    {v || t('perfil:price_none')}
                  </button>
                ))}
              </div>
            </div>

            {/* Link do cardapio */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t('perfil:menu_label')}{' '}
                <span className="text-[#737373] font-normal">{t('perfil:menu_optional')}</span>
              </label>
              <input
                type="url"
                value={biz.menu_url ?? ''}
                onChange={e => setBiz(b => ({ ...b, menu_url: e.target.value || null }))}
                placeholder={t('perfil:menu_placeholder')}
                className={INPUT_CLS}
              />
            </div>

            {/* Comodidades */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('perfil:amenities_label')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  { key: 'wifi' as const,         label: t('perfil:amenity_wifi') },
                  { key: 'parking' as const,      label: t('perfil:amenity_parking') },
                  { key: 'accessible' as const,   label: t('perfil:amenity_accessible') },
                  { key: 'reservations' as const, label: t('perfil:amenity_reservations') },
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
          bizId={biz.id}
          services={biz.services ?? []}
          onChange={items => setBiz(b => ({ ...b, services: items }))}
        />

      </form>
      </main>

      {/* ── Sticky save footer ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E8E4DF] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href={lp('/cadastre/negocios')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-[#E8E4DF] text-sm font-medium text-[#737373] hover:border-[#737373] transition-colors"
          >
            {t('perfil:cancel')}
          </Link>
          <Button
            type="button"
            variant="primary"
            disabled={saving || profileLoading}
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => formRef.current?.requestSubmit()}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t('perfil:saving')}</>
              : profileLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t('perfil:profile_loading')}</>
              : t('perfil:save_business')}
          </Button>
        </div>
      </div>
    </div>
  )
}
