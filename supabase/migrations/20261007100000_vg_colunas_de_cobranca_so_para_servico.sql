-- Colunas de cobranca de `gostoso_businesses` so para o servico.
--
-- O papel `authenticated` passa a ter SELECT na mesma lista de colunas do `anon`
-- (migracao 20260919200324), que espelha `src/lib/supabase/business-columns.ts`.
-- As duas colunas `stripe_*` ficam so para a service role, usada pela Edge
-- Function de pagamento (ela ignora grant e RLS).
--
-- Nenhuma leitura do site usa essas colunas. Nao ha DROP de coluna nem mudanca
-- de politica. Coluna nova na tabela precisa de grant explicito para
-- `authenticated` e `anon`.
--
-- REVERSAO (rodar para desfazer):
--   grant select on table public.gostoso_businesses to authenticated;

revoke select on table public.gostoso_businesses from authenticated;

grant select (
  id, name, slug, description, category_id, profile_id, address, lat, lng, phone, whatsapp,
  website, instagram, cover_url, photos, imagens_licenciadas, opening_hours, is_verified,
  is_featured, plan, active, display_order, created_at, updated_at, price_range, menu_url,
  amenities, is_published, business_type, services, plan_expires_at
) on table public.gostoso_businesses to authenticated;
