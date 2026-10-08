// src/components/magicui/marquee.tsx
// Adaptado do `marquee` do Magic UI: faixa que rola devagar (logos, selos,
// frases curtas). Duplica o conteudo uma vez para fechar o laco, pausa com o
// mouse em cima ou foco dentro, e com prefers-reduced-motion deixa de rolar e
// vira uma fileira que quebra linha. A copia duplicada fica `aria-hidden`, para
// leitor de tela ler cada item uma vez so.
import { cn } from '@/lib/utils'

export function Marquee({
  children,
  className,
  duracao = 40,
}: {
  children: React.ReactNode
  className?: string
  /** Segundos para uma volta completa. */
  duracao?: number
}) {
  return (
    <div className={cn('vg-marquee overflow-hidden', className)} style={{ ['--vg-marquee-s' as string]: `${duracao}s` }}>
      <div className="vg-marquee__trilho">
        <div className="vg-marquee__grupo">{children}</div>
        <div className="vg-marquee__grupo" aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}
