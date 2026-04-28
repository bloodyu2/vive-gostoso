-- Claims: permite que donos reivindiquem perfis inseridos pela plataforma

create table if not exists gostoso_claim_requests (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references gostoso_businesses(id) on delete cascade,
  profile_id   uuid not null references gostoso_profiles(id) on delete cascade,
  status       text not null default 'pending', -- pending | approved | rejected
  message      text,
  admin_note   text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  unique(business_id, profile_id)
);

alter table gostoso_claim_requests enable row level security;

-- Usuário autenticado pode inserir pedido com o próprio profile_id
create policy "auth insert own claim"
  on gostoso_claim_requests for insert
  with check (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
  );

-- Pode ler o próprio pedido
create policy "auth read own claim"
  on gostoso_claim_requests for select
  using (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
  );

-- Admin lê e atualiza tudo
create policy "admin all claims"
  on gostoso_claim_requests for all
  using (
    (select role from gostoso_profiles where auth_user_id = auth.uid()) = 'admin'
  );
