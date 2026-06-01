import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

declare function gtag(...args: unknown[]): void

interface CookieBannerProps {
  forceOpen?: boolean
}

export function CookieBanner({ forceOpen }: CookieBannerProps = {}) {
  const { t } = useTranslation('cookie')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (forceOpen) {
      setVisible(true)
      return
    }
    const stored = localStorage.getItem('vg_cookie_consent')
    if (!stored) setVisible(true)
  }, [forceOpen])

  function accept() {
    localStorage.setItem('vg_cookie_consent', 'accepted')
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
    }
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('vg_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-[#1A1A1A] text-white rounded-2xl p-5 shadow-2xl pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">{t('text')}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2"
          >
            {t('decline')}
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold bg-teal text-white px-5 py-2 rounded-xl hover:bg-teal-dark transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
