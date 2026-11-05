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
import { ArrowDown, BedDouble, ChevronRight, Compass, ExternalLink, MapPin, Star, Ticket, UtensilsCrossed, Waves } from 'lucide-react'
import { Selo } from '@/components/business/selo'
import { RegistrarVisita } from '@/components/clube/registrar-visita'
import { ResgatePlaquinha } from '@/components/clube/resgate-plaquinha'
import { TemaClube } from '@/components/clube/tema'
import { SafeCoverImage } from '@/components/ui/safe-cover-image'
import { dicionario, ehIdioma, prefixo } from '@/lib/bio/dicionario'
import { usaCapaTipografica } from '@/lib/capa-negocio'
import { CLUBE_PUBLICO, CLUBE_ROTA } from '@/lib/clube/config'
import { carregarVantagens } from '@/lib/clube/carregar'
import type { Vantagem } from '@/lib/clube/vantagens'
import {
  DESTINO_PADRAO,
  linkDeAvaliacao,
  linkDeAvaliacaoExtra,
  linkDoInstagram,
  type PlaquinhaExtra,
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

interface ExtraPronto {
  cfg: PlaquinhaExtra
  negocio: NegocioDaPlaquinha
  vantagem: Vantagem | null
}

/** Os negocios a mais da plaquinha, na ordem do mapa. Negocio que nao esta publicado some em silencio:
 *  a plaquinha ja esta colada, entao nunca pode dar erro por causa de um extra. */
async function carregarExtras(cfgs: PlaquinhaExtra[] | undefined): Promise<ExtraPronto[]> {
  if (!cfgs || cfgs.length === 0) return []
  const { data } = await clientePublico()
    .from('gostoso_businesses')
    .select('id, name, slug, cover_url, logo_url, instagram')
    .in('slug', cfgs.map((c) => c.slug))
    .eq('active', true)
    .eq('is_published', true)
  const achados = (data ?? []) as NegocioDaPlaquinha[]
  const vantagens = CLUBE_PUBLICO && achados.length > 0 ? (await carregarVantagens(achados.map((a) => a.id))).vantagens : []
  const prontos: ExtraPronto[] = []
  for (const cfg of cfgs) {
    const negocio = achados.find((a) => a.slug === cfg.slug)
    if (!negocio) continue
    prontos.push({
      cfg,
      negocio: { ...negocio, name: (cfg.nome ?? negocio.name).trim() },
      vantagem: vantagens.find((v) => v.businessId === negocio.id && v.status === 'no_ar') ?? null,
    })
  }
  return prontos
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
  const instagram = linkDoInstagram(plaquinha.instagram) ?? linkDoInstagram(negocio.instagram)
  const foto = plaquinha.fotoGenerica
    ? null
    : !usaCapaTipografica(negocio.cover_url)
      ? negocio.cover_url
      : negocio.logo_url

  const vantagem = CLUBE_PUBLICO ? ((await carregarVantagens([negocio.id])).vantagens[0] ?? null) : null
  const noAr = vantagem?.status === 'no_ar'
  const regra = vantagem?.regra ?? null
  const extras = await carregarExtras(plaquinha.extras)
  const textosResgate = {
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
  }

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
          {extras.length > 0 ? (
            <a className="clube-p-aviso" href="#mais-aqui">
              <ArrowDown size={16} aria-hidden />
              {t.extras_aviso.replace('{nome}', extras.map((e) => e.negocio.name).join(', '))}
            </a>
          ) : null}
        </section>

        {CLUBE_PUBLICO && !(vantagem && noAr) ? (
          <section className="clube-p-convite" aria-labelledby="convite">
            <h2 id="convite" className="clube-p-h3">
              {t.convite_titulo}
            </h2>
            <p className="clube-p-texto">{t.convite_texto}</p>
            <a className="clube-btn clube-btn--contorno clube-btn--cheio" href={`${pre}${CLUBE_ROTA}?n=${codigo}`}>
              {t.passaporte_botao}
            </a>
          </section>
        ) : null}

        {CLUBE_PUBLICO && vantagem && noAr ? (
          <section className="clube-card" style={{ marginTop: '1.5rem' }} aria-labelledby="passaporte">
            <div className="clube-card-corpo">
              <div className="clube-card-topo">
                <span className="clube-icone">
                  <Ticket size={22} aria-hidden />
                </span>
                <h2 id="passaporte" className="clube-nome" style={{ paddingRight: 0, alignSelf: 'center' }}>
                  {t.passaporte_titulo}
                </h2>
              </div>
              <p className="clube-beneficio" style={{ marginTop: '1rem' }}>
                {vantagem.beneficio}
              </p>
              {regra ? <p className="clube-regra">{regra}</p> : null}
              <p className="clube-regra">{t.passaporte_nota}</p>
            </div>
            <div className="clube-picote" aria-hidden="true" />
            <div className="clube-canhoto">
              <ResgatePlaquinha
                partnerId={vantagem.partnerId}
                negocio={negocio.name}
                origem={codigo}
                prefixo={pre}
                doBanco
                esgotada={vantagem.esgotada}
                textos={textosResgate}
              />
            </div>
          </section>
        ) : null}

        {extras.length > 0 ? (
          <section id="mais-aqui" className="clube-p-extras" aria-labelledby="extras">
            <h2 id="extras" className="clube-p-h2">
              {t.extras_titulo}
            </h2>
            {extras.map((e) => {
              const linkGoogle = linkDeAvaliacaoExtra(e.cfg)
              const linkInsta = linkDoInstagram(e.cfg.instagram) ?? linkDoInstagram(e.negocio.instagram)
              const fotoExtra = !usaCapaTipografica(e.negocio.cover_url) ? e.negocio.cover_url : e.negocio.logo_url
              return (
                <article key={e.negocio.id} className="clube-p-extra">
                  <div className="clube-p-extra-foto">
                    {fotoExtra ? (
                      <SafeCoverImage
                        src={fotoExtra}
                        alt=""
                        className="clube-p-extra-img"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, 448px"
                        fallback={<span className="clube-p-extra-vazio" aria-hidden />}
                      />
                    ) : (
                      <span className="clube-p-extra-vazio" aria-hidden />
                    )}
                    {e.vantagem ? (
                      <span className="clube-p-extra-selo">
                        <Selo tipo="clube" size="lg" />
                      </span>
                    ) : null}
                  </div>
                  <div className="clube-p-extra-corpo">
                    <h3 className="clube-p-h3">{e.negocio.name}</h3>
                    {linkGoogle ? (
                      <a
                        className="clube-btn clube-btn--mostarda clube-btn--cheio clube-btn--grande"
                        href={linkGoogle}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Star size={22} aria-hidden />
                        {t.avaliar}
                        <ExternalLink size={18} aria-hidden />
                      </a>
                    ) : null}
                    {linkInsta ? (
                      <a
                        className="clube-btn clube-btn--contorno clube-btn--cheio"
                        href={linkInsta}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconeInstagram size={20} />
                        {t.instagram}
                      </a>
                    ) : null}
                    <a className="clube-btn clube-btn--fantasma clube-btn--cheio" href={`${pre}/negocio/${e.negocio.slug}`}>
                      {t.ver_perfil.replace('{nome}', e.negocio.name)}
                    </a>
                  </div>
                  {e.vantagem ? (
                    <div className="clube-p-extra-cupom">
                      <p className="clube-tipo">{t.passaporte_titulo}</p>
                      <p className="clube-beneficio">{e.vantagem.beneficio}</p>
                      {e.vantagem.regra ? <p className="clube-regra">{e.vantagem.regra}</p> : null}
                      <ResgatePlaquinha
                        partnerId={e.vantagem.partnerId}
                        negocio={e.negocio.name}
                        origem={codigo}
                        prefixo={pre}
                        doBanco
                        esgotada={e.vantagem.esgotada}
                        textos={textosResgate}
                      />
                    </div>
                  ) : null}
                </article>
              )
            })}
          </section>
        ) : null}

        {caminhos}
      </main>

      {rodape}
    </TemaClube>
  )
}
