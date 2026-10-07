-- Estado do banco antes das migracoes de 07/10/2026, so as tabelas e politicas que
-- elas tocam, reproduzido a partir do que estava em producao (pg_policies,
-- privilegios de coluna, triggers). Os testes de politica rodam as migracoes
-- novas em cima disto, num Postgres em memoria (PGlite).

create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- ── perfis e admin ──────────────────────────────────────────────────────────
create table public.gostoso_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  role text not null default 'prestador',
  email text
);
alter table public.gostoso_profiles enable row level security;
create policy "own profile select" on public.gostoso_profiles for select to authenticated
  using (auth_user_id = auth.uid());

create function public.gostoso_is_admin() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from gostoso_profiles where auth_user_id = auth.uid() and role = 'admin'); $$;
revoke execute on function public.gostoso_is_admin() from public, anon;
grant execute on function public.gostoso_is_admin() to authenticated, service_role;

-- ── negocios ────────────────────────────────────────────────────────────────
create table public.gostoso_businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  category_id uuid,
  profile_id uuid,
  address text,
  lat numeric,
  lng numeric,
  phone text,
  whatsapp text,
  website text,
  instagram text,
  cover_url text,
  photos text[],
  imagens_licenciadas text[],
  opening_hours jsonb,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  plan text not null default 'free',
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  price_range text,
  menu_url text,
  amenities jsonb,
  is_published boolean not null default false,
  business_type text not null default 'local',
  services jsonb,
  plan_expires_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text
);
alter table public.gostoso_businesses enable row level security;

create policy "admin write businesses" on public.gostoso_businesses for all to authenticated
  using (gostoso_is_admin()) with check (gostoso_is_admin());
create policy "owner write businesses" on public.gostoso_businesses for all to authenticated
  using (profile_id in (select id from gostoso_profiles where auth_user_id = auth.uid()))
  with check (profile_id in (select id from gostoso_profiles where auth_user_id = auth.uid()));
create policy "public read businesses" on public.gostoso_businesses for select using (active = true);

create function public.gostoso_guard_business_update() returns trigger
  language plpgsql security definer set search_path = public as
$$
declare is_admin boolean;
begin
  if auth.uid() is null then return new; end if;
  select exists (select 1 from gostoso_profiles where auth_user_id = auth.uid() and role = 'admin') into is_admin;
  if is_admin then return new; end if;
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
create trigger trg_gostoso_guard_business_update before update on public.gostoso_businesses
  for each row execute function public.gostoso_guard_business_update();

-- ── tabelas com insercao anonima ────────────────────────────────────────────
create table public.gostoso_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  author_name text,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  professional_id uuid,
  transfer_id uuid,
  constraint reviews_one_target check (
    ((business_id is not null)::int + (professional_id is not null)::int + (transfer_id is not null)::int) = 1)
);
alter table public.gostoso_reviews enable row level security;
create policy "public_insert_review" on public.gostoso_reviews for insert to public
  with check (approved = false and (
    ((business_id is not null)::int + (professional_id is not null)::int + (transfer_id is not null)::int) = 1));

create table public.gostoso_job_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  business_name text,
  title text not null,
  description text,
  contract_type text,
  whatsapp text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.gostoso_job_listings enable row level security;
create policy "job_listings_public_insert" on public.gostoso_job_listings for insert to public
  with check (is_active = false);

create table public.gostoso_service_listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headline text,
  description text,
  service_category text,
  photo_url text,
  whatsapp text,
  is_active boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.gostoso_service_listings enable row level security;
create policy "service_listings_public_insert" on public.gostoso_service_listings for insert to public
  with check (is_active = false and is_featured = false);

create table public.gostoso_transfers (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  whatsapp text,
  photo_url text,
  vehicle_type text,
  max_passengers integer,
  routes jsonb,
  available_hours text,
  languages text[],
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  advance_notice text,
  payment_methods text[],
  meeting_point text,
  observations text,
  business_id uuid,
  slug text unique
);
alter table public.gostoso_transfers enable row level security;
create policy "transfers_public_insert" on public.gostoso_transfers for insert to public
  with check (active = false);

create table public.gostoso_event_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  cover_url text,
  event_type text,
  source_url text,
  submitter_name text,
  submitter_email text,
  submitter_phone text,
  is_approved boolean not null default false,
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
alter table public.gostoso_event_submissions enable row level security;
create policy "public_insert_submissions" on public.gostoso_event_submissions for insert to anon, authenticated
  with check (
    is_approved = false
    and admin_note is null
    and reviewed_at is null
    and id is not null
    and char_length(name) between 1 and 200
    and char_length(coalesce(description, '')) <= 4000
    and char_length(submitter_name) between 1 and 200
    and char_length(submitter_email) between 3 and 320
    and char_length(coalesce(submitter_phone, '')) <= 40
  );

-- ── privilegios (como no Supabase, mais o que a migracao KAN-341 deixou) ─────
grant all on all tables in schema public to authenticated, service_role;
grant all on all tables in schema public to anon;
-- Em producao o anon so le colunas nomeadas de gostoso_businesses (sem as duas stripe_*).
revoke select on table public.gostoso_businesses from anon;
grant select (
  id, name, slug, description, category_id, profile_id, address, lat, lng, phone, whatsapp,
  website, instagram, cover_url, photos, imagens_licenciadas, opening_hours, is_verified,
  is_featured, plan, active, display_order, created_at, updated_at, price_range, menu_url,
  amenities, is_published, business_type, services, plan_expires_at
) on table public.gostoso_businesses to anon;
