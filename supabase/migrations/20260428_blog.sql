-- Blog posts para Vive Gostoso
create table if not exists gostoso_blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text not null,
  content      text not null,
  cover_url    text,
  author       text not null default 'Equipe Vive Gostoso',
  tags         text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

alter table gostoso_blog_posts enable row level security;

-- Qualquer pessoa pode ler posts publicados
create policy "public read published posts"
  on gostoso_blog_posts for select
  using (is_published = true);

-- Apenas admin pode inserir/atualizar/deletar
create policy "admin full access"
  on gostoso_blog_posts for all
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
      and role = 'admin'
    )
  );
