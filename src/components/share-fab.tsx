import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'

const SITE_URL = 'https://vivegostoso.com.br'
const SHARE_TEXT = 'Encontrei o Vive Gostoso 🌊 A plataforma digital de São Miguel do Gostoso — onde comer, ficar e curtir na cidade.'

const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + '\n' + SITE_URL)}`

export function ShareFab() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function handleNativeShare() {
    try {
      await navigator.share({ title: 'Vive Gostoso', text: SHARE_TEXT, url: SITE_URL })
    } catch { /* cancelled */ }
    setOpen(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(SITE_URL)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-5 md:right-8 z-50 flex flex-col items-end gap-3">
      {/* Popover */}
      {open && (
        <div className="bg-white dark:bg-[#1C1C1C] border border-[#E8E4DF] dark:border-[#2D2D2D] rounded-2xl shadow-xl overflow-hidden w-56 animate-in slide-in-from-bottom-2">
          <div className="px-4 py-3 border-b border-[#F5F2EE] dark:border-[#2D2D2D] flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-[#737373]">Compartilhar</span>
            <button onClick={() => setOpen(false)} className="text-[#737373] hover:text-[#1A1A1A] dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-areia dark:hover:bg-[#2D2D2D] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.1 1.522 5.824L0 24l6.335-1.502A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.812 9.812 0 01-5.001-1.367l-.36-.214-3.732.885.916-3.62-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-[#1A1A1A] dark:text-white">WhatsApp</span>
          </a>

          {/* Native share — só aparece se disponível */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-areia dark:hover:bg-[#2D2D2D] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
                <Share2 className="w-4 h-4 text-teal" />
              </div>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white">Compartilhar via...</span>
            </button>
          )}

          {/* Copiar link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-areia dark:hover:bg-[#2D2D2D] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8E4DF] dark:bg-[#2D2D2D] flex items-center justify-center flex-shrink-0">
              {copied ? <Check className="w-4 h-4 text-teal" /> : <Copy className="w-4 h-4 text-[#737373]" />}
            </div>
            <span className="text-sm font-medium text-[#1A1A1A] dark:text-white">
              {copied ? 'Link copiado!' : 'Copiar link'}
            </span>
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Compartilhar Vive Gostoso"
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rotate-12'
            : 'bg-teal text-white hover:bg-teal-dark hover:scale-105'
        }`}
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  )
}
