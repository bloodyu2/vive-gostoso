'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
}

/**
 * <img> que esconde a si mesmo via estado do React quando a foto falha,
 * deixando aparecer o fundo decorativo em degrade que ja existe atras dela.
 *
 * O padrao anterior (onError mexendo direto no style.display do elemento)
 * dependia de o erro disparar depois que o React anexou o listener. Quando o
 * navegador ja tinha em cache que a URL falha, o erro vinha antes da hidratacao,
 * o onError nunca rodava e o icone de imagem quebrada ficava presa na tela --
 * foi o que aconteceu em /fique e /passeie.
 */
export function SafeCoverImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
