# Vive Gostoso

A infraestrutura digital de São Miguel do Gostoso, RN.

**vivegostoso.com.br** — diretório de negócios, eventos, mapa interativo e fundo público transparente da cidade.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilo | Tailwind CSS v4 |
| Dados | Supabase (PostgreSQL + Auth + Storage) |
| Mapa | Mapbox GL JS via react-map-gl |
| Deploy | Vercel |

## Setup

### 1. Variáveis de ambiente

Criar `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_MAPBOX_TOKEN=<mapbox-public-token>
```

### 2. Instalar e rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção
npm run preview    # preview do build local
```

## Estrutura de pastas

```
src/
├── components/
│   ├── brand/          # Logo, VerbPill
│   ├── business/       # BusinessCard, BusinessFilters, BusinessGrid
│   ├── events/         # EventCard
│   ├── fund/           # FundHero, FundEntryRow
│   ├── home/           # Hoje (widget "Agora em Gostoso")
│   ├── layout/         # Header, Footer, PageWrapper
│   ├── map/            # ExploreMap (Mapbox stub → real)
│   └── ui/             # Badge, Button
├── hooks/              # useBusinesses, useEvents, useFund, useCategories
├── lib/                # supabase client, utils
├── pages/
│   ├── Home.tsx
│   ├── Come.tsx        # /come — restaurantes
│   ├── Fique.tsx       # /fique — hospedagem
│   ├── Passeie.tsx     # /passeie — passeios e esportes
│   ├── Explore.tsx     # /explore — mapa interativo
│   ├── Participe.tsx   # /participe — eventos
│   ├── Conheca.tsx     # /conheca — editorial da cidade
│   ├── Apoie.tsx       # /apoie — fundo público
│   ├── Negocio.tsx     # /negocio/:slug — perfil do negócio
│   ├── NotFound.tsx    # /* — 404 on-brand
│   └── cadastre/       # /cadastre — painel do prestador
│       ├── Login.tsx   # Magic Link auth
│       ├── Painel.tsx
│       ├── Perfil.tsx
│       └── Preview.tsx
└── types/              # Tipos TypeScript
```

## Banco de dados (Supabase)

Tabelas no schema `public`:

| Tabela | Conteúdo |
|--------|---------|
| `gostoso_businesses` | Negócios (nome, slug, categoria, contato, horários, lat/lng, fotos) |
| `gostoso_categories` | Categorias com verb (`come`, `fique`, `passeie`) |
| `gostoso_events` | Eventos e festivais |
| `gostoso_fund_entries` | Movimentações do fundo público |
| `gostoso_profiles` | Perfis de prestadores e admins |

RLS habilitado em todas as tabelas. Autenticação via Supabase Magic Link (OTP).

## Módulos — o sistema verbal

| Rota | Verbo | Conteúdo |
|------|-------|---------|
| `/come` | COME. | Restaurantes e gastronomia |
| `/fique` | FIQUE. | Pousadas e hospedagem |
| `/passeie` | PASSEIE. | Passeios, kite, buggy, esportes |
| `/explore` | EXPLORE. | Mapa interativo (Mapbox GL JS) |
| `/participe` | PARTICIPE. | Calendário de eventos |
| `/conheca` | CONHEÇA. | Editorial: praias, como chegar, melhor época |
| `/apoie` | APOIE. | Fundo público transparente |
| `/cadastre` | CADASTRE. | Painel do prestador |

## Deploy

O projeto faz deploy automático via Vercel ao fazer push para `main`.

O `vercel.json` na raiz configura o SPA rewrite necessário para o React Router:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Identidade visual

- **Fontes:** Fraunces (display, verbos) + Plus Jakarta Sans (interface)
- **Teal Atlântico** `#0D7C7C` — cor primária
- **Ocre Nordestino** `#C97D2A` — cor secundária
- **Coral Barco** `#E05A3A` — accent/CTA
- **Areia Quente** `#F5F2EE` — fundo (nunca branco puro)

## Sobre o projeto

**Vive Gostoso** é a infraestrutura digital de São Miguel do Gostoso, RN — cidade de ~10.600 habitantes, 250+ meios de hospedagem, sede do Réveillon mais famoso do Rio Grande do Norte.

A plataforma é da cidade. 80% da arrecadação vai para o Fundo Público de Marketing da Cidade, auditável publicamente. 20% cobre operação técnica. Zero lucro.

Desenvolvido e mantido por [Balaio Digital](https://balaio.net) · Victor Hugo Lima  
Morador permanente de Gostoso desde 2025
