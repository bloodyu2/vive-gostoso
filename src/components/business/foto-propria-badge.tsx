import { Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * "Foto do próprio negócio".
 *
 * Só aparece na imagem que o dono enviou pelo painel depois de aceitar a
 * cláusula de direitos de imagem, com data e usuário gravados. Foto que já
 * estava no cadastro antes disso não recebe o rótulo, mesmo que tenha vindo do
 * dono: um rótulo que às vezes mente vale menos que rótulo nenhum.
 *
 * Fundo branco sólido, e não translúcido, porque ele fica por cima de foto:
 * sobre um céu claro um chip transparente some.
 */
export function FotoPropriaBadge({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-white text-[#1A1A1A] text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${className}`}
    >
      <Camera className="w-3 h-3" aria-hidden="true" />
      {t('negocio.foto_propria')}
    </span>
  )
}
