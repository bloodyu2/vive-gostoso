'use client'

import { useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { compressImage, validateImageFile } from '@/lib/image-upload'
import { assertSession } from '@/lib/supabase-errors'

interface Props {
  /** URLs ja enviadas, na ordem em que aparecem. */
  value: string[]
  onChange: (urls: string[]) => void
  /** Maximo de fotos. 1 troca a foto ao enviar outra. */
  max?: number
  label?: string
  /** Aparece no lugar do botao quando a pessoa nao esta logada. */
  loginHint?: string
}

/**
 * Envio de fotos para o bucket `business-photos`, na pasta da propria pessoa
 * (`u/<auth.uid()>/`). Serve a todo cadastro que nao tem pasta de negocio:
 * profissional, servico, transfer, evento. O envio fica desligado ate a pessoa
 * declarar que tem direito sobre a imagem, mesma regra do painel do negocio.
 */
export function PhotoUploader({ value, onChange, max = 3, label, loginHint }: Props) {
  const { t } = useTranslation()
  const { user, supabase, loading } = useAuth()
  const [aceite, setAceite] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length || !user || !aceite) return
    setError(null)
    const room = max === 1 ? 1 : Math.max(0, max - value.length)
    const toSend = files.slice(0, room)
    if (!toSend.length) { setError(t('photo_uploader.limit', { max })); return }
    for (const f of toSend) {
      const invalid = validateImageFile(f)
      if (invalid) { setError(invalid); return }
    }
    setUploading(true)
    try {
      const urls: string[] = []
      for (const [i, file] of toSend.entries()) {
        const compressed = await compressImage(file)
        const body = new File([compressed], 'foto.jpg', { type: 'image/jpeg' })
        await assertSession(supabase)
        const path = `u/${user.id}/${Date.now()}-${i}.jpg`
        const { error: upErr } = await supabase.storage
          .from('business-photos')
          .upload(path, body, { contentType: 'image/jpeg' })
        if (upErr) throw upErr
        urls.push(supabase.storage.from('business-photos').getPublicUrl(path).data.publicUrl)
      }
      onChange(max === 1 ? urls.slice(0, 1) : [...value, ...urls])
    } catch {
      setError(t('photo_uploader.upload_failed'))
    } finally {
      setUploading(false)
    }
  }

  const full = max > 1 && value.length >= max

  return (
    <div>
      <p className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
        {label ?? t('photo_uploader.default_label')} <span className="text-xs font-normal text-fg-3-texto">{t('photo_uploader.max', { max })}</span>
      </p>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-3">
          {value.map(url => (
            <li key={url} className="relative w-20 h-20">
              <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover border border-[#E8E4DF]" />
              <button
                type="button"
                onClick={() => onChange(value.filter(u => u !== url))}
                aria-label={t('photo_uploader.remove')}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-[#E8E4DF] shadow flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && !user ? (
        <p className="text-xs text-fg-3-texto leading-relaxed">
          {loginHint ?? t('photo_uploader.login_hint')}
        </p>
      ) : (
        <>
          <label className="flex items-start gap-2 text-xs text-fg-3-texto mb-2 leading-relaxed">
            <input
              type="checkbox"
              checked={aceite}
              onChange={e => setAceite(e.target.checked)}
              className="mt-0.5"
            />
            <span>{t('photo_uploader.consent')}</span>
          </label>
          <label
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              aceite && !uploading && !full
                ? 'border-teal text-teal cursor-pointer hover:bg-teal/5'
                : 'border-[#E8E4DF] text-[#aaa] cursor-not-allowed'
            }`}
          >
            <ImagePlus className="w-4 h-4" aria-hidden="true" />
            {uploading ? t('photo_uploader.uploading') : max === 1 && value.length ? t('photo_uploader.replace') : t('photo_uploader.add')}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple={max > 1}
              disabled={!aceite || uploading || full}
              onChange={handleFiles}
              className="sr-only"
            />
          </label>
        </>
      )}

      {error && <p role="alert" className="text-xs text-coral mt-2">{error}</p>}
    </div>
  )
}
