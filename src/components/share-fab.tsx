import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

export function ShareFab() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const data = {
      title: 'Vive Gostoso',
      text: 'Descubra São Miguel do Gostoso — restaurantes, pousadas, passeios e muito mais.',
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(data)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // user cancelled or browser not supported
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Compartilhar esta página"
      className="fixed bottom-20 right-4 z-30 w-11 h-11 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#E8E4DF] dark:border-[#2D2D2D] shadow-md flex items-center justify-center text-[#737373] hover:text-teal hover:border-teal dark:hover:text-teal transition-colors md:hidden"
    >
      {copied
        ? <Check className="w-4 h-4 text-teal" />
        : <Share2 className="w-4 h-4" />
      }
    </button>
  )
}
