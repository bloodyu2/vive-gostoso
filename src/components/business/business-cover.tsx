import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import {
  corDaCapa,
  ehCapaGenerica,
  escalaDoNome,
  iniciaisDoNome,
} from '@/lib/capa-negocio'

type CapaProps = {
  nome: string
  slug: string
  categoria?: string | null
}

/**
 * Capa desenhada em código a partir do nome e da categoria do negócio.
 *
 * É decoração: o nome que ela mostra já está no `h3` do card e no `h1` do
 * perfil, sempre ao lado dela. Ler duas vezes a mesma coisa atrapalha quem usa
 * leitor de tela, então a capa fica com `aria-hidden`. O texto alternativo
 * descritivo continua vindo do negócio, na foto de verdade, não daqui.
 */
export function CapaTipografica({ nome, slug, categoria }: CapaProps) {
  return (
    <div
      className="capa-negocio"
      style={{ backgroundColor: corDaCapa(slug) }}
      aria-hidden="true"
    >
      <div className="capa-negocio__conteudo">
        <span className="capa-negocio__nome" style={{ fontSize: `max(12px, min(${escalaDoNome(nome)}cqi, 15cqh))` }}>
          {nome}
        </span>
        {categoria && <span className="capa-negocio__categoria">{categoria}</span>}
      </div>
      <span className="capa-negocio__monograma">{iniciaisDoNome(nome)}</span>
    </div>
  )
}

type Props = CapaProps & {
  coverUrl?: string | null
  /** Texto alternativo da foto de verdade. Vem do negócio, com a categoria e a
   *  cidade, e não é usado quando cai na capa tipográfica. */
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

/**
 * A capa de um negócio, em um lugar só.
 *
 * Três situações que antes davam três resultados diferentes na tela passam a
 * cair no mesmo desenho:
 *
 * 1. Sem capa (64 negócios ativos): antes, o gradiente vazio do contêiner.
 * 2. Capa genérica por categoria (91): antes, `pousada.jpg` repetido 42 vezes
 *    na mesma listagem, `restaurante.jpg` 12 e `bar.jpg` 7.
 * 3. Capa que morreu depois de cadastrada: antes, o `SafeCoverImage` sumia com
 *    a imagem e sobrava o gradiente.
 *
 * Foto de verdade continua sendo foto de verdade: quando `coverUrl` aponta para
 * uma imagem que não é genérica, ela é exibida, e a capa tipográfica fica de
 * reserva para o caso de ela falhar.
 */
export function BusinessCover({
  coverUrl,
  alt,
  className = 'w-full h-full object-cover',
  loading,
  ...capa
}: Props) {
  if (!coverUrl || ehCapaGenerica(coverUrl)) return <CapaTipografica {...capa} />

  return (
    <SafeCoverImage
      src={coverUrl}
      alt={alt}
      className={className}
      loading={loading}
      fallback={<CapaTipografica {...capa} />}
    />
  )
}
