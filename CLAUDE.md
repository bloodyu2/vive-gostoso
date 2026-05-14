# CLAUDE.md — Vive Gostoso

> O CLAUDE.md principal com toda a documentação do projeto está em `../CLAUDE.md`
> (carregado automaticamente pelo Claude Code quando você abre a pasta `gostoso/`).
> Este arquivo existe dentro do repo git para versionar regras críticas e o estado atual.

---

## IDENTIFICAÇÃO

- **Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Supabase, TanStack Query v5, Stripe, Mapbox, PWA
- **Supabase project:** `wppsmvgbagalczoardfl`
- **Prefixo de tabelas:** `gostoso_*`
- **Instagram:** `@vivegostoso`
- **Domínio:** `vivegostoso.com.br`
- **Deploy:** Vercel — `prj_3yXMgm98eol49odpyhWxyKuSeZq2`, team `team_kDTAxnxOZafvxlReYHY3cFwv`
- **Repo:** https://github.com/bloodyu2/vive-gostoso
- **Branch ativa:** `feature/design-system-pwa` (PR pendente → `main`)

---

## REGRAS DE DESENVOLVIMENTO

### WhatsApp — regra permanente
Sempre usar `buildWhatsAppLink` de `src/lib/whatsapp.ts`.
Formato: `wa.me/55DDDNUMERO?text=...` — nunca construir URLs manualmente.

### i18n
Roteamento por URL: `/en/...`, `/es/...`. Usar hook `useLocalePath` para links internos.
`hreflang` configurado em todas as páginas públicas.

### Pagamentos — Stripe
- Aceita: cartão e boleto
- **PIX removido** — não ativado na conta Stripe
- Plano mensal e anual (10% off como pagamento único de 12 meses)
- Doações avulsas no módulo Apoie

---

## ESTADO ATUAL

### Features implementadas
- Todos os módulos Fase 0: COME, FIQUE, PASSEIE, EXPLORE, PARTICIPE, CONHEÇA, APOIE, CONTRATE
- **TRANSFER:** `/transfer` com listagem de prestadores, detail modal, admin panel (moderação + stats)
- **i18n completo:** PT/EN/ES com roteamento por URL e `hreflang`
- **Planos associados:** mensal, anual, doações avulsas via Stripe
- **PWA:** manifest + service worker + ícones `teal-V`
- **Design system tokens:** `@theme` em `styles/globals.css`
- **Sitemap:** auto-gerado via script prebuild
- **OG/social preview:** por página

### Negócios
- **Pizzaria Trilha do Vento:** desativada (`active = false`) — estabelecimento fechado
- Slug único garantido + UX de rascunho + badge de drafts no admin

### Outreach
~45 negócios contatados de 151 não reivindicados (em andamento)

### PR pendente
Branch `feature/design-system-pwa` → `main`

---

## TABELAS DO BANCO

```
gostoso_businesses      -- negócios (nome, slug, categoria, cover_url, photos[], coords, whatsapp, is_featured, is_active)
gostoso_categories      -- categorias e subcategorias
gostoso_events          -- calendário de eventos
gostoso_fund_entries    -- movimentações do fundo público (income/expense)
gostoso_profiles        -- admins e prestadores (auth_user_id, role, business_id)
gostoso_service_listings -- serviços de freelancers (RLS: insert só com is_active=false)
gostoso_job_listings    -- vagas de emprego (mesma política RLS)
```

---

## PADRÕES DE IMPLEMENTAÇÃO

### Layout
- Padding horizontal: `px-5 md:px-8` — NUNCA `px-8` sozinho (quebra mobile)
- Max width: `max-w-6xl mx-auto`
- Padding de seção: `py-10 md:py-16`

### TypeScript
- Build de produção via Vercel (funciona normal)
- Verificação local: `npx tsc --noEmit` (Vite build quebra no Windows por binário rolldown)

### Formulários (CONTRATE)
- Mobile: bottom-sheet (fixed inset-0, slide up)
- sm+: modal centralizado
- Insert sempre com `is_active: false` — admin aprova manualmente

---

## Migrações Supabase

Toda migration que criar uma tabela nova no schema `public` **deve** incluir grants explícitos. Sem isso o supabase-js retorna erro 42501 após outubro de 2026.

Template obrigatório:

```sql
-- Grant obrigatório: novas tabelas não são mais expostas automaticamente
grant select on public.<tabela> to anon;
grant select, insert, update, delete on public.<tabela> to authenticated;
grant all on public.<tabela> to service_role;
```

Ajuste os grants conforme necessidade (ex: tabelas internas podem não precisar de `anon`).

---

## Security Model

Resumo dos controles de segurança aplicados (auditorias 2026-05). Estado consolidado nas migrations `20260514_security_audit_2026_05.sql` e `20260514_security_hardening_followup.sql`.

### Trigger anti-elevation em `gostoso_profiles`
`trg_gostoso_guard_profile_update` e `trg_gostoso_guard_profile_insert` (functions `gostoso_guard_profile_*`, `SECURITY DEFINER`, `search_path = public`) bloqueiam mudança de `role` e `auth_user_id` por usuários não-admin. Insert força `role = 'prestador'`. Admin pode sobrescrever.

### Trigger anti-elevation em `gostoso_businesses`
`trg_gostoso_guard_business_*` impedem que owners autoelevem `plan`, `is_featured`, `is_verified`, `display_order`, `stripe_*` ou `plan_expires_at`. Insert força esses campos a defaults seguros (`free`, `false`, `0`, `null`). Apenas admin pode mudar.

### Allow-list de origens nas Edge Functions Stripe
`supabase/functions/create-checkout-session/index.ts` e `create-donation-session/index.ts` validam o header `Origin` contra uma lista fixa (`vivegostoso.com.br`, `www.vivegostoso.com.br` + previews Vercel). Bloqueia chamadas cross-origin de domínios externos.

### Headers de segurança em `vercel.json`
HSTS (2 anos + preload), X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy restritiva, CSP com allow-list explícita por diretiva (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`). CSP envia relatórios de violação para `/api/csp-report` (Vercel function que loga em runtime logs).

### `gostoso_is_admin()` SECURITY DEFINER
Função utilitária (linguagem `sql`, `SECURITY DEFINER`, `search_path = public`) que retorna `true` quando o `auth.uid()` corrente é admin. Existe para evitar recursão infinita em policies RLS de `gostoso_profiles` (que de outra forma teriam que consultar a própria tabela). EXECUTE revogado de `anon`/`public`; apenas `authenticated` chama. Todas as policies `cmd=ALL` que a invocam têm `to authenticated` explícito para não falhar com 42501 em queries anônimas.

### Política de senha
Frontend exige mínimo de 8 caracteres em todos os formulários de signup e reset (`Login.tsx`, `Claim.tsx`, `ResetarSenha.tsx`). Backend Supabase Auth deve ter "Check passwords against HaveIBeenPwned" habilitado no Dashboard (Authentication → Providers → Email).

### Storage
Buckets `business-photos` e `gostoso` são `public=true` (URLs diretas via CDN sem RLS). Policies SELECT amplas removidas para mitigar advisor `0025_public_bucket_allows_listing`. Uploads validam ownership via `storage.foldername(name)[1]` casado com `gostoso_businesses.id`. Limite de 5 MB e mime types `image/{jpeg,png,webp}` (+`svg+xml` no bucket gostoso).
