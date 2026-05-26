# Spec — Marketplace de Profissionais (Spec 1 / 3)

**Data:** 2026-05-26  
**Status:** Aprovado pelo usuário, aguardando plano de implementação  
**Projeto:** Vive Gostoso — vivegostoso.com.br  

---

## Contexto e Problema

O Vive Gostoso é a infraestrutura digital de São Miguel do Gostoso — não apenas um guia turístico. Moradores usam a plataforma para encontrar serviços da cidade.

Hoje o `/contrate` é uma lista rudimentar de anúncios sem identidade real. Dois tipos de prestadores não têm espaço adequado:

1. **Empresas de serviço** como a Balaio Digital (agência de marketing remota, sem endereço físico em SMG) — estão cadastradas mas não aparecem em nenhum verbo.
2. **Profissionais autônomos** (coach, mentor, consultor, fotógrafo) — não existe modelo de entidade para pessoa física prestadora de serviço.

---

## Decisões de Design

| Questão | Decisão |
|---|---|
| Modelo de entidade para autônomos | Nova tabela `gostoso_professionals` (Pessoa, não Negócio) |
| Empresas de serviço (Balaio) | Permanecem em `gostoso_businesses` com campo `business_type='service_company'` |
| Onboarding | Fork no `/cadastre` existente: "negócio local" vs "profissional autônomo" |
| Profundidade do marketplace | Marketplace completo: perfis reais, portfólio, avaliações |
| Verbo na navegação | Um único "Contrate" com 3 abas internas: Empresas / Profissionais / Vagas |
| WhatsApp | `buildWhatsAppLink` com contexto obrigatório; números armazenados só como dígitos |

---

## Arquitetura

### 1. Banco de Dados

#### Nova tabela: `gostoso_professionals`

```sql
CREATE TABLE public.gostoso_professionals (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      uuid REFERENCES public.gostoso_profiles(id) ON DELETE CASCADE,
  display_name    text NOT NULL,
  headline        text NOT NULL,                    -- ex: "Coach executivo & mentor de líderes"
  bio             text,
  photo_url       text,
  category        text NOT NULL,                    -- Coach | Mentor | Consultor | Designer | Fotógrafo | Jurídico | Educação | Outro
  specialties     text[] DEFAULT '{}',              -- tags livres
  portfolio_items jsonb DEFAULT '[]',               -- [{title, description, image_url, url}]
  whatsapp        text,                             -- só dígitos: 5584999991111
  instagram       text,
  website         text,
  hourly_rate     integer,                          -- opcional, em centavos
  is_published    boolean DEFAULT false,
  rating_avg      numeric(3,2) DEFAULT 0,
  review_count    integer DEFAULT 0,
  slug            text UNIQUE NOT NULL,             -- gerado de display_name
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

**RLS:**
- `SELECT`: público, apenas `is_published = true`
- `INSERT/UPDATE/DELETE`: `profile_id = auth.uid()` OU role admin
- Admin: acesso total

#### Mudanças em tabelas existentes

```sql
-- Diferenciar negócios locais de empresas de serviço
ALTER TABLE public.gostoso_businesses
  ADD COLUMN business_type text DEFAULT 'local'
  CHECK (business_type IN ('local', 'service_company'));

-- Suporte a avaliações de profissionais
ALTER TABLE public.gostoso_reviews
  ADD COLUMN professional_id uuid REFERENCES public.gostoso_professionals(id) ON DELETE CASCADE;

-- Constraint: business_id OU professional_id, nunca ambos
ALTER TABLE public.gostoso_reviews
  ADD CONSTRAINT reviews_one_target CHECK (
    (business_id IS NOT NULL)::int + (professional_id IS NOT NULL)::int = 1
  );
```

---

### 2. Páginas e Rotas

#### `/contrate` — Listagem principal (redesenhada)

Três abas:

| Aba | Fonte de dados | Cards |
|---|---|---|
| **Empresas** | `gostoso_businesses` WHERE `business_type = 'service_company'` | Logo, nome, badge "Empresa", descrição, CTA WhatsApp dark |
| **Profissionais** | `gostoso_professionals` WHERE `is_published = true` | Avatar, nome, headline, tags, rating, CTA WhatsApp teal |
| **Vagas** | `gostoso_job_listings` (existente, sem mudança) | Igual hoje |

Filtros na aba Profissionais: categoria (Coach, Mentor, Consultor, Designer, Fotógrafo, Jurídico, Educação, Outro).

#### `/contrate/profissional/[slug]` — Perfil público do profissional

Seções:
- Hero: avatar, display_name, headline, localização, tags de especialidade
- Sobre: bio completo
- Portfólio: grid de itens com título, descrição, imagem e link externo (opcional)
- Avaliações: lista com estrelas, texto, autor e data; rating médio no topo
- CTA WhatsApp: botão fixo no rodapé com mensagem contextual

#### `/cadastre` — Fork inicial

Antes de entrar no fluxo, o usuário escolhe:
- **"Tenho um negócio local"** → fluxo existente (sem mudança)
- **"Sou profissional autônomo"** → novo fluxo de criação de `gostoso_professionals`

#### `/cadastre/profissional` — Painel do profissional autônomo

Sidebar com abas:
- **Meu perfil:** display_name, headline, bio, photo_url, category, specialties (tags clicáveis), whatsapp, instagram, website, hourly_rate
- **Portfólio:** adicionar/remover/reordenar portfolio_items
- **Avaliações:** read-only, lista de reviews recebidas
- **Visibilidade:** toggle is_published + link para preview do perfil público

---

### 3. WhatsApp Inteligente

**Regra geral:** `buildWhatsAppLink` de `src/lib/whatsapp.ts` é a ÚNICA forma de gerar links WhatsApp em toda a plataforma. Nunca construir URL manualmente.

**Armazenamento:** campo `whatsapp` salvo sempre como só dígitos. Formato: `55` + DDD (2 dígitos) + número (8-9 dígitos) = 12-13 caracteres. Input com validação e máscara no front.

**Assinatura atualizada:**

```ts
buildWhatsAppLink(
  phone: string,
  context: {
    source: 
      | 'professional_profile'   // página /contrate/profissional/[slug]
      | 'professional_card'      // card na listagem /contrate
      | 'service_company_card'   // card de empresa na aba Empresas
      | 'business_page'          // página /negocio/[slug] (existente)
      | 'business_card'          // card em categoria (existente)
    name: string          // nome do profissional ou negócio
    specialty?: string    // especialidade principal (profissionais)
    service?: string      // serviço (negócios)
  }
): string
```

**Mensagens por contexto:**

| `source` | Mensagem |
|---|---|
| `professional_profile` | `"Olá [name]! Vi seu perfil no Vive Gostoso e tenho interesse na sua [specialty]. Pode me contar mais?"` |
| `professional_card` | `"Olá [name]! Vi você no Vive Gostoso (seção Contrate) e gostaria de conversar sobre seus serviços."` |
| `service_company_card` | `"Olá [name]! Vi vocês na seção Contrate do Vive Gostoso e gostaria de um orçamento."` |
| `business_page` | `"Olá [name]! Vi vocês no Vive Gostoso e gostaria de conversar."` |
| `business_card` | `"Olá [name]! Vi o [name] no Vive Gostoso e tenho interesse."` |

---

### 4. Admin

#### Nova página: `/cadastre/admin/profissionais`

Segue o padrão do `/cadastre/admin/negocios` existente:
- Tabela com todos os profissionais (publicados e pendentes)
- Ações: aprovar (setar `is_published = true`), rejeitar, editar, deletar
- Filtro por categoria e status

#### Mudanças em páginas admin existentes

- `/cadastre/admin/negocios`: badge visual distinguindo `business_type = 'service_company'` (label "Empresa de Serviço")
- `/cadastre/admin/avaliacoes`: suporte a `professional_id` além de `business_id` — label identifica o alvo da avaliação

---

## Fora do Escopo (Spec 1)

- Booking ou agendamento online (profissional + cliente combinam via WhatsApp)
- Pagamento entre cliente e profissional
- Chat interno na plataforma
- Verificação de documentos ou certificações
- Busca por nome de profissional (filtro por categoria é suficiente no MVP)
- Homepage redesign com verb cards e banners de categoria → **Spec 2**
- WhatsApp para contextos além dos listados acima (e.g., eventos, blog) → coberto no Spec 2
- Migração dos dados de `gostoso_service_listings` existentes → a tabela atual será depreciada; anúncios existentes serão convertidos manualmente ou descartados (volume baixo, sem dados críticos)

---

## Fluxo de Dados — Profissional autônomo

```
1. Usuário acessa /cadastre
2. Escolhe "Sou profissional autônomo"
3. Preenche display_name, headline, category, whatsapp
4. is_published = false (aguarda aprovação admin — mesmo padrão dos negócios)
5. Admin aprova em /cadastre/admin/profissionais
6. Perfil aparece em /contrate aba Profissionais
7. Visitante clica "Chamar no WhatsApp" → mensagem contextual gerada → abre WhatsApp
8. Visitante deixa avaliação após contato (fluxo de reviews existente adaptado)
```

---

## Ordem de Implementação Sugerida

1. Migration: criar `gostoso_professionals` + alterações nas tabelas existentes
2. `buildWhatsAppLink` com contexto + validação de número
3. `/cadastre` fork (tela de escolha)
4. `/cadastre/profissional` painel de edição
5. `/contrate` redesenhado com 3 abas
6. `/contrate/profissional/[slug]` perfil público
7. `/cadastre/admin/profissionais`
8. Atualizar todos os botões WhatsApp existentes para usar contexto
