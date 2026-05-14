interface ImageWithCaptionProps {
  src: string
  alt: string
  caption?: string
  /** Crédito da imagem (ex: 'Foto: João Silva / Unsplash') */
  credit?: string
  width?: number
  height?: number
  /** loading. Default: 'lazy'. Use 'eager' apenas para o hero. */
  loading?: 'lazy' | 'eager'
}

/**
 * Imagem responsiva com caption e crédito opcional.
 * Sempre lazy por padrão. alt é obrigatório.
 */
export function ImageWithCaption({
  src,
  alt,
  caption,
  credit,
  width = 1200,
  height = 800,
  loading = 'lazy',
}: ImageWithCaptionProps) {
  return (
    <figure className="not-prose my-8">
      <div className="rounded-2xl overflow-hidden bg-[#E8E4DF] dark:bg-[#2D2D2D]">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          className="w-full h-auto block"
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2 text-xs text-[#737373] text-center leading-relaxed">
          {caption}
          {caption && credit && ' · '}
          {credit && <span className="opacity-80">{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}
