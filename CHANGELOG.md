# Changelog — Vive Gostoso

> Responde: **o que mudou em cada versão?**
> Versionamento semântico: `MAIOR.MENOR.CORREÇÃO`. Entrada nova no topo. Registrar também o que impacta outra parte do sistema, porque é o que permite voltar atrás com segurança.

---

## [Não publicado]
- 07/10/2026: endurece validação de entradas, permissões de leitura e dependências. (1) Três migrações novas, aplicadas uma por vez no Supabase com o SQL de reversão no cabeçalho de cada arquivo: `20261007032301_vg_colunas_de_cobranca_so_para_servico.sql` (o papel `authenticated` passa a ler as mesmas colunas de `gostoso_businesses` que o `anon`, sem as duas `stripe_*`), `20261007033349_vg_visibilidade_do_negocio.sql` (leitura pública exige `active` e `is_published`; `active` passa a ser decisão do admin) e `20261007034448_vg_insert_anonimo_com_teto.sql` (tetos de tamanho e colunas internas fixas nas gravações do público em avaliações, vagas, serviços, transfers e eventos; `source_url` e `cover_url` de evento aceitam só http e https). (2) As três Edge Functions de pagamento foram reimplantadas a partir do repositório: recusam subir sem os segredos do Stripe (503) e respondem com mensagem genérica em erro interno. (3) `Evento`, `event-card` e `AdminEvents` passam o link de fonte por `safeExternalUrl`; `getBusiness`, `getBusinessForPage` e a busca filtram `is_published`; o admin publica e despublica `is_published` e `active` juntos (`src/lib/negocio-visibilidade.ts`); `MeusNegocios` avisa o dono quando a equipe desativou o negócio (pt, en, es). (4) `/api/csp-report` não lê corpo acima do teto. (5) `next` 16.3.8 e dependências na mesma faixa; chave `filters.carregando` que faltava nos três idiomas. Testes novos: Edge Functions com Stripe e banco simulados (`src/lib/funcoes-supabase`), políticas de banco num Postgres em memória (`src/lib/rls`), links, visibilidade, rota de relatórios e versões. **Impacta outras partes:** negócio em rascunho ou desativado deixa de abrir em `/negocio/[slug]` e de aparecer na busca para quem não é o dono nem admin; o dono não consegue mais reativar um negócio que o admin desativou; coluna nova em `gostoso_businesses` precisa de grant explícito para `authenticated` e `anon`; o formulário de evento recusa endereço que não comece com http ou https.
- 06/10/2026: Microsoft Clarity liberado na CSP e ligado ao banner de cookies. CSP (agora montada em `src/lib/csp.ts`, o `proxy.ts` so a chama) ganhou `https://www.clarity.ms https://*.clarity.ms` em `script-src`, `https://*.clarity.ms https://c.bing.com` em `connect-src` e `img-src`, e `https://www.clarity.ms` no `child-src` que ja existia (`frame-src 'none'` ficou como estava). Antes, em producao, a coleta (`y.clarity.ms/collect`) e o `c.clarity.ms/c.gif` eram bloqueados pela CSP. O banner chama `clarity('consentv2', ...)` ao aceitar e ao recusar, com fila quando o Clarity ainda nao carregou, e reaplica a escolha gravada a cada carregamento (antes, o aceite so valia na pagina em que foi dado; recusar agora tambem manda `consent update` negado). Texto do banner e da politica (secao 4) citam o Clarity nos tres idiomas. Testes em `src/lib/consentimento.test.ts` e `src/lib/csp-clarity.test.ts`. **Impacta outras partes:** o GA4 passa a receber o aceite de quem ja tinha aceitado em visita anterior.
- 02/10/2026 (KAN-463, rodada 2): o tamanho declarado das fotos de capa passa a ser o tamanho em que elas aparecem. `BusinessCover` ganhou a prop `sizes` (antes so o padrao `100vw` do `SafeCoverImage` valia) e a home, o cartao de negocio e o bloco "Agora em Gostoso" declaram a largura real. MEDIDO no build local de 02/10/2026: a foto do Storage do cartao "Chale Gostoso SMG", exibida a 178 px, caiu de 223.846 bytes (w=1080) para 87.186 bytes (w=640), e o total de imagem mais fetch da home caiu cerca de 133 KB. Nao muda layout nem comportamento, so qual variante do srcSet o navegador pede. Guarda em `src/lib/tamanho-de-imagem.test.ts`. **Impacta outras partes:** o cartao de negocio (`/come`, `/fique`, `/passeie`, Explore) tambem passa a pedir a variante certa.
- 29/09/2026 (KAN-463): velocidade sem mudar o que o site faz. Funcoes em gru1 (`vercel.json` so com `regions`); leituras publicas do Supabase em cache de dados de 5 minutos, limpo por `POST /api/revalidar` quando alguem logado grava pelo site; foto do Storage pelo otimizador do Next, com volta para a original; fontes pelo `next/font`; busca e sino fora do pacote inicial; primeiros cartoes das listas sem `lazy`. QA em `qa/velocidade-2026-09/` (linha de base de producao, fumaca Playwright, `comparar.mjs`). **Impacta outras partes:** o cliente do Supabase no navegador passa a avisar a rota nova depois de gravar; o nonce de CSP continua, entao o HTML segue dinamico (ver `decisoes.md`); dado gravado por fora do site aparece em ate 5 minutos.
- 27/09/2026: Post "Tábua de marés de São Miguel do Gostoso" em pt, es e en (SQL em `scripts/blog/2026-09-27-tabua-de-mares.sql`, a aplicar), com capa pela rota `/api/og/blog-mares`, posts traduzidos ligados por slug (`src/data/blog-traducoes.json`) com `hreflang` e BlogPosting por idioma; link "Leia o guia" nas marés, no Cardeiro, em Perobas e no Explore; /bio refeita para o Instagram (maré de hoje do Cardeiro, cartões, UTM em todo link); vitrine da home com frase, botão, contagem do banco e setas e bolinhas no celular. **Impacta outras partes:** a lista do blog, os relacionados e o sitemap passam a filtrar posts traduzidos por idioma; o validador de JSON-LD aceita BlogPosting; `fetchComCache` aceita tag; a /bio deixa de ter o salvar contato como ação principal.
- 27/09/2026: Vitrine de recursos na home (um cartão por aba, a tábua de marés em destaque com a maré de hoje do Cardeiro), `/explore` refeito como índice (marés, praias, mapa, passeios, eventos, transfer), mapa movido para `/explore/mapa` com pontos da região e filtro por categoria, link da maré nas praias citadas nos posts, JSON-LD (ItemList, BreadcrumbList, Beach, TouristAttraction, Place, Dataset), imagem Open Graph da home e do Explore, títulos e descrições revistos. **Impacta outras partes:** `/explore` deixa de ser o mapa (quem tinha link salvo cai no índice, que leva ao mapa); `page-metadata` ganha a rota `mapa` (14 rotas); WebSite perde a SearchAction; CSP ganha `*.tiles.mapbox.com` em `connect-src`; a grade de verbos da home sai.
- 27/09/2026: Tábua de marés. Página nova `/explore/mares` e uma por praia (`/explore/mares/cardeiro` e outras cinco), em pt, en e es: marés alta e baixa de hoje e dos próximos 7 dias, curva do dia com marcador de agora, fase da lua, o que a maré muda em cada praia e o melhor horário quando depende de maré. Dados das Tábuas de Maré da Marinha (CHM/DHN), estação Porto de Natal, na tabela nova `gostoso_mares` (migração `20260927_gostoso_mares.sql`, leitura pública, escrita só por service role), carregada por `scripts/mares/importar-tabua-marinha.ts`. Card de compartilhamento por praia com a maré do dia, JSON-LD, hreflang, sitemap, link no menu e no rodapé, e aviso no admin quando faltar previsão para os próximos 30 dias. **Impacta outras partes:** o menu e o rodapé ganham um item; o admin passa a ler `gostoso_mares`; `page-metadata` ganha a rota `mares` (13 rotas).
- PR #23: a página 404 ganha título próprio, "Página não encontrada | Vive Gostoso", via `metadata` em `app/not-found.tsx`. Guarda em `src/lib/titulo-da-404.test.ts`. Sem `noindex`: a 404 já responde status 404. Merge `67528b2` na dev.
- KAN-92: o contador de negócios associados sai da página do fundo. Os selos de associado e destaque continuam, como cortesia de pré-lançamento. Chaves `fund.raised_month` e `fund.raised_month_plural` removidas nos três idiomas, prop `associadosCount` removida de `FundHero` e o hook `useAssociadosCount` removido de `src/hooks/useFund.ts`. Guarda em `src/lib/contador-de-associados.test.ts`.
- Adotados os seis arquivos de contexto na raiz: `PRD.md`, `decisoes.md`, `mistakes.md`, `design.md`, `CLAUDE.md` e `CHANGELOG.md`.

## [1.4.0] — 2026-09
### Adicionado
- Correção de `hreflang`, com verificação no Search Console prevista para duas semanas depois.

## [1.3.0] — 2026-06
### Adicionado
- Módulo TRANSFER: listagem de prestadores, modal de detalhe, painel de moderação e estatísticas no admin.

## [1.2.0] — 2026-05-14
### Adicionado
- Design system com tokens em `@theme`, aplicativo instalável com manifest, service worker e ícones `teal-V`. PR #1 (`feature/design-system-pwa`) mergeada.
- Três idiomas completos, com roteamento por URL e `hreflang` em toda página pública.
- Planos mensal e anual e doação avulsa via Stripe.
- Sitemap gerado no prebuild e prévia social por página.

## [1.1.0] — 2026-05
### Segurança
- Auditoria aplicada nas migrations `20260514_security_audit_2026_05.sql` e `20260514_security_hardening_followup.sql`.
- Triggers anti-elevação em `gostoso_profiles` e `gostoso_businesses`.
- Lista de origens permitidas nas Edge Functions de pagamento.
- Cabeçalhos de segurança em `vercel.json`: HSTS com preload de dois anos, nosniff, frame DENY, referrer estrito, permissions restritiva e CSP com lista explícita, com relatório de violação em `/api/csp-report`.
- Senha com mínimo de 8 caracteres nos formulários de cadastro e de troca.
### Mudança que impacta outras partes
- `gostoso_is_admin()` passa a ser exigida em policies de `gostoso_profiles`. Policy `cmd=ALL` que a invoca precisa de `to authenticated`, senão quebra com 42501 em consulta anônima.

## [1.0.0] — 2026
### Adicionado
- Todos os módulos da Fase 0: COME, FIQUE, PASSEIE, EXPLORE, PARTICIPE, CONHEÇA, APOIE e CONTRATE.

---

**Antes disso** o histórico está em `./memory.md` e no arquivo do cliente no cérebro da Balaio. Esta numeração foi reconstruída em 10/09/2026 a partir desses registros e é aproximada; daqui em diante é mantida em tempo real.
