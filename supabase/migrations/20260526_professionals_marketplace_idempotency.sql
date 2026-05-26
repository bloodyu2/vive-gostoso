-- supabase/migrations/20260526_professionals_marketplace_idempotency.sql
-- Adds idempotency guards to the professionals_marketplace migration.
-- Replaces trigger and policies with drop-and-recreate pattern.

-- ── Trigger: make idempotent ───────────────────────────────────────────────
drop trigger if exists professionals_updated_at on public.gostoso_professionals;
create trigger professionals_updated_at
  before update on public.gostoso_professionals
  for each row execute function public.set_professionals_updated_at();

-- ── RLS Policies: make idempotent ─────────────────────────────────────────
drop policy if exists "public read published professionals" on public.gostoso_professionals;
create policy "public read published professionals"
  on public.gostoso_professionals for select
  using (is_published = true);

drop policy if exists "owner manage own professional" on public.gostoso_professionals;
create policy "owner manage own professional"
  on public.gostoso_professionals for all
  using (
    profile_id in (
      select id from public.gostoso_profiles
      where auth_user_id = auth.uid()
    )
  );

drop policy if exists "admin full access professionals" on public.gostoso_professionals;
create policy "admin full access professionals"
  on public.gostoso_professionals for all
  using (
    exists (
      select 1 from public.gostoso_profiles
      where auth_user_id = auth.uid()
      and role = 'admin'
    )
  );
