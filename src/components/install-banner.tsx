import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'vg-install-dismissed'

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem(DISMISS_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '0 0 env(safe-area-inset-bottom)',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: '#0D7C7C',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Icon */}
        <img
          src="/icon-192.png"
          alt="Vive Gostoso"
          width={44}
          height={44}
          style={{ borderRadius: '10px', flexShrink: 0 }}
        />

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontFamily: 'Fraunces, serif',
            fontWeight: 700,
            fontSize: '15px',
            lineHeight: 1.2,
            color: '#fff',
          }}>
            Instale o Vive Gostoso
          </p>
          <p style={{
            margin: '2px 0 0',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '12px',
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.3,
          }}>
            Acesse rapido no celular. Funciona offline.
          </p>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          style={{
            background: '#E05A3A',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Instalar
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Fechar"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          x
        </button>
      </div>
    </div>
  )
}
