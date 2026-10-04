# Rodada Magic UI — relatorio de execucao

> Autor: agente OpenClaw (front-end), a pedido do Victor. Data: 2026-10-04.
> Branch local: `feat/magicui-ui-ux`, a partir de `master` (`dd739d2`). **Nada foi
> enviado**: sem push, sem PR, sem merge, sem deploy.
> Fonte: `docs/design/magic-ui-auditoria.md` e `docs/design/magic-ui-plano.md`.
> Lotes 1 a 5 executados. **Lote 6 nao executado** (decisao do dono).

## Resumo

- Lotes 1 a 5 concluidos, um commit por lote, quatro comandos verdes em cada um.
- Nenhuma dependencia nova; nenhum componente de `src/components/ui/` substituido.
- Componentes do Magic UI copiados e adaptados em `src/components/magicui/`,
  todos com recursos nativos (View Transitions, IntersectionObserver,
  requestAnimationFrame, mask-image). Sem `motion`/`framer-motion`.
- Vazio e travessao: o texto novo nao usa travessao nem emoji.

## Quatro comandos (resultado final)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 problemas |
| `npm run test` | 333 testes, 41 arquivos, todos passando |
| `npm run build` | exit 0 |

## Commits (locais)

| Lote | Commit |
|---|---|
| 1 | `c7a61ca` fundacao de tokens, botoes, alvos, foco |
| 1 (extra) | `91fc7f7` mesmo token em `app/[lang]/error.tsx` |
| 2 | `80ae288` cards e listagens (dark) |
| 3 | `1c69ec4` hero e navegacao |
| 4 | `507b05f` estados, overlays e conversao |
| 5 | `db0c1e6` Magic UI com movimento controlado |

## Lote 1 — fundacao

Arquivos: `src/styles/globals.css`, `src/components/ui/button.tsx`,
`src/components/ui/lightbox.tsx`, `src/components/reviews/star-rating.tsx`,
`src/components/reviews/review-list.tsx`, `src/components/business/*`,
`src/components/layout/header.tsx`, `src/components/i18n/language-selector.tsx`,
`src/views/Home.tsx`, `src/views/Blog.tsx`, `src/components/blog/*`, `app/[lang]/error.tsx`.

- Tokens de texto novos: `--color-fg-3-texto` (#5C5C5C), `--color-coral-texto`
  (#C44A2C), `--color-ocre-texto` (#A05E1A), `--color-whatsapp` (#128C4A),
  `--color-placeholder` (#6B655E), com variantes em `.dark`. Os tokens de
  preenchimento nao mudaram.
- Varredura guiada: `text-[#737373]` -> `text-fg-3-texto`; `#B0A99F` ->
  `text-placeholder`; placeholder de busca -> `placeholder:text-placeholder`.
- Botao primario: base `bg-coral-texto`, hover `coral-darker` (4,81:1 com branco).
- WhatsApp como fundo de texto branco: `bg-whatsapp` (#128C4A) no CTA do perfil,
  no CTA do blog e na pilula do card; hover `#0E7440`.
- Alvos a 44px: toggle de visao, pills de categoria, pill "aberto agora", botao de
  tema, seletor de idioma, paginacao de reviews, setas/fechar do lightbox,
  estrelas interativas (min 36px com espaco, o piso do WCAG 2.2).
- `scrollbar-none` definida como `@utility` (era usada e nao existia).
- Zoom de imagem no hover removido (home, blog, relacionados).
- `top-[69px]` do drawer trocado por `--header-h`, medida por `ResizeObserver`.

## Lote 2 — cards e listagens

Arquivos: `src/components/business/business-card.tsx`,
`business-filters.tsx`, `business-grid.tsx`, `src/views/Blog.tsx`,
`src/views/Contrate.tsx`, `src/views/Home.tsx`, `src/views/Negocio.tsx`,
`src/views/Participe.tsx`, `src/components/blog/RelatedPosts.tsx`,
`src/components/contrate/*`, `src/components/events/event-card.tsx`,
`src/components/reviews/review-list.tsx`.

- `BusinessCard`: metadados em `fg-3-texto`, preco antes do rating, hover sem
  deslocamento (`-translate-y-0.5` removido).
- Grade do blog e de relacionados adapta ao numero de posts (1, 2, 3+).
- `Contrate`: `★`/`☆` trocados pelo `StarRating` (lucide).
- Tema escuro nas superficies publicas de maior trafego (cards, listagens,
  `/negocio`, blog, contrate).

## Lote 3 — hero e navegacao

Arquivos: `src/views/Home.tsx`, `src/components/home/hoje.tsx`,
`src/components/search/global-search.tsx`, `src/components/ui/toast.tsx`.

- Dot-grid generico do hero removido.
- `animate-pulse`/`animate-bounce` removidos do hero e do painel "Agora em Gostoso".
- Busca global navegavel por teclado (setas, Enter, `role=listbox`/`combobox`).
- Toasts com tokens do design system, superficie solida, sem `backdrop-blur`.
- **Item 3.3 (bloco Instagram) NAO aplicado**: e decisao de marca (lote 6).

## Lote 4 — estados, overlays e conversao

Arquivos: `src/components/ui/lightbox.tsx`,
`src/components/events/event-submit-form.tsx`,
`src/components/reviews/review-list.tsx`, `src/hooks/useReviews.ts`,
`src/lib/media-avaliacoes.ts` (+ teste), `src/views/Negocio.tsx`,
`src/components/business/business-grid.tsx`, `src/locales/{pt,en,es}.json`.

- Lightbox: `role=dialog`, `aria-modal`, foco preso, Esc, retorno de foco, alvos 44.
- Modal de evento com o mesmo padrao de foco, Esc e alvos.
- Media de avaliacoes pelo agregado real (`rating.sum()`/`rating.count()` na
  `gostoso_reviews`), com `mediaAvaliacoes` testada; paginacao ancora na lista.
- Estrelas maiores e vazio com token de contraste.
- Barra fixa de contato no `/negocio` no celular (WhatsApp + "Como chegar"),
  escondida perto do rodape e quando a sidebar ja mostra o mesmo CTA.
- Estados da grade com `aria-busy`/`role=status`.

## Lote 5 — Magic UI com movimento controlado

Arquivos novos: `src/components/magicui/{theme-toggler,lens,progressive-blur,scroll-progress,blur-fade}.tsx`.
Wiring: `header.tsx`, `Negocio.tsx`, `vitrine.tsx`, `business-filters.tsx`,
`BlogPost.tsx`, `Home.tsx`, `globals.css`.

- `theme-toggler`: revelacao em circulo pela View Transitions, a partir do botao.
- `lens`: zoom no hover da galeria (so ponteiro fino; toque intacto).
- `progressive-blur`: bordas do carrossel da vitrine e das pills (estatico).
- `scroll-progress`: linha de leitura no post do blog (rAF + `scaleX`).
- `blur-fade`: entrada unica de secoes abaixo da dobra da home.
- `prefers-reduced-motion` respeitado em todos; nada acima da dobra; nada no H1.

## Lighthouse (antes x depois)

Harness da casa (`qa/velocidade-2026-09/lighthouse.mjs`, 3 rodadas, mediana).
Antes = build do lote 4; depois = build do lote 5. Base `http://localhost:3000`.

| Pagina | Nota antes -> depois | LCP antes -> depois |
|---|---|---|
| `/` | 54 -> 57 | 6,38 s -> 5,64 s |
| `/explore/mares` | 69 -> 77 | 4,62 s -> 3,92 s |
| `/come` | 53 -> 51 | 5,87 s -> 6,11 s |

O LCP da home e de mares melhorou; `/come` variou 0,24 s dentro da propria
dispersao (notas 49/53/54 antes contra 50/51/51 depois) e o elemento de LCP e a
foto eager de capa (Unsplash), que nenhum lote tocou. **Nenhuma rota piorou o LCP
de forma atribuivel a esta rodada.**

Observacao de ambiente: as libs do Chromium em `/tmp/libs` tinham sido apagadas
por um restart; foram reextraidas dos `.deb` (sem sudo) para rodar o harness.

## Capturas (`qa/rodada-magicui/`, 390 e 1280)

O que aparece em cada uma (paginas inteiras, tela cheia):

- `home-390.png`: hero escuro "Come. Fique. Passeie. Vive Gostoso.", CTAs
  "Explorar"/"Restaurantes", banner de cookies, vitrine de cartoes, painel escuro
  "Agora em Gostoso", faixa do Instagram, "Verificados pela cidade", rodape.
- `home-1280.png`: hero com a grade de vitrine completa (tabua de mares maior),
  painel "Agora em Gostoso", 3 cards "Verificados", rodape. Sem dot-grid; sem
  elementos piscando.
- `come-390.png` / `come-1280.png`: listagem longa de negocios; cards com nome,
  categoria, selo aberto/fechado, preco e acoes.
- `blog-390.png` / `blog-1280.png`: grade de posts.
- `negocio-390.png` / `negocio-1280.png`: perfil do negocio (capa, avaliacoes,
  form) e, no celular, a barra fixa de contato no rodape do viewport.
- `contrate-390.png` / `contrate-1280.png`: abas, pills de categoria, cards de
  profissionais (nota por estrelas desenhadas, sem glyph).
- `participe-390.png`, `apoie-390.png`: eventos e doacao.
- `negocio-390-barra.png`: viewport no meio da pagina, com a sidebar visivel
  (a barra some quando o proprio CTA da sidebar aparece).
- `negocio-390-topo.png`: topo do perfil no celular, com a barra fixa visivel:
  botao verde "Falar no WhatsApp" e botao branco "Como chegar".
- `blogpost-390-progresso.png` e `blogpost-390-topo.png`: post do blog; a barra
  de progresso de leitura foi confirmada pelo `transform: scaleX(0.58)` no topo.
- `home-390-escuro.png`, `come-390-escuro.png`, `negocio-390-escuro.png`: tema
  escuro das superficies de maior trafego, sem manchas brancas.

## Lote 6 — o que depende de decisao do dono (nao executado)

1. **`marquee`**: so com conteudo definido (recem chegados, parceiros ou selos).
2. **`number-ticker`**: so nos totais reais do fundo, nao nos % fixos da transparencia.
3. **`animated-list`** no "Agora em Gostoso" e no sino (peso de JS).
4. **`confetti`** no sucesso da doacao (delicia ou infantilizacao?).
5. **`avatar-circles`** como prova social: precisa de autorizacao de imagem.
6. **TOC/ancoras no `/conheca`** (modo Read).
7. **Bloco Instagram** (home e rodape): manter o gradiente oficial ou tratar
   on-brand? Decisao de marca.
8. **`motion`**: nao foi necessario; a versao nativa dos cinco itens ficou fiel.
   Reavaliar so se quiser os itens do lote 6.

Tambem fica para o dono: README desatualizado (fala Vite/React Router).

## O que nao consegui fazer

- Nao apliquei o lote 6 nem o bloco Instagram (decisao do dono).
- Nao medi leitor de tela real nem axe automatico; a verificacao de a11y foi por
  codigo e por inspecao (foco, `aria-*`, contraste calculado).
- Nao medi o CI do GitHub (sem push, por regra).
- E2E do repo (`qa/velocidade-2026-09/fumaca.spec.ts`) nao foi rodado nesta
  rodada: exige o webServer do Playwright com Supabase simulado; o app foi
  validado por build + testes de unidade + capturas.

## Lista curta para o dono ver/testar no site

1. **Efeito do tema**: clicar no sol/lua no header e ver a cor "abrir" em circulo
   a partir do botao (no celular, no menu). Testar com "reduzir movimento" ligado
   no sistema: a troca vira instantanea.
2. **Barra de contato no perfil**: no celular, abrir um negocio com WhatsApp e
   rolar; a barra WhatsApp + "Como chegar" fica no rodape. Ela some quando o
   contato da propria pagina aparece e perto do rodape.
3. **Avaliacoes**: ver a media de um negocio com varias paginas e conferir que ela
   nao muda ao paginar; paginar nao joga mais para o topo do site.
4. **Galeria**: no desktop, passar o mouse numa foto do negocio e ver o zoom; no
   celular, o toque continua abrindo a foto grande.
5. **Busca por teclado**: `Ctrl/Cmd+K`, digitar, navegar com as setas e abrir com
   Enter; leitor de tela anuncia as opcoes.
6. **Blog**: abrir um post longo e ver a linha fina de progresso no topo
   acompanhando a leitura.
7. **Carrossel**: no celular, ver as bordas esmaecidas da vitrine e das pills
   sinalizando que ha mais ao lado.
8. **Contraste no sol**: conferir cinza e botoes coral legiveis no celular, ao ar
   livre, e o botao verde de WhatsApp legivel.
