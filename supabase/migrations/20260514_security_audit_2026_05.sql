-- ============================================================================
-- Security audit 2026-05 — RLS hardening
-- ----------------------------------------------------------------------------
-- 1. Block role escalation in gostoso_profiles (user cannot set own role).
-- 2. Block plan/featured/verified self-elevation in gostoso_businesses.
-- 3. Restrict gostoso_transfers writes to admin only.
-- 4. Tighten storage upload policies (folder/owner check + size + mime).
-- 5. Restrict gostoso_notifications insert to service_role + admin.
-- 6. Pin search_path on update_updated_at function.
-- ============================================================================

-- ── 1. gostoso_profiles role escalation guard ──────────────────────────────
create or replace function public.gostoso_guard_profile_update()
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

  if new.role is distinct from old.role then
    raise exception 'permission denied: cannot change role';
  end if;
  if new.auth_user_id is distinct from old.auth_user_id then
    raise exception 'permission denied: cannot change auth_user_id';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_gostoso_guard_profile_update on gostoso_profiles;
create trigger trg_gostoso_guard_profile_update
  before update on gostoso_profiles
  for each row execute function public.gostoso_guard_profile_update();

create or replace function public.gostoso_guard_profile_insert()
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

  if new.role is distinct from 'prestador' then
    new.role := 'prestador';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_gostoso_guard_profile_insert on gostoso_profiles;
create trigger trg_gostoso_guard_profile_insert
  before insert on gostoso_profiles
  for each row execute function public.gostoso_guard_profile_insert();

-- ── 2. gostoso_businesses plan/featured/verified guard ─────────────────────
create or replace function public.gostoso_guard_business_update()
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

  new.plan                   := old.plan;
  new.is_featured            := old.is_featured;
  new.is_verified            := old.is_verified;
  new.display_order          := old.display_order;
  new.stripe_customer_id     := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.plan_expires_at        := old.plan_expires_at;
  new.profile_id             := old.profile_id;

  return new;
end;
$$;

drop trigger if exists trg_gostoso_guard_business_update on gostoso_businesses;
create trigger trg_gostoso_guard_business_update
  before update on gostoso_businesses
  for each row execute function public.gostoso_guard_business_update();

create or replace function public.gostoso_guard_business_insert()
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

  new.plan                   := 'free';
  new.is_featured            := false;
  new.is_verified            := false;
  new.display_order          := 0;
  new.stripe_customer_id     := null;
  new.stripe_subscription_id := null;
  new.plan_expires_at        := null;

  return new;
end;
$$;

drop trigger if exists trg_gostoso_guard_business_insert on gostoso_businesses;
create trigger trg_gostoso_guard_business_insert
  before insert on gostoso_businesses
  for each row execute function public.gostoso_guard_business_insert();

drop policy if exists "business owner update" on gostoso_businesses;

-- Trigger functions are not meant to be called as RPC — revoke EXECUTE.
revoke all on function public.gostoso_guard_profile_update()  from public, anon, authenticated;
revoke all on function public.gostoso_guard_profile_insert()  from public, anon, authenticated;
revoke all on function public.gostoso_guard_business_update() from public, anon, authenticated;
revoke all on function public.gostoso_guard_business_insert() from public, anon, authenticated;

-- ── 3. gostoso_transfers — restrict writes to admins ───────────────────────
drop policy if exists "transfers_auth_write" on gostoso_transfers;

create policy "transfers_admin_write"
  on gostoso_transfers for all
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

-- ── 4. Storage: business-photos folder ownership check ─────────────────────
drop policy if exists "Owner upload business photos" on storage.objects;
drop policy if exists "business photos owner upload" on storage.objects;

create policy "business_photos_owner_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-photos'
    and exists (
      select 1
      from gostoso_businesses b
      join gostoso_profiles p on p.id = b.profile_id
      where p.auth_user_id = auth.uid()
        and b.id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "business_photos_owner_update" on storage.objects;
create policy "business_photos_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'business-photos'
    and exists (
      select 1
      from gostoso_businesses b
      join gostoso_profiles p on p.id = b.profile_id
      where p.auth_user_id = auth.uid()
        and b.id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Owner delete business photos" on storage.objects;
drop policy if exists "business photos owner delete" on storage.objects;

create policy "business_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'business-photos'
    and exists (
      select 1
      from gostoso_businesses b
      join gostoso_profiles p on p.id = b.profile_id
      where p.auth_user_id = auth.uid()
        and b.id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "business_photos_admin_all" on storage.objects;
create policy "business_photos_admin_all"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'business-photos'
    and exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'business-photos'
    and exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

update storage.buckets
   set file_size_limit = 5 * 1024 * 1024,
       allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp']
 where id = 'business-photos';

update storage.buckets
   set file_size_limit = 5 * 1024 * 1024,
       allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/svg+xml']
 where id = 'gostoso';

-- ── 5. gostoso_notifications: restrict insert to service_role + admin ──────
drop policy if exists "service_insert_notifications" on gostoso_notifications;

create policy "service_role_insert_notifications"
  on gostoso_notifications for insert
  to service_role
  with check (true);

create policy "admin_insert_notifications"
  on gostoso_notifications for insert
  to authenticated
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "users_update_own_notifications" on gostoso_notifications;
create policy "users_update_own_notifications"
  on gostoso_notifications for update
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

-- ── 6. Pin search_path on update_updated_at ────────────────────────────────
alter function public.update_updated_at() set search_path = public;
