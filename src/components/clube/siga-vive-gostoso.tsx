import Image from 'next/image'
import { LinkMedido } from '@/components/clube/link-medido'

export const ID_SIGA_VIVE_GOSTOSO = 'siga-vive-gostoso'

const INSTAGRAM_VIVE_GOSTOSO = 'https://instagram.com/vivegostoso'

/** Três imagens do próprio site (já usadas na vitrine da home): o convite não depende da API do Instagram. */
const FOTOS = ['/images/vitrine/explore.jpg', '/images/vitrine/passeie.jpg', '/images/vitrine/fique.jpg']

interface Props {
  codigo: string
  negocio: string
  titulo: string
  texto: string
  botao: string
}

function IconeInstagram() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Convite para seguir o @vivegostoso no Instagram, no fim da página da plaquinha. */
export function SigaViveGostoso({ codigo, negocio, titulo, texto, botao }: Props) {
  return (
    <section id={ID_SIGA_VIVE_GOSTOSO} className="clube-p-siga" aria-labelledby="siga-titulo">
      <div className="clube-p-siga-topo">
        <Image className="clube-p-siga-logo" src="/brand/avatar-circular.png" alt="" width={56} height={56} />
        <div>
          <h2 id="siga-titulo" className="clube-p-h3">
            {titulo}
          </h2>
          <p className="clube-p-siga-arroba">@vivegostoso</p>
        </div>
      </div>
      <p className="clube-p-texto">{texto}</p>
      <ul className="clube-p-siga-fotos">
        {FOTOS.map((src) => (
          <li key={src}>
            <Image src={src} alt="" width={160} height={160} sizes="(max-width: 640px) 30vw, 150px" />
          </li>
        ))}
      </ul>
      <LinkMedido
        codigo={codigo}
        acao="seguir_vive"
        negocio={negocio}
        className="clube-btn clube-btn--mostarda clube-btn--cheio"
        href={INSTAGRAM_VIVE_GOSTOSO}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconeInstagram />
        {botao}
      </LinkMedido>
    </section>
  )
}
