# Relatório: vitrine na home, Explore e mapa (27/09/2026)

Branch `feat/vitrine-explore-mapa`, saída de `origin/dev` (`81f8503`). Nada foi para produção: push, PR e deploy ficam com o Victor. Não precisou de migração nem de escrita no Supabase.

## 1. O que mudou e onde

| Parte | Onde |
|---|---|
| Vitrine de recursos na home (11 cartões, marés em destaque com a maré de hoje do Cardeiro) | `src/components/home/vitrine.tsx`, `src/lib/explore/vitrine.ts`, `app/[lang]/page.tsx`, `src/views/Home.tsx` |
| Maré de hoje fora da página de marés (mesmo cache de 1 h) | `src/components/explore/mare-de-hoje.tsx` |
| `/explore` refeito como índice | `app/[lang]/explore/page.tsx` |
| Mapa movido para `/explore/mapa`, com pontos, filtro e lista em HTML | `app/[lang]/explore/mapa/page.tsx`, `src/views/Explore.tsx`, `src/components/map/explore-map.tsx` |
| Pontos do mapa (arquivo único) | `src/data/pontos-mapa.ts` |
| Trilha visível | `src/components/explore/trilha.tsx` |
| JSON-LD da vitrine, do Explore e do mapa | `src/lib/explore/seo-explore.ts` |
| Dataset na tábua de marés | `src/lib/mares/seo-mares.ts` |
| WebSite sem SearchAction; módulos do TouristDestination | `src/lib/seo.ts` |
| Rota `mapa` e imagem OG por rota | `src/lib/page-metadata.ts`, `app/api/og/[rota]/route.tsx` |
| Link para a maré nas praias citadas nos posts | `src/lib/explore/praias-citadas.ts`, `src/views/BlogPost.tsx` |
| Menu (Explore, Mapa, Marés) | `src/components/layout/header.tsx` (rodapé já tinha Marés) |
| Sitemap | `scripts/paginas-sitemap.mjs`, `scripts/generate-sitemap.mjs`, `scripts/mares-slugs.mjs` |
| CSP para tiles do Mapbox | `proxy.ts` |
| Textos pt, en, es | `src/locales/{pt,en,es}.json` (`vitrine`, `explore_indice`, `mapa`, `blog_mares`, `meta.*`, `nav.*`) |
| Validador local de JSON-LD | `src/lib/explore/validar-json-ld.ts` |

A grade de verbos da home saiu: a vitrine leva aos mesmos lugares. Motivo em `decisoes.md`.

## 2. Pontos do mapa

**Entraram (13):**

| Ponto | Categoria | Município | Fonte |
|---|---|---|---|
| Praia da Xêpa | praias | São Miguel do Gostoso | OSM relation 2115892 |
| Praia do Cardeiro | praias | São Miguel do Gostoso | OSM relation 2115893 |
| Praia do Maceió | praias | São Miguel do Gostoso | OSM relation 2115894 |
| Praia do Santo Cristo | praias | São Miguel do Gostoso | OSM relation 2115895 |
| Praia de Tourinhos | praias | São Miguel do Gostoso | OSM node 11643248075 |
| Praia de Perobas | praias | Touros | OSM node 7008783807 |
| Praia de Carnaubinha | praias | Touros | OSM node 7008783806 |
| Praia do Farol do Calcanhar | praias | Touros | Wikipédia e OSM node 1181442129 |
| Praia do Cajueiro | praias | Touros | OSM way 634307639 |
| Praia do Marco | praias | Pedra Grande | OSM node 13535219738 |
| Pitaya Exclusive Residence | hospedagem e empreendimentos | São Miguel do Gostoso | página oficial pitayaexclusive.com.br (link do Google Maps) |
| Vila Galé Touros | hospedagem e empreendimentos | Touros | OSM way 565827692 |
| Farol do Calcanhar | pontos históricos | Touros | OSM node 1181442129 e Wikipédia |

Cada praia leva para a maré dela.

**Ficaram fora:**
- Caju Paradise e Cajueiro Boulevard: a página oficial só dá o endereço (BR-101 Km 3, Touros), e o OSM não tem nenhum dos dois. Tirar coordenada de um endereço seria geocodificar. Para entrarem, basta uma coordenada publicada pelo próprio empreendimento (um link do Google Maps no site, por exemplo) ou um registro no OSM.
- Marco Colonial de Touros (Marco Zero): a Wikipédia põe o marco na Praia do Marco, na divisa entre Gostoso e Pedra Grande, mas não dá coordenada, e o OSM não tem o marco. O "Marco Zero BR 101" do OSM é o marco da rodovia, em Touros, e não foi usado. A Praia do Marco está no mapa.
- Praias da tábua sem coordenada: Minhoto, Praia do Amor, Zé Martins e Malhada.

Consultas: Overpass por caixa geográfica, com User-Agent `vive-gostoso-mapa/1.0` e sem e-mail; Wikipédia pela API; páginas oficiais por GET. O Nominatim não foi usado.

## 3. Palavras-chave por página

| Página | Título (pt) | Busca principal |
|---|---|---|
| Home | São Miguel do Gostoso: o que fazer, onde comer e ficar | o que fazer em São Miguel do Gostoso |
| `/explore` | O que fazer em São Miguel do Gostoso: praias e marés | o que fazer em São Miguel do Gostoso, praias de São Miguel do Gostoso |
| `/explore/mapa` | Mapa de São Miguel do Gostoso, praias e região | mapa São Miguel do Gostoso |
| `/explore/mares` | Tábua de marés de São Miguel do Gostoso: maré hoje | tábua de marés São Miguel do Gostoso, maré hoje Gostoso |

H1: home sem mudança; Explore "O que fazer em São Miguel do Gostoso"; mapa "Mapa de São Miguel do Gostoso e região"; marés igual ao título. Os títulos têm até 60 caracteres e as descrições de 140 a 160, nos três idiomas, e há teste para isso.

## 4. Verificações

Rodado em 27/09/2026 sobre o commit `1a72667`:

| Verificação | Resultado |
|---|---|
| `npm run lint` | exit 0, sem saída |
| `npx tsc --noEmit` | exit 0, sem saída |
| `npm test` | 30 arquivos, 229 testes, todos passando |
| `npm run build` | exit 0, 789 páginas geradas; sitemap com 753 URLs |

- Testes novos cobrem: a vitrine lista todas as abas (conferido contra as pastas de `app/[lang]`); os pontos (coordenada válida na região, fonte preenchida, praia sem coordenada fora); o JSON-LD de cada tipo (ItemList, CollectionPage, BreadcrumbList, Beach, TouristAttraction, Place, Dataset, WebSite); o sitemap com `/explore`, `/explore/mapa` e `/explore/mares` em 0.95; as praias citadas nos posts.
- Os testes foram vistos falhando antes de passar. Também falharam de propósito, com uma latitude de sinal trocado, uma fonte vazia e a prioridade das marés baixada. O validador reprova tipo inventado, lista fora de ordem, coordenada fora do intervalo e Dataset sem autor.
- HTML servido (`next start`, Supabase de produção): `/`, `/en`, `/explore`, `/es/explore`, `/explore/mapa` e `/explore/mares` responderam 200. A home traz "Veja a maré de hoje em 14 praias" e as 4 marés do Cardeiro no HTML. O JSON-LD servido foi extraído e validado: home com WebSite, TouristDestination e ItemList; Explore com CollectionPage, BreadcrumbList e ItemList; mapa com BreadcrumbList e ItemList; marés com WebPage, Dataset e BreadcrumbList. `/api/og/home` e `/api/og/explore` respondem image/png.
- Conferido no navegador: no celular (375 px), a vitrine rola na horizontal e a página não. No desktop, os tiles do Mapbox carregam com a CSP nova e aparecem os filtros e os pontos.
- Links nos posts: não verificado com post real. O código liga a praia quando o nome aparece no título ou no conteúdo.

- Hash do merge: a preencher.
- Deploy: a preencher.

## 5. Pendências

- Caju Paradise, Cajueiro Boulevard e o Marco Colonial de Touros precisam de coordenada de fonte confiável para entrar no mapa (ver item 2).
- Quem tinha `/explore` salvo como mapa agora cai no índice, que tem o link para o mapa. Não há redirecionamento, porque `/explore` continua existindo.
- As chaves `home.verbs_*` ficaram sem uso nos três idiomas.
- O `revalidate` das páginas segue sem efeito por causa do nonce de CSP. Quem segura a leitura por 1 h é o cache de dados.
- As imagens OG novas usam a fonte padrão do `next/og`, como o card das praias. Continua pendente trocar pelos recortes de Fraunces e Jakarta.
- O texto do cartão da Pitaya ("a cerca de 500 m da praia") vem da página oficial. Vale o Victor confirmar se quer o empreendimento como ponto do mapa.
