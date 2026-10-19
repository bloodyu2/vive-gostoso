import { cn } from '@/lib/utils'

/** Logo redonda do negocio, com aro claro para separar da foto de capa. So
 *  desenha quando o negocio tem `logo_url`: a maioria ainda nao tem. */
export function LogoDoNegocio({
  src,
  nome,
  className,
}: {
  src?: string | null
  nome: string
  className?: string
}) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={`Logo de ${nome}`}
      width={96}
      height={96}
      loading="lazy"
      className={cn('rounded-full object-cover bg-white ring-2 ring-white shadow-md', className)}
    />
  )
}
