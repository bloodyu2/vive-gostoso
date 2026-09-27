# Relatório: Tábua de marés (27/09/2026)

Branch `feat/tabua-de-mares`, saída de `dev`. Nada foi aplicado em produção: migração, importação, push, PR e deploy ficam para a etapa "Produção".

## 1. O que foi feito e onde

| Parte | Onde |
|---|---|
| Página índice (pt, en, es) | `app/[lang]/explore/mares/page.tsx` |
| Página por praia, com URL própria | `app/[lang]/explore/mares/[praia]/page.tsx` |
| Card de compartilhamento por praia, com a maré do dia | `app/[lang]/explore/mares/[praia]/opengraph-image.tsx` |
| Componentes (cartão do dia, curva, seletor de dia, tabela da semana, rodapé com fonte e aviso, estado vazio) | `src/components/mares/` |
| Lista das praias | `src/data/praias-mares.ts` |
| Extração do PDF da Marinha | `src/lib/mares/extrair-tabua.ts`, `src/lib/mares/ler-pdf.ts` |
| Curva cosseno, fase da lua, melhor janela, fuso | `src/lib/mares/curva.ts`, `lua.ts`, `melhor-janela.ts`, `tempo.ts` |
| Leitura do Supabase (tolerante a tabela ausente, cache de 1 h) | `src/lib/mares/consulta.ts`, `carregar.ts` |
| Metadados, hreflang e JSON-LD (WebPage, Beach, BreadcrumbList) | `src/lib/mares/seo-mares.ts` |
| Migração da tabela `gostoso_mares` | `supabase/migrations/20260927_gostoso_mares.sql` |
| Importador | `scripts/mares/importar-tabua-marinha.ts` |
| PDFs oficiais | `scripts/mares/fontes/natal-2026.pdf`, `guamare-2026.pdf` (este só para comparar) |
| Textos nos três idiomas | `src/locales/{pt,en,es}.json` (blocos `mares`, `meta.mares`, `nav.mares`) |
| Menu e rodapé | `src/components/layout/header.tsx`, `footer.tsx` |
| Sitemap | `scripts/generate-sitemap.mjs` (o projeto gera o sitemap no prebuild; não há `sitemap.ts`) |
| Aviso no admin quando faltar previsão nos próximos 30 dias | `app/cadastre/admin/page.tsx` |

Fonte dos dados: PDF da Marinha (plano A). O plano B não foi preciso.

## 2. Praias

**Entraram (6)**, com nome, lugar e coordenadas conferidos no OpenStreetMap:

| Praia | Município | Dica | Melhor horário calculado |
|---|---|---|---|
| Praia do Cardeiro | São Miguel do Gostoso | Piscinas naturais entre as pedras na maré baixa | maré baixa |
| Praia da Xêpa | São Miguel do Gostoso | Praia central; faixa de areia bem menor na maré alta | maré baixa |
| Praia do Maceió | São Miguel do Gostoso | Água calma, parecendo lagoa, boa para criança na maré baixa | maré baixa |
| Praia do Santo Cristo | São Miguel do Gostoso | Kite e windsurf; a maré muda a lâmina d'água | sem janela (a dica não diz qual maré é a boa) |
| Praia de Tourinhos | São Miguel do Gostoso | Dunas petrificadas; jatos entre as pedras na maré alta | maré alta |
| Praia do Marco | Pedra Grande | Marco histórico; acesso pela areia depende da maré | sem janela (idem) |

Fonte de cada dica: a ordem do Victor de 27/09/2026. Ids do OSM em `decisoes.md`.

**Ficaram de fora (4):**
- Praia do Amor, Praia de Zé Martins e Praia da Malhada: não há registro no OSM e não achei fonte que confirme o lugar nem o efeito da maré.
- Praia do Minhoto: não há registro no OSM, e a fonte encontrada a situa em Guamaré, não em Touros.

Achado à parte: `/conheca` descreve o Minhoto como "a principal" de Gostoso e a Praia do Amor como praia de Gostoso. Não mexi nisso; fica para conferir.

## 3. Estação de referência e distância

Todas as praias usam o Porto de Natal (COM3DN), como a ordem pede. As distâncias são em linha reta:

| Praia | Porto de Natal | Porto de Guamaré |
|---|---|---|
| Cardeiro | 86 km | 76 km |
| Xêpa | 86 km | 76 km |
| Maceió | 87 km | 75 km |
| Santo Cristo | 86 km | 77 km |
| Tourinhos | 92 km | 68 km |
| Marco | 101 km | 58 km |

Guamaré fica mais perto de todas. Natal ficou pela ordem e porque a tábua de Natal usa 90 componentes harmônicas, contra 24 de Guamaré. Guamaré é estuário.

**Risco:** em 01/01/2026, Guamaré tem as marés de 37 a 72 minutos depois de Natal. Na praia, a diferença pode passar dos "alguns minutos" do aviso. Detalhes em `decisoes.md`.

## 4. Como atualizar em 2027

1. Quando a Marinha publicar a edição de 2027, baixar o PDF do Porto de Natal (em `assets.marinha.mil.br/chm/.../dados_de_mare/`) e salvar como `scripts/mares/fontes/natal-2027.pdf`.
2. Acrescentar a entrada de 2027 em `FONTES` no importador.
3. Copiar o bloco de conferência de `src/lib/mares/extrair-tabua.test.ts` para 2027, com 10 dias lidos do PDF, e rodar `npm test`.
4. Rodar `npx tsx scripts/mares/importar-tabua-marinha.ts --ano 2027 --dry-run` e depois sem `--dry-run`.

**Lembrete:** a tábua de 2026 acaba em 31/12/2026. A partir de 03/12/2026, o admin mostra o aviso de previsão faltando nos próximos 30 dias.

## 5. Verificação

Rodado em 27/09/2026 sobre o commit `dd1135e`:

| Verificação | Resultado |
|---|---|
| `npm run lint` | exit 0, 0 erros e 0 avisos |
| `npx tsc --noEmit` | exit 0, sem saída |
| `npm test` | 23 arquivos, 166 testes, todos passando |
| `npm run build` | exit 0, 762 páginas geradas |

Os testes novos cobrem:
- a extração, conferida em 17 dias do PDF;
- a cobertura dos 365 dias e a alternância entre alta e baixa;
- a curva;
- a lua, com os eclipses de 2026;
- a melhor janela;
- o fuso;
- a RLS (anon lê e não escreve), testada em PGlite com a migração real;
- a leitura com a tabela ausente;
- os metadados e o JSON-LD.

Os testes da extração e da RLS foram vistos falhando de propósito (valor trocado, RLS desligada) antes de serem aceitos.

**Build com produção:** a tabela ainda não existe, e as páginas saem com o estado vazio nos três idiomas (conferido com `next start`).

- Hash do merge e do deploy: a preencher.
- Deploy: a preencher.

## 6. URLs finais

- pt: https://www.vivegostoso.com.br/explore/mares
- en: https://www.vivegostoso.com.br/en/explore/mares
- es: https://www.vivegostoso.com.br/es/explore/mares
- Por praia: `/explore/mares/{cardeiro,xepa,maceio,santo-cristo,tourinhos,marco}`, com `/en` e `/es` na frente.

Sugestão para o post do Instagram: https://www.vivegostoso.com.br/explore/mares/cardeiro. É a praia em que a maré aparece mais na foto (piscinas naturais na baixa), e a página mostra o horário das piscinas do dia.
