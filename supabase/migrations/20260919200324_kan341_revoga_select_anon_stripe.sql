-- KAN-341 (VGO-03): nega ao papel `anon` a leitura das colunas de cobranca do
-- Stripe em `gostoso_businesses`.
--
-- Medido antes: `role_table_grants` mostrava `anon:SELECT` de TABELA em
-- `gostoso_businesses`. Como o grant era de tabela, a chave anonima publica
-- (que vai no bundle do site) lia `stripe_customer_id` e
-- `stripe_subscription_id` de todo negocio ativo.
--
-- Medido depois: `has_column_privilege('anon','public.gostoso_businesses',
-- 'stripe_customer_id','SELECT')` = false para as duas colunas, e `name`/`slug`
-- seguem legiveis.
--
-- O grant de tabela precisa cair junto: revogar so a coluna, mantendo o grant
-- de tabela, nao tem efeito. A allowlist abaixo repete todas as colunas menos
-- as duas `stripe_*`, e ESPELHA `src/lib/supabase/business-columns.ts` -- as
-- leituras publicas nomeiam colunas justamente por causa desta allowlist.
--
-- NAO ha DROP COLUMN aqui, de proposito: as colunas seguem existindo para a
-- edge function `create-checkout-session`, que le e escreve
-- `stripe_customer_id` com a service role (bypassa RLS e grant de coluna).

revoke select on table public.gostoso_businesses from anon;

grant select (
  id, name, slug, description, category_id, profile_id, address, lat, lng, phone, whatsapp,
  website, instagram, cover_url, photos, imagens_licenciadas, opening_hours, is_verified,
  is_featured, plan, active, display_order, created_at, updated_at, price_range, menu_url,
  amenities, is_published, business_type, services, plan_expires_at
) on table public.gostoso_businesses to anon;
