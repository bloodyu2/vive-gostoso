-- supabase/migrations/20260526_professionals_marketplace.sql
-- Marketplace de Profissionais: nova tabela + alterações

-- ── 1. Nova tabela: gostoso_professionals ──────────────────────────────────
create table if not exists public.gostoso_professionals (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.gostoso_profiles(id) on delete cascade,
  display_name   text not null,
  headline       text not null,
  bio            text,
  photo_url      text,
  category       text not null check (category in (
                   'coach','mentor','consultor','designer',
                   'fotografo','juridico','educacao','outro'
                 )),
  specialties    text[] not null default '{}',
  portfolio_items jsonb not null default '[]',
  whatsapp       text,
  instagram      text,
  website        text,
  hourly_rate    integer,                         -- em centavos, opcional
  is_published   boolean not null default false,
  rating_avg     numeric(3,2) not null default 0,
  review_count   integer not null default 0,
  slug           text unique not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- RLS
alter table public.gostoso_professionals enable row level security;

create policy "public read published professionals"
  on public.gostoso_professionals for select
  using (is_published = true);

create policy "owner manage own professional"
  on public.gostoso_professionals for all
  using (
    profile_id in (
      select id from public.gostoso_profiles
      where auth_user_id = auth.uid()
    )
  );

create policy "admin full access professionals"
  on public.gostoso_professionals for all
  using (
    exists (
      select 1 from public.gostoso_profiles
      where auth_user_id = auth.uid()
      and role = 'admin'
    )
  );

-- updated_at trigger
create or replace function public.set_professionals_updated_at()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger professionals_updated_at
  before update on public.gostoso_professionals
  for each row execute function public.set_professionals_updated_at();

-- ── 2. Alterar gostoso_businesses: adicionar business_type ────────────────
alter table public.gostoso_businesses
  add column if not exists business_type text not null default 'local'
  check (business_type in ('local', 'service_company'));

-- ── 3. Alterar gostoso_reviews: adicionar professional_id ─────────────────
alter table public.gostoso_reviews
  add column if not exists professional_id uuid
  references public.gostoso_professionals(id) on delete cascade;

-- Constraint: exatamente um alvo por review (business OU professional)
-- Nota: só aplica a novas reviews; reviews existentes têm business_id
-- A constraint abaixo permite reviews antigas (ambos null = não aplica)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_one_target'
    and conrelid = 'public.gostoso_reviews'::regclass
  ) then
    alter table public.gostoso_reviews
      add constraint reviews_one_target check (
        (business_id is not null)::int + (professional_id is not null)::int <= 1
      );
  end if;
end;
$$;
