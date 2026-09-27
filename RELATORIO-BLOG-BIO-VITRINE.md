# Relatório: post da tábua de marés, /bio e vitrine (27/09/2026)

Ordem do Victor, Parte A. Branch `feat/blog-bio-vitrine`, saída de `origin/dev` (`8c521d4`). Push, PRs, deploy e gravação no banco ficaram com o Victor.

## 1. Post do blog

- SQL: `scripts/blog/2026-09-27-tabua-de-mares.sql`.
  - Parte 1: grava as três versões com `is_published = false`, `where not exists`, autor "Vive Gostoso", data 27/09/2026. Não toca em nenhum post existente.
  - Parte 2 (comentada): publica só os três slugs. Rodar depois do deploy READY na master.
- Capa: `https://www.vivegostoso.com.br/api/og/blog-mares?lang=pt` (e `es`, `en`), servida pelo site. Sem upload no Storage.
- URLs depois de publicado:
  - https://www.vivegostoso.com.br/blog/tabua-de-mares-sao-miguel-do-gostoso
  - https://www.vivegostoso.com.br/es/blog/tabla-de-mareas-sao-miguel-do-gostoso
  - https://www.vivegostoso.com.br/en/blog/tide-table-sao-miguel-do-gostoso
- `hreflang` liga as três; o slug aberto no idioma errado redireciona (308) para o certo. JSON-LD BlogPosting com `inLanguage` do idioma.
- Links trocados: o do Cajueiro Boulevard (`/explore/mapa` não o mostra) foi para `https://www.cajuparadise.com.br/pt` (es e en: `/es`, `/en`). Gostosense conferida: 308 para `/pt/turismo/perobas-de-buggy`, 200. Link mantido.

## 2. Links cruzados

"Leia o guia" em `/explore/mares`, `/explore/mares/cardeiro`, `/explore/mares/perobas` e no `/explore`; link secundário no cartão das marés da vitrine; cartão Blog da /bio. Todos só aparecem com o post publicado (consulta com cache de 1 h).

## 3. /bio e vitrine

- /bio: marca, linha do que é o site, maré de hoje do Cardeiro (próxima baixa e alta) com o botão da tábua, sete cartões (mapa, comer, ficar, passeios, eventos, blog, cadastre), contato da etiqueta, rodapé com idioma e privacidade. UTM em todo link interno, `noindex`, fora do sitemap, alvos de 48 px.
- Vitrine: frase com número lido do banco (48 restaurantes, 76 pousadas, 33 passeios em 27/09), botão com seta no pé, cartão todo clicável, foco visível, setas e bolinhas no celular, foto ou ícone preenchendo.

Prints no celular (390 px), em `docs/prints/2026-09-27/`: `bio-390-pt.png`, `bio-390-es.png`, `bio-390-en.png`, `home-390-pt.png`, `home-390-es.png`, `home-390-en.png`.

## 4. Verificações

| Comando | Resultado |
|---|---|
| `npm run lint` | exit 0, sem avisos |
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | 37 arquivos, 282 testes, todos passando |
| `npm run build` | exit 0, 795 páginas geradas |

- `next start` local: as três URLs do post dão 404 (página "Página não encontrada", com `noindex`) antes do post existir; `/es/blog/tabua-de-mares-sao-miguel-do-gostoso` redireciona 308 para o slug es; `/bio`, `/es/bio`, `/en/bio`, `/` e `/api/og/blog-mares?lang=es` dão 200; post antigo (`/blog/como-chegar-sao-miguel-do-gostoso`) segue 200.
- Post depois de gravado: não verificado (o banco de produção não foi alterado). Coberto por teste: SQL, links por idioma e JSON-LD válido.
- Links quebrados nas páginas novas (`broken-links`): pendente para o ar.

## 5. Merge e deploy

- Hash do merge: a preencher.
- Deploy: a preencher.

## 6. Pendências

- Aplicar o SQL (parte 1 a qualquer hora, parte 2 depois do deploy READY) e conferir as três URLs no ar.
- Título e descrição da /bio continuam "Contato"; vale trocar agora que ela é o link do Instagram.
- As chaves antigas da /bio (`caption`, `save_hint`, `call`, `business_*`, `*_sub`) ficaram sem uso.
- remove-ai-marks: serviço da skill fora do ar; ver decisoes.md.
- Horário no formato "23h42" também em en, como no resto da tábua.
