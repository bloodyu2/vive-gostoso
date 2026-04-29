import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { stripLocale, localeFromPath } from '@/hooks/useLocalePath'

const LANGUAGES = [
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
]

interface LanguageSelectorProps {
  /** 'dropdown' for desktop header, 'inline' for mobile drawer */
  variant?: 'dropdown' | 'inline'
}

export function LanguageSelector({ variant = 'dropdown' }: LanguageSelectorProps) {
  const { } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLocale = localeFromPath(pathname)
  const current = LANGUAGES.find(l => l.code === currentLocale) ?? LANGUAGES[0]

  function change(code: string) {
    localStorage.setItem('i18n-lang', code)
    // Strip current locale prefix to get the bare page path
    const pagePath = stripLocale(pathname)  // e.g. '/come' or '/'

    let newPath: string
    if (code === 'pt') {
      newPath = pagePath || '/'
    } else {
      // For home (/), avoid trailing slash: /en not /en/
      newPath = `/${code}${pagePath === '/' ? '' : pagePath}`
    }

    navigate(newPath)
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1.5 px-4 py-3">
        <Globe className="w-4 h-4 text-[#737373] flex-shrink-0" />
        <div className="flex gap-1">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-semibold transition-colors',
                current.code === l.code
                  ? 'bg-teal text-white'
                  : 'text-[#737373] dark:text-[#C0BCB8] hover:bg-areia dark:hover:bg-[#2D2D2D]',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors',
          open
            ? 'border-teal text-teal bg-teal/5 dark:bg-teal/10'
            : 'border-[#E8E4DF] dark:border-[#2D2D2D] text-[#3D3D3D] dark:text-[#C0BCB8] hover:border-teal/40 hover:text-teal',
        )}
        aria-label="Selecionar idioma"
      >
        <Globe className="w-3.5 h-3.5" />
        {current.label}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-36 bg-white dark:bg-[#222] rounded-xl border border-[#E8E4DF] dark:border-[#2D2D2D] shadow-lg overflow-hidden z-50">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-areia dark:hover:bg-[#2D2D2D]',
                current.code === l.code
                  ? 'text-teal font-semibold'
                  : 'text-[#3D3D3D] dark:text-[#C0BCB8] font-medium',
              )}
            >
              <span>{l.name}</span>
              <span className="text-xs font-bold opacity-50">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
