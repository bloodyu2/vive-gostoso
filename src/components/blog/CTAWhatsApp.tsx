import { MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/whatsapp'

interface CTAWhatsAppProps {
  /** WhatsApp number (DDD + número, com ou sem 55). Default: número padrão Vive Gostoso. */
  phone?: string
  /** Texto do botão. Default: 'Falar no WhatsApp' */
  label?: string
  /** Mensagem pré-preenchida no WhatsApp */
  message?: string
  /** Texto secundário pequeno acima do botão */
  helper?: string
}

/**
 * CTA principal de conversão dentro de posts. Botão verde grande,
 * mobile-first, com mensagem pré-preenchida.
 */
export function CTAWhatsApp({
  phone = '5584999999999',
  label = 'Falar no WhatsApp',
  message,
  helper,
}: CTAWhatsAppProps) {
  const href = buildWhatsAppLink(phone, message)
  return (
    <div className="not-prose my-8 rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] bg-[#F5F2EE] dark:bg-[#222] p-6 text-center">
      {helper && (
        <p className="text-sm text-[#3D3D3D] dark:text-[#C0BCB8] mb-4 leading-relaxed">
          {helper}
        </p>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold text-base transition-colors shadow-sm"
      >
        <MessageCircle className="w-5 h-5" />
        {label}
      </a>
    </div>
  )
}
