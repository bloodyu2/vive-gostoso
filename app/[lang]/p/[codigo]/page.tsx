// app/[lang]/p/[codigo]/page.tsx
// Pagina da plaquinha do balcao (o QR aponta para /p/NN). Cada codigo e de um
// estabelecimento, definido em src/lib/plaquinhas.ts. A pessoa chega aqui com o celular
// na mao, no balcao: o lugar com foto, o botao grande de avaliar no Google, o Instagram
// dele, a vantagem do Passaporte Gostoso com o resgate do cupom e o caminho para o resto
// do guia. Codigo reservado (sem negocio ainda) abre uma pagina do Vive Gostoso; codigo
// sem nada cai na home, nunca em 404 (a plaquinha ja esta no balcao).
import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { BedDouble, ChevronRight, Compass, ExternalLink, MapPin, Star, Ticket, UtensilsCrossed, Waves } from 'lucide-react'
import { Selo } from '@/components/business/selo'
import { RegistrarVisita } from '@/components/clube/registrar-visita'
import { ResgatePlaquinha } from '@/components/clube/resgate-plaquinha'
import { TemaClube } from '@/components/clube/tema'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { usaCapaTipografica } from '@/lib/capa-negocio'
import { CLUBE_PUBLICO, CLUBE_ROTA } from '@/lib/clube/config'
import { carregarVantagens } from '@/lib/clube/carregar'
import {
  DESTINO_PADRAO,
  linkDeAvaliacao,
  linkDoInstagram,
  plaquinhaDoCodigo,
  plaquinhaReservada,
} from '@/lib/plaquinhas'
import { clientePublico } from '@/lib/supabase/publico'

type Props = { params: Promise<{ lang: string; codigo: string }> }

interface NegocioDaPlaquinha {
  id: string
  name: string
  slug: string
  cover_url: string | null
  logo_url: string | null
  instagram: string | null
}

const POR_DO_SOL = '/negocios/biscoitos-damy/por-do-sol.jpg'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return {
    title: { absolute: dicionario(lang).plaquinha.page_title },
    robots: { index: false, follow: false, nocache: true },
  }
}

/** O logo do Instagram nao existe mais no pacote de icones; este e um tracado proprio, simples. */
function IconeInstagram({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

export default async function PlaquinhaPage({ params }: Props) {
  const { lang, codigo } = await params
  const idioma = ehIdioma(lang) ? lang : 'pt'
  const d = dicionario(idioma)
  const t = d.plaquinha
  const tc = d.clube
  const pre = prefixo(idioma)
  const plaquinha = plaquinhaDoCodigo(codigo)

  const explorar = [
    { href: `${pre}/`, rotulo: t.link_site, icone: <MapPin size={20} aria-hidden /> },
    { href: `${pre}/come`, rotulo: t.link_come, icone: <UtensilsCrossed size={20} aria-hidden /> },
    { href: `${pre}/fique`, rotulo: t.link_fique, icone: <BedDouble size={20} aria-hidden /> },
    { href: `${pre}/passeie`, rotulo: t.link_passeie, icone: <Compass size={20} aria-hidden /> },
    { href: `${pre}/explore/mares`, rotulo: t.link_mares, icone: <Waves size={20} aria-hidden /> },
    ...(CLUBE_PUBLICO
      ? [{ href: `${pre}${CLUBE_ROTA}?n=${codigo}`, rotulo: t.link_clube, icone: <Ticket size={20} aria-hidden /> }]
      : []),
  ]

  const porDoSol = <Image className="clube-hero-img" src={POR_DO_SOL} alt="" fill priority sizes="100vw" />

  const marca = (
    <div className="clube-wrap clube-marca-linha">
      <a className="clube-marca" href={`${pre}/`}>
        {tc.marca}
      </a>
    </div>
  )

  const caminhos = (
    <section className="clube-p-explorar" aria-labelledby="explorar">
      <h2 id="explorar" className="clube-p-h2">
        {t.explorar_titulo}
      </h2>
      <ul className="clube-p-links">
        {explorar.map((l) => (
          <li key={l.href}>
            <a className="clube-p-link" href={l.href}>
              <span className="clube-p-link-icone">{l.icone}</span>
              <span>{l.rotulo}</span>
              <ChevronRight size={18} aria-hidden className="clube-p-link-seta" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )

  const rodape = (
    <footer className="clube-rodape">
      <div className="clube-col">{t.rodape}</div>
    </footer>
  )

  /* Plaquinha reservada: o QR ja esta impresso, o lugar ainda nao foi dado. */
  if (!plaquinha) {
    if (!plaquinhaReservada(codigo)) redirect(DESTINO_PADRAO)
    return (
      <TemaClube escuroAuto>
        <RegistrarVisita codigo={codigo} />
        <header className="clube-capa-p">
          {porDoSol}
          {marca}
          <div className="clube-col" style={{ marginInline: 'auto' }}>
            <h1 className="clube-p-titulo clube-entra">{t.generica_titulo}</h1>
          </div>
        </header>
        <main className="clube-col" style={{ paddingBottom: '2rem' }}>
          <div className="clube-p-quadro">
            <p className="clube-p-texto">{t.generica_texto}</p>
            {CLUBE_PUBLICO ? (
              <div className="clube-pilha">
                <a className="clube-btn clube-btn--mostarda clube-btn--cheio" href={`${pre}${CLUBE_ROTA}?n=${codigo}`}>
                  {t.passaporte_botao}
                </a>
              </div>
            ) : null}
          </div>
          {caminhos}
        </main>
        {rodape}
      </TemaClube>
    )
  }

  const { data } = await clientePublico()
    .from('gostoso_businesses')
    .select('id, name, slug, cover_url, logo_url, instagram')
    .eq('slug', plaquinha.slug)
    .eq('active', true)
    .eq('is_published', true)
    .maybeSingle()
  const achado = data as NegocioDaPlaquinha | null
  if (!achado) redirect(DESTINO_PADRAO)
  const negocio = { ...achado, name: (plaquinha.nome ?? achado.name).trim() }

  const avaliar = linkDeAvaliacao(plaquinha)
  const instagram = linkDoInstagram(negocio.instagram) ?? linkDoInstagram(plaquinha.instagram)
  const foto = plaquinha.fotoGenerica
    ? null
    : !usaCapaTipografica(negocio.cover_url)
      ? negocio.cover_url
      : negocio.logo_url

  const vantagem = CLUBE_PUBLICO ? ((await carregarVantagens([negocio.id])).vantagens[0] ?? null) : null
  const noAr = vantagem?.status === 'no_ar'
  const regra = vantagem?.regra ?? null

  return (
    <TemaClube escuroAuto>
      <RegistrarVisita codigo={codigo} />
      <header className="clube-capa-p" style={plaquinha.foco !== undefined ? ({ '--foco': `${plaquinha.foco}%` } as CSSProperties) : undefined}>
        {foto ? (
          <SafeCoverImage
            src={foto}
            alt=""
            className="clube-hero-img"
            loading="eager"
            sizes="100vw"
            fallback={porDoSol}
          />
        ) : (
          porDoSol
        )}
        {marca}
        <div className="clube-col" style={{ marginInline: 'auto' }}>
          <p className="clube-p-obrigado clube-entra">{t.obrigado}</p>
          <h1 className="clube-p-titulo clube-entra">{negocio.name}</h1>
          {noAr ? (
            <p className="clube-p-selo clube-entra">
              <Selo tipo="clube" size="lg" />
              <span>{d.selo.clube}</span>
            </p>
          ) : null}
        </div>
      </header>

      <main className="clube-col" style={{ paddingBottom: '2rem' }}>
        <section className="clube-p-quadro" aria-labelledby="avaliar">
          <h2 id="avaliar" className="clube-p-h2">
            {t.avaliar_titulo}
          </h2>
          <p className="clube-p-texto">{t.sub}</p>
          <div className="clube-pilha">
            {avaliar ? (
              <a
                className="clube-btn clube-btn--mostarda clube-btn--cheio clube-btn--grande"
                href={avaliar}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star size={22} aria-hidden />
                {t.avaliar}
                <ExternalLink size={18} aria-hidden />
              </a>
            ) : null}
            {instagram ? (
              <a
                className="clube-btn clube-btn--contorno clube-btn--cheio"
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconeInstagram size={20} />
                {t.instagram}
              </a>
            ) : null}
            <a className="clube-btn clube-btn--fantasma clube-btn--cheio" href={`${pre}/negocio/${negocio.slug}`}>
              {t.ver_perfil.replace('{nome}', negocio.name)}
            </a>
          </div>
        </section>

        {CLUBE_PUBLICO ? (
          <section className="clube-card" style={{ marginTop: '1.5rem' }} aria-labelledby="passaporte">
            <div className="clube-card-corpo">
              <div className="clube-card-topo">
                <span className="clube-icone">
                  <Ticket size={22} aria-hidden />
                </span>
                <h2 id="passaporte" className="clube-nome" style={{ paddingRight: 0, alignSelf: 'center' }}>
                  {vantagem ? t.passaporte_titulo : tc.marca}
                </h2>
              </div>
              {vantagem ? (
                <>
                  <p className="clube-beneficio" style={{ marginTop: '1rem' }}>
                    {vantagem.beneficio}
                  </p>
                  {regra ? <p className="clube-regra">{regra}</p> : null}
                  {noAr ? <p className="clube-regra">{t.passaporte_nota}</p> : null}
                </>
              ) : (
                <p className="clube-beneficio" style={{ marginTop: '1rem' }}>
                  {t.passaporte_chamada}
                </p>
              )}
            </div>
            <div className="clube-picote" aria-hidden="true" />
            <div className="clube-canhoto">
              {vantagem && noAr ? (
                <ResgatePlaquinha
                  partnerId={vantagem.partnerId}
                  negocio={negocio.name}
                  origem={codigo}
                  prefixo={pre}
                  doBanco
                  esgotada={vantagem.esgotada}
                  textos={{
                    usar: tc.usar,
                    ver_cupom: tc.ver_cupom,
                    resgatar_de_novo: tc.resgatar_de_novo,
                    form_titulo: tc.form_titulo,
                    campo_nome: tc.campo_nome,
                    campo_email: tc.campo_email,
                    campo_telefone: tc.campo_telefone,
                    nota_dados: tc.nota_dados,
                    consentimento: tc.consentimento,
                    politica_link: tc.politica_link,
                    gerar_cupom: tc.gerar_cupom,
                    gerando: tc.gerando,
                    cancelar: tc.cancelar,
                    erro_nome: tc.erro_nome,
                    erro_email: tc.erro_email,
                    erro_telefone: tc.erro_telefone,
                    erro_consentimento: tc.erro_consentimento,
                    erro_ja_tem: tc.erro_ja_tem,
                    erro_resgate: tc.erro_resgate,
                    erro_muitos: tc.erro_muitos,
                    erro_limite_contato: tc.erro_limite_contato,
                    erro_indisponivel: tc.erro_indisponivel,
                    esgotada: tc.esgotada,
                  }}
                />
              ) : (
                <a className="clube-btn clube-btn--verde clube-btn--cheio" href={`${pre}${CLUBE_ROTA}?n=${codigo}`}>
                  {t.passaporte_botao}
                </a>
              )}
            </div>
          </section>
        ) : null}

        {caminhos}
      </main>

      {rodape}
    </TemaClube>
  )
}
