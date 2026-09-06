'use client'

import { useCallback, useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  /** Dimensões intrínsecas, para o navegador reservar o espaço e não haver
   *  salto de layout. Usadas na capa do artigo, que é o LCP daquela página. */
  width?: number
  height?: number
  /** `eager` na imagem que já aparece na primeira tela: adiar o carregamento
   *  dela atrasa o LCP em vez de melhorar. Padrão `lazy` para o resto. */
  loading?: 'lazy' | 'eager'
}

/**
 * <img> que some quando a foto falha, deixando aparecer o gradiente da marca
 * que já existe no contêiner atrás dela.
 *
 * DUAS FORMAS DE DETECTAR A FALHA, E PRECISA DAS DUAS:
 *
 * 1. `onError`, para a foto que falha depois que o React já hidratou.
 *
 * 2. A conferência no callback de ref, para a foto que **já falhou antes da
 *    hidratação**. Esse é o caso comum, não o raro: a imagem vem no HTML do
 *    servidor, o navegador começa a baixar na hora, e o erro chega antes de o
 *    React anexar qualquer listener. O `onError` nunca dispara e a imagem
 *    quebrada fica presa na tela.
 *
 * A versão anterior deste arquivo documentava exatamente o caso 2 no comentário
 * e mesmo assim só implementava o caso 1. Resultado medido em 2026-09-06 em
 * /come: 21 imagens quebradas na tela, cada uma ocupando 345x259px por cima do
 * gradiente, com o componente montado e sem nunca ter rodado o onError.
 *
 * `complete && naturalWidth === 0` é a forma de perguntar ao navegador "você
 * terminou de tentar e não veio imagem": `complete` sozinho é true também
 * quando deu certo, e `naturalWidth` sozinho é 0 enquanto ainda está baixando.
 *
 * A conferência mora num callback de ref, e não num `useEffect`, porque o
 * projeto tem `react-hooks/set-state-in-effect` ligado.
 */
export function SafeCoverImage({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
}: Props) {
  const [falhou, setFalhou] = useState(false)

  const conferirNaMontagem = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) setFalhou(true)
  }, [])

  if (falhou) return null

  return (
    <img
      ref={conferirNaMontagem}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => setFalhou(true)}
    />
  )
}
