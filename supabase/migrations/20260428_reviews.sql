-- supabase/migrations/20260428_reviews.sql

create table if not exists gostoso_reviews (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references gostoso_businesses(id) on delete cascade,
  author_name text,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_gostoso_reviews_business
  on gostoso_reviews(business_id, approved);

-- RLS
alter table gostoso_reviews enable row level security;

-- Public: read only approved reviews
create policy "public_read_approved_reviews"
  on gostoso_reviews for select
  using (approved = true);

-- Public: insert pending reviews (approved must be false)
create policy "public_insert_review"
  on gostoso_reviews for insert
  with check (approved = false);

-- Admin: full access via authenticated user with admin role in gostoso_profiles
create policy "admin_full_access"
  on gostoso_reviews for all
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );
