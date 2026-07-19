-- ============================================================================
-- v2 security hardening — 2026-07-19
-- ----------------------------------------------------------------------------
-- 1. Anti-elevation guard trigger on gostoso_professionals (mirrors the
--    gostoso_guard_business_* pattern from 20260514_security_audit_2026_05.sql):
--    insert forces is_published=false; update resets is_published, rating_avg
--    and review_count to their OLD values unless the caller is admin.
-- 2. New view gostoso_professional_ratings (mirrors gostoso_business_ratings
--    from 20260609_business_ratings_view.sql), aggregating approved reviews
--    by professional_id.
-- 3. Admin ALL policies for gostoso_service_listings / gostoso_job_listings —
--    today these tables have zero UPDATE/DELETE policy, so the admin panel
--    cannot approve/reject anything.
-- 4. Pin status='pending' in the gostoso_claim_requests insert policy's
--    with check (previously only checked profile_id ownership, so a caller
--    could insert a claim with an arbitrary status).
-- 5. Revoke unnecessary EXECUTE grants on the professionals updated_at
--    trigger function, consistent with how other trigger functions were
--    locked down in the May 2026 audit.
-- ============================================================================

-- ── 1. gostoso_professionals anti-elevation guard ──────────────────────────
create or replace function public.gostoso_guard_professional_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  if auth.uid() is null then
    return new;
  end if;

  select exists (
    select 1 from gostoso_profiles
    where auth_user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  if is_admin then
    return new;
  end if;

  new.is_published := old.is_published;
  new.rating_avg    := old.rating_avg;
  new.review_count  := old.review_count;

  return new;
end;
$$;

drop trigger if exists trg_gostoso_guard_professional_update on gostoso_professionals;
create trigger trg_gostoso_guard_professional_update
  before update on gostoso_professionals
  for each row execute function public.gostoso_guard_professional_update();

create or replace function public.gostoso_guard_professional_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  if auth.uid() is null then
    return new;
  end if;

  select exists (
    select 1 from gostoso_profiles
    where auth_user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  if is_admin then
    return new;
  end if;

  new.is_published := false;

  return new;
end;
$$;

drop trigger if exists trg_gostoso_guard_professional_insert on gostoso_professionals;
create trigger trg_gostoso_guard_professional_insert
  before insert on gostoso_professionals
  for each row execute function public.gostoso_guard_professional_insert();

-- Trigger functions are not meant to be called as RPC — revoke EXECUTE.
revoke all on function public.gostoso_guard_professional_update() from public, anon, authenticated;
revoke all on function public.gostoso_guard_professional_insert() from public, anon, authenticated;

-- ── 2. gostoso_professional_ratings view ───────────────────────────────────
-- Same pattern as gostoso_business_ratings: one aggregation query instead of
-- N+1 per professional card. Aggregates only approved reviews whose target
-- is a professional (gostoso_reviews has separate nullable business_id /
-- professional_id / transfer_id columns — not a target_type/target_id
-- polymorphic pair — with the reviews_one_target check constraint ensuring
-- at most one is set).
create or replace view public.gostoso_professional_ratings as
select
  professional_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)::int as review_count
from public.gostoso_reviews
where approved = true and professional_id is not null
group by professional_id;

-- NOTE for the workstream that owns src/hooks/useProfessionals.ts:
-- now that gostoso_professionals.rating_avg / review_count are locked down
-- by the guard trigger above (only admins can change them, and nothing
-- currently recomputes them on new reviews), the hook should read live
-- rating/review_count from this view (joined by professional_id) instead of
-- the stored columns on gostoso_professionals.

-- Grant obrigatorio: views novas nao sao expostas automaticamente
grant select on public.gostoso_professional_ratings to anon;
grant select on public.gostoso_professional_ratings to authenticated;
grant select on public.gostoso_professional_ratings to service_role;

-- ── 3. Admin ALL policies for service/job listings ─────────────────────────
-- These tables currently only have SELECT (active rows) and INSERT
-- (forced inactive) policies — there is no UPDATE/DELETE policy at all, so
-- the admin panel has no RLS path to approve/reject/remove a listing.
drop policy if exists "admin_all_service_listings" on public.gostoso_service_listings;
create policy "admin_all_service_listings" on public.gostoso_service_listings for all to authenticated
  using (gostoso_is_admin()) with check (gostoso_is_admin());

drop policy if exists "admin_all_job_listings" on public.gostoso_job_listings;
create policy "admin_all_job_listings" on public.gostoso_job_listings for all to authenticated
  using (gostoso_is_admin()) with check (gostoso_is_admin());

-- ── 4. Pin status='pending' on claim request insert ────────────────────────
-- Previously "auth insert own claim" only checked profile_id ownership, so
-- an authenticated caller could insert a row with status='approved' (or any
-- other value) directly, bypassing admin review.
drop policy if exists "auth insert own claim" on public.gostoso_claim_requests;
create policy "auth insert own claim"
  on public.gostoso_claim_requests for insert
  to authenticated
  with check (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
    and status = 'pending'
  );

-- ── 5. Lock down set_professionals_updated_at() ────────────────────────────
-- Trigger function, not meant to be callable as RPC — was left with default
-- EXECUTE grants, inconsistent with the guard functions locked down in the
-- May 2026 audit. Trigger execution does not require an EXECUTE grant, so
-- this is a no-op for the trigger itself.
revoke all on function public.set_professionals_updated_at() from public, anon, authenticated;
