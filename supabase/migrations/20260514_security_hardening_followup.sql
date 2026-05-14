-- ============================================================================
-- Security audit followup 2026-05 — RLS hardening (parte 2)
-- ----------------------------------------------------------------------------
-- 1. Split gostoso_profiles "own profile" FOR ALL em SELECT + UPDATE
--    (remove DELETE/INSERT do próprio user — perfil é permanente).
-- 2. Drop defensivo de "business owner update" (já removido pelo audit anterior).
-- 3. REVOKE EXECUTE em gostoso_is_admin() de anon (mantém authenticated).
-- 4. Tighten storage public buckets: remove policies SELECT amplas para anon
--    em buckets PUBLIC. Buckets public continuam servindo via URL direta
--    (CDN), mas listagem indiscriminada via API agora bloqueada.
-- ============================================================================

-- ── 1. gostoso_profiles: split "own profile" FOR ALL ───────────────────────
-- Antes: política única FOR ALL permite SELECT/INSERT/UPDATE/DELETE pelo dono.
-- Depois: apenas SELECT (ler próprio perfil) e UPDATE (editar campos não
-- protegidos pelo trigger anti-elevation). DELETE e INSERT bloqueados —
-- INSERT do perfil deve passar por trigger de signup ou admin; DELETE
-- nunca deve ser feito pelo usuário (perfil é histórico permanente).
drop policy if exists "own profile" on public.gostoso_profiles;

create policy "own profile select"
  on public.gostoso_profiles for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "own profile update"
  on public.gostoso_profiles for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ── 2. Drop defensivo "business owner update" ──────────────────────────────
-- Já removida no audit anterior (substituída por "owner write businesses"
-- + trigger anti-elevation), mas adicionamos drop defensivo idempotente.
drop policy if exists "business owner update" on public.gostoso_businesses;

-- ── 3. gostoso_is_admin: revoke execute from anon ──────────────────────────
-- Função SECURITY DEFINER usada para checar role admin em RLS. Não faz
-- sentido expor para anon (chamada via /rpc/gostoso_is_admin sempre
-- retornaria false porque auth.uid() é null, mas eliminar superfície
-- de ataque é a postura correta).
--
-- IMPORTANTE: junto com este REVOKE, todas as policies que chamam
-- gostoso_is_admin() (ou subqueries equivalentes em gostoso_profiles)
-- devem ter `to authenticated` explícito — caso contrário, qualquer
-- SELECT vindo de anon avalia a policy admin e quebra com 42501.
-- Ver bloco 5 abaixo para o fix correspondente.
revoke execute on function public.gostoso_is_admin() from anon, public;

-- ── 4. Storage: bloquear LIST em buckets public ────────────────────────────
-- Os buckets `business-photos` e `gostoso` são `public=true`, então o CDN
-- do Supabase serve objetos via URL conhecida SEM consultar RLS. Policies
-- SELECT amplas (qual = "bucket_id = 'X'") só servem para permitir LIST
-- via API REST, o que expõe o inventário completo a qualquer cliente.
-- Removendo essas policies, URLs diretas continuam funcionando, mas
-- listagem indiscriminada é bloqueada (Storage Linter advisor 0025).
drop policy if exists "Public read business photos"  on storage.objects;
drop policy if exists "business photos public read"  on storage.objects;
drop policy if exists "public read gostoso storage"  on storage.objects;

-- Nota: não criamos policies de SELECT restritas porque buckets PUBLIC
-- bypassam RLS no path do CDN. Se algum dia esses buckets virarem private,
-- precisaremos adicionar policies de SELECT path-aware.

-- ── 5. Restringir policies admin/owner ao role authenticated ───────────────
-- Necessário porque, com REVOKE em gostoso_is_admin() do anon (item 3),
-- qualquer SELECT anônimo em tabelas onde existem policies `cmd=ALL` para
-- `roles={public}` chamando gostoso_is_admin() falha com:
--   42501 — permission denied for function gostoso_is_admin
-- Postgres avalia TODAS as policies aplicáveis ao comando, mesmo as que
-- retornariam false; com `to authenticated`, anon nunca avalia a policy.
-- Effective behavior is unchanged (admins continuam autenticados; usuários
-- anônimos seguem usando as policies SELECT abertas tipo "public read").

drop policy if exists "admin write businesses" on public.gostoso_businesses;
create policy "admin write businesses"
  on public.gostoso_businesses for all
  to authenticated
  using (gostoso_is_admin())
  with check (gostoso_is_admin());

drop policy if exists "owner write businesses" on public.gostoso_businesses;
create policy "owner write businesses"
  on public.gostoso_businesses for all
  to authenticated
  using (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
  )
  with check (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
  );

drop policy if exists "admin full access" on public.gostoso_blog_posts;
create policy "admin full access"
  on public.gostoso_blog_posts for all
  to authenticated
  using (gostoso_is_admin())
  with check (gostoso_is_admin());

drop policy if exists "admin all claims" on public.gostoso_claim_requests;
create policy "admin all claims"
  on public.gostoso_claim_requests for all
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "admin write events" on public.gostoso_events;
create policy "admin write events"
  on public.gostoso_events for all
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "admin write fund" on public.gostoso_fund_entries;
create policy "admin write fund"
  on public.gostoso_fund_entries for all
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "admin_full_goals" on public.gostoso_goals;
create policy "admin_full_goals"
  on public.gostoso_goals for all
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "admin read profiles" on public.gostoso_profiles;
create policy "admin read profiles"
  on public.gostoso_profiles for select
  to authenticated
  using (gostoso_is_admin());

drop policy if exists "admin_full_access" on public.gostoso_reviews;
create policy "admin_full_access"
  on public.gostoso_reviews for all
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );
