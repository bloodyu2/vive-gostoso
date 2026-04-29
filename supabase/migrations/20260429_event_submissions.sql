-- Event submissions from community members
create table if not exists gostoso_event_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  location    text,
  cover_url   text,
  event_type  text check (event_type in ('festival', 'esporte', 'cultural', 'gastronomia')),
  source_url  text,
  submitter_name  text not null,
  submitter_email text not null,
  submitter_phone text,
  is_approved boolean not null default false,
  admin_note  text,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

-- RLS
alter table gostoso_event_submissions enable row level security;

-- Anyone can insert (submit) — approved=false is forced by check
create policy "public_insert_submissions"
  on gostoso_event_submissions for insert
  to anon, authenticated
  with check (is_approved = false);

-- Only authenticated admins can read all submissions
create policy "admin_read_submissions"
  on gostoso_event_submissions for select
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Only authenticated admins can update (approve/reject)
create policy "admin_update_submissions"
  on gostoso_event_submissions for update
  to authenticated
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
      and role = 'admin'
    )
  );
