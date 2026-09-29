# Linha de base: linha-de-base

Base: https://www.vivegostoso.com.br
Coletado em: 2026-09-29T02:10:42.366Z

## Rotas

790 rotas. Por status: 200: 773, 307: 8, 308: 4, 404: 5.
Tempo de resposta mediano das paginas HTML (fetch sem cache do cliente, concorrencia 6): 363 ms.

| status | cache-control | cache | rotas |
|---|---|---|---|
| 200 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | 765 |
| 307 | public, max-age=0, must-revalidate | - | 7 |
| 404 | private, no-cache, no-store, max-age=0, must-revalidate | MISS | 5 |
| 308 | public, max-age=0, must-revalidate | - | 4 |
| 200 | public, max-age=0, must-revalidate | HIT | 3 |
| 200 | public, max-age=0, must-revalidate | MISS | 3 |
| 200 | public, max-age=3600, s-maxage=86400 | HIT | 1 |
| 200 | public, max-age=0, must-revalidate | PRERENDER | 1 |
| 307 | public, max-age=0, must-revalidate | MISS | 1 |

## Fumaca (Playwright)

Passou: 26. Falhou: 0. Instavel (passou na segunda tentativa): 0. Pulado: 0.

- ok: rastreio > home carrega o gtag, manda consent default e o page_view do GA4
- ok: rastreio > aceitar cookies manda consent update
- ok: rastreio > navegacao no cliente manda outro page_view (PageViewTracker)
- ok: cabecalho, menu e idioma > menu do desktop leva aos modulos
- ok: cabecalho, menu e idioma > menu do celular abre a gaveta com os links
- ok: cabecalho, menu e idioma > troca de idioma: /en e /es servem o idioma certo no HTML
- ok: cabecalho, menu e idioma > seletor de idioma leva a /en
- ok: cabecalho, menu e idioma > busca abre e acha negocio
- ok: cabecalho, menu e idioma > tema escuro alterna
- ok: WhatsApp > botao oficial do cabecalho: numero certo, mensagem e evento whatsapp_click
- ok: WhatsApp > pagina de negocio: link de WhatsApp e evento contato_negocio_click
- ok: listas, filtros e mapa > /come lista negocios no HTML servido
- ok: listas, filtros e mapa > /fique lista negocios no HTML servido
- ok: listas, filtros e mapa > /passeie lista negocios no HTML servido
- ok: listas, filtros e mapa > filtro de /come muda a lista
- ok: listas, filtros e mapa > mapa Mapbox desenha e a lista de pontos existe
- ok: listas, filtros e mapa > explore e mares mostram a tabua
- ok: home > vitrine com numeros e setas no celular
- ok: formularios (envio interceptado) > transfer: validacao e payload do cadastro
- ok: formularios (envio interceptado) > participe: formulario de evento envia payload certo (interceptado)
- ok: formularios (envio interceptado) > contrate: formulario de servico valida campos obrigatorios
- ok: apoie e checkout > doacao chega ate o Stripe com o valor certo (interceptado)
- ok: area restrita > /cadastre mostra a tela de login, sem credencial
- ok: area restrita > /cadastre/admin sem sessao nao mostra o painel
- ok: blog e bio > blog lista posts e o post abre com JSON-LD
- ok: blog e bio > /bio: noindex e UTM em todo link interno

