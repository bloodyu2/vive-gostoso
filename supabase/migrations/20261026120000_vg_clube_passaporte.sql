-- Passaporte Gostoso (clube de vantagens), 26/10/2026.
--
-- Cada parceiro define a PROPRIA vantagem (texto, limite por mes, validade) e muda
-- quando quiser; vale na hora, sem aprovacao. O turista toca em "Usar" e recebe o
-- codigo do dia (GOSTOSO-NNNN), gerado AQUI, no banco; cada uso grava UMA linha.
--
-- O que entra:
--   gostoso_club_partners      a vantagem de cada negocio (um por negocio)
--   gostoso_club_redemptions   uma linha por uso (negocio, data e hora, codigo, plaquinha)
--   gostoso_club_views         vezes que a vantagem foi vista, contadas por dia
--   gostoso_club_segredo       semente do codigo do dia (sem nenhum grant, so as funcoes leem)
--   gostoso_plaquinha_visitas  visitas a /p/NN contadas por codigo e por dia, sem dado pessoal
--   view gostoso_club_usos_mensais   usos por parceiro por mes (o que o dono recebe)
--   funcoes: gostoso_club_vantagens, gostoso_club_usar, gostoso_club_registrar_vistas,
--            gostoso_club_registrar_visita_plaquinha, gostoso_club_painel
--
-- Grants (decisoes.md): o template manda select/insert/update/delete para authenticated.
-- Aqui as tabelas do dono usam grant por COLUNA, porque status "em_combinacao" e o
-- rotulo do card (tipo) sao nossos, nao do dono. O dono liga e pausa (no_ar/pausado)
-- e edita beneficio, regra, limite e validade. Quem muda o resto e o service_role.
-- Uso, vista e visita de plaquinha so entram pelas funcoes SECURITY DEFINER; ninguem
-- escreve nessas tabelas direto. O dono nao apaga a propria vantagem (pausar existe):
-- apagar levaria o historico de usos junto. So o service_role apaga.
--
-- LIMITE CONHECIDO (sem cadastro e sem service role no app): quem chama a funcao direto
-- com a chave anon pode gastar o limite mensal de um parceiro. Defesas: 1 uso por
-- aparelho por parceiro por dia (o mesmo toque devolve o mesmo codigo, sem linha nova)
-- e teto de 20 usos por minuto por parceiro. Se houver abuso: Route Handler com
-- service_role e hash de IP, tirando o execute de anon.
--
-- REVERSAO (rodar para desfazer):
--   drop view if exists public.gostoso_club_usos_mensais;
--   drop function if exists public.gostoso_club_painel(uuid);
--   drop function if exists public.gostoso_club_registrar_visita_plaquinha(text);
--   drop function if exists public.gostoso_club_registrar_vistas(uuid[]);
--   drop function if exists public.gostoso_club_usar(uuid, text, text);
--   drop function if exists public.gostoso_club_vantagens(uuid[]);
--   drop function if exists public.gostoso_club_codigo_do_dia(uuid, date);
--   drop function if exists public.gostoso_club_inicio_do_mes();
--   drop function if exists public.gostoso_club_hoje();
--   drop function if exists public.gostoso_club_sou_dono(uuid);
--   drop table if exists public.gostoso_plaquinha_visitas, public.gostoso_club_segredo,
--     public.gostoso_club_views, public.gostoso_club_redemptions, public.gostoso_club_partners;

-- ── ajudantes de data e de dono ─────────────────────────────────────────────

create or replace function public.gostoso_club_hoje() returns date
  language sql stable set search_path = public as
$$ select (now() at time zone 'America/Fortaleza')::date $$;

create or replace function public.gostoso_club_inicio_do_mes() returns timestamptz
  language sql stable set search_path = public as
$$ select date_trunc('month', now() at time zone 'America/Fortaleza') at time zone 'America/Fortaleza' $$;

-- Dono do negocio logado. SECURITY DEFINER para nao depender da RLS das duas
-- tabelas e para a coluna ser sempre a da tabela certa (qualificada abaixo).
create or replace function public.gostoso_club_sou_dono(p_business uuid) returns boolean
  language sql stable security definer set search_path = public as
$$
  select exists (
    select 1
      from public.gostoso_businesses b
      join public.gostoso_profiles p on p.id = b.profile_id
     where b.id = p_business
       and p.auth_user_id = auth.uid()
  )
$$;

-- ── tabelas ─────────────────────────────────────────────────────────────────

create table if not exists public.gostoso_club_partners (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null unique references public.gostoso_businesses(id) on delete cascade,
  tipo           text check (tipo is null or char_length(tipo) <= 40),
  beneficio      text not null check (char_length(beneficio) between 3 and 140),
  regra          text check (regra is null or char_length(regra) <= 200),
  limite_mensal  integer check (limite_mensal is null or limite_mensal between 1 and 100000),
  valido_ate     date,
  status         text not null default 'em_combinacao'
                   check (status in ('em_combinacao', 'no_ar', 'pausado')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.gostoso_club_redemptions (
  id           uuid primary key default gen_random_uuid(),
  partner_id   uuid not null references public.gostoso_club_partners(id) on delete cascade,
  business_id  uuid not null references public.gostoso_businesses(id) on delete cascade,
  codigo       text not null,
  origem       text check (origem is null or origem ~ '^[0-9]{2}$'),
  aparelho     text check (aparelho is null or aparelho ~ '^[0-9a-f-]{36}$'),
  created_at   timestamptz not null default now()
);
create index if not exists idx_gostoso_club_redemptions_partner
  on public.gostoso_club_redemptions (partner_id, created_at desc);
create index if not exists idx_gostoso_club_redemptions_business
  on public.gostoso_club_redemptions (business_id, created_at desc);
create index if not exists idx_gostoso_club_redemptions_aparelho
  on public.gostoso_club_redemptions (partner_id, aparelho, created_at desc) where aparelho is not null;

create table if not exists public.gostoso_club_views (
  partner_id  uuid not null references public.gostoso_club_partners(id) on delete cascade,
  dia         date not null,
  n           integer not null default 0,
  primary key (partner_id, dia)
);

create table if not exists public.gostoso_club_segredo (
  id     boolean primary key default true check (id),
  valor  text not null
);
insert into public.gostoso_club_segredo (id, valor)
values (true, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (id) do nothing;

create table if not exists public.gostoso_plaquinha_visitas (
  codigo  text not null check (codigo ~ '^[0-9]{2}$'),
  dia     date not null,
  n       integer not null default 0,
  primary key (codigo, dia)
);

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.gostoso_club_partners enable row level security;
alter table public.gostoso_club_redemptions enable row level security;
alter table public.gostoso_club_views enable row level security;
alter table public.gostoso_club_segredo enable row level security;
alter table public.gostoso_plaquinha_visitas enable row level security;

-- Vantagem: o publico le as que estao no ar ou em combinacao, de negocio publicado.
drop policy if exists "club_partners_public_read" on public.gostoso_club_partners;
create policy "club_partners_public_read" on public.gostoso_club_partners
  for select to anon, authenticated
  using (
    status in ('no_ar', 'em_combinacao')
    and exists (
      select 1 from public.gostoso_businesses b
       where b.id = gostoso_club_partners.business_id
         and b.active = true
         and b.is_published = true
    )
  );

drop policy if exists "club_partners_owner_read" on public.gostoso_club_partners;
create policy "club_partners_owner_read" on public.gostoso_club_partners
  for select to authenticated
  using (public.gostoso_club_sou_dono(gostoso_club_partners.business_id));

drop policy if exists "club_partners_admin_read" on public.gostoso_club_partners;
create policy "club_partners_admin_read" on public.gostoso_club_partners
  for select to authenticated
  using (public.gostoso_is_admin());

-- O dono entra (insert) e muda (update) a propria vantagem. Nunca como
-- "em_combinacao": esse estado e nosso.
drop policy if exists "club_partners_owner_insert" on public.gostoso_club_partners;
create policy "club_partners_owner_insert" on public.gostoso_club_partners
  for insert to authenticated
  with check (
    public.gostoso_club_sou_dono(gostoso_club_partners.business_id)
    and gostoso_club_partners.status in ('no_ar', 'pausado')
  );

drop policy if exists "club_partners_owner_update" on public.gostoso_club_partners;
create policy "club_partners_owner_update" on public.gostoso_club_partners
  for update to authenticated
  using (public.gostoso_club_sou_dono(gostoso_club_partners.business_id))
  with check (
    public.gostoso_club_sou_dono(gostoso_club_partners.business_id)
    and gostoso_club_partners.status in ('no_ar', 'pausado')
  );

drop policy if exists "club_partners_owner_delete" on public.gostoso_club_partners;

-- Usos e vistas: o dono le os do proprio negocio; o admin le todos. Escrita so por funcao.
drop policy if exists "club_redemptions_owner_read" on public.gostoso_club_redemptions;
create policy "club_redemptions_owner_read" on public.gostoso_club_redemptions
  for select to authenticated
  using (
    public.gostoso_club_sou_dono(gostoso_club_redemptions.business_id)
    or public.gostoso_is_admin()
  );

drop policy if exists "club_views_owner_read" on public.gostoso_club_views;
create policy "club_views_owner_read" on public.gostoso_club_views
  for select to authenticated
  using (
    exists (
      select 1 from public.gostoso_club_partners cp
       where cp.id = gostoso_club_views.partner_id
         and (public.gostoso_club_sou_dono(cp.business_id) or public.gostoso_is_admin())
    )
  );

-- gostoso_club_segredo e gostoso_plaquinha_visitas: RLS ligada, sem policy e sem grant.

-- ── grants ──────────────────────────────────────────────────────────────────

revoke all on public.gostoso_club_partners, public.gostoso_club_redemptions,
  public.gostoso_club_views, public.gostoso_club_segredo,
  public.gostoso_plaquinha_visitas from anon, authenticated;

grant select on public.gostoso_club_partners to anon;
grant select on public.gostoso_club_partners to authenticated;
grant insert (business_id, beneficio, regra, limite_mensal, valido_ate, status)
  on public.gostoso_club_partners to authenticated;
grant update (beneficio, regra, limite_mensal, valido_ate, status)
  on public.gostoso_club_partners to authenticated;
grant select on public.gostoso_club_redemptions to authenticated;
grant select on public.gostoso_club_views to authenticated;

grant all on public.gostoso_club_partners, public.gostoso_club_redemptions,
  public.gostoso_club_views, public.gostoso_club_segredo,
  public.gostoso_plaquinha_visitas to service_role;

-- updated_at
create or replace function public.gostoso_club_toca_updated_at() returns trigger
  language plpgsql set search_path = public as
$$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists gostoso_club_partners_updated_at on public.gostoso_club_partners;
create trigger gostoso_club_partners_updated_at before update on public.gostoso_club_partners
  for each row execute function public.gostoso_club_toca_updated_at();

-- ── codigo do dia ───────────────────────────────────────────────────────────
-- Muda todo dia (fuso de Gostoso) e e proprio de cada parceiro: o codigo de um
-- balcao nao vale no outro. Nao da para prever sem a semente. Interna: ninguem de fora a executa.

create or replace function public.gostoso_club_codigo_do_dia(p_partner uuid, p_dia date default public.gostoso_club_hoje())
  returns text
  language sql stable security definer set search_path = public as
$$
  select 'GOSTOSO-' || lpad(
           (('x' || substr(md5(s.valor || to_char(p_dia, 'YYYY-MM-DD') || p_partner::text), 1, 7))::bit(28)::int % 10000)::text,
           4, '0')
    from public.gostoso_club_segredo s
   limit 1
$$;
revoke execute on function public.gostoso_club_codigo_do_dia(uuid, date) from public, anon, authenticated;
grant execute on function public.gostoso_club_codigo_do_dia(uuid, date) to service_role;

-- ── vantagens para o publico ────────────────────────────────────────────────
-- Uma linha por parceiro com vantagem visivel. "esgotada" cobre limite do mes
-- batido; vantagem vencida nem sai. Nao devolve contagem de uso.

create or replace function public.gostoso_club_vantagens(p_business_ids uuid[] default null)
  returns table (
    partner_id    uuid,
    business_id   uuid,
    nome          text,
    slug          text,
    logo_url      text,
    tipo          text,
    beneficio     text,
    regra         text,
    limite_mensal integer,
    valido_ate    date,
    status        text,
    esgotada      boolean
  )
  language sql stable security definer set search_path = public as
$$
  select cp.id, b.id, b.name, b.slug, b.logo_url,
         coalesce(cp.tipo, c.name),
         cp.beneficio, cp.regra, cp.limite_mensal, cp.valido_ate, cp.status,
         (cp.limite_mensal is not null and (
            select count(*) from public.gostoso_club_redemptions r
             where r.partner_id = cp.id
               and r.created_at >= public.gostoso_club_inicio_do_mes()
          ) >= cp.limite_mensal)
    from public.gostoso_club_partners cp
    join public.gostoso_businesses b on b.id = cp.business_id
    left join public.gostoso_categories c on c.id = b.category_id
   where cp.status in ('no_ar', 'em_combinacao')
     and b.active = true
     and b.is_published = true
     and (cp.valido_ate is null or cp.valido_ate >= public.gostoso_club_hoje())
     and (p_business_ids is null or b.id = any (p_business_ids))
   order by (cp.status = 'no_ar') desc, b.name
$$;
revoke execute on function public.gostoso_club_vantagens(uuid[]) from public;
grant execute on function public.gostoso_club_vantagens(uuid[]) to anon, authenticated, service_role;

-- ── usar: o turista toca em "Usar" ──────────────────────────────────────────
-- Devolve {ok, codigo, restantes} ou {ok:false, motivo}. Um uso novo = uma linha.
-- O mesmo aparelho (id aleatorio guardado no navegador, sem dado pessoal) que toca de
-- novo no mesmo parceiro no mesmo dia recebe o mesmo codigo e NAO gera linha nova:
-- fechar a caixa ou recarregar a pagina nao conta como outro uso.
-- Teto contra abuso: no maximo 20 usos novos por minuto por parceiro. O limite mensal
-- e conferido sob trava, para dois toques ao mesmo tempo nao passarem do limite.

create or replace function public.gostoso_club_usar(p_partner uuid, p_origem text default null, p_aparelho text default null)
  returns json
  language plpgsql security definer set search_path = public as
$$
declare
  v_cp         public.gostoso_club_partners%rowtype;
  v_usos_mes   integer;
  v_codigo     text;
  v_origem     text := case when p_origem ~ '^[0-9]{2}$' then p_origem else null end;
  v_aparelho   text := case when p_aparelho ~ '^[0-9a-f-]{36}$' then p_aparelho else null end;
  v_inicio_dia timestamptz := (public.gostoso_club_hoje()::timestamp) at time zone 'America/Fortaleza';
begin
  perform pg_advisory_xact_lock(hashtext(p_partner::text));

  select cp.* into v_cp
    from public.gostoso_club_partners cp
    join public.gostoso_businesses b on b.id = cp.business_id
   where cp.id = p_partner
     and cp.status = 'no_ar'
     and b.active = true and b.is_published = true
     and (cp.valido_ate is null or cp.valido_ate >= public.gostoso_club_hoje());
  if not found then
    return json_build_object('ok', false, 'motivo', 'indisponivel');
  end if;

  v_codigo := public.gostoso_club_codigo_do_dia(v_cp.id);

  select count(*) into v_usos_mes from public.gostoso_club_redemptions r
   where r.partner_id = v_cp.id and r.created_at >= public.gostoso_club_inicio_do_mes();

  if v_aparelho is not null and exists (
       select 1 from public.gostoso_club_redemptions r
        where r.partner_id = v_cp.id and r.aparelho = v_aparelho and r.created_at >= v_inicio_dia) then
    return json_build_object(
      'ok', true, 'codigo', v_codigo, 'repetido', true,
      'restantes', case when v_cp.limite_mensal is null then null
                        else greatest(v_cp.limite_mensal - v_usos_mes, 0) end);
  end if;

  if (select count(*) from public.gostoso_club_redemptions r
       where r.partner_id = v_cp.id and r.created_at > now() - interval '1 minute') >= 20 then
    return json_build_object('ok', false, 'motivo', 'muitos');
  end if;

  if v_cp.limite_mensal is not null and v_usos_mes >= v_cp.limite_mensal then
    return json_build_object('ok', false, 'motivo', 'esgotada');
  end if;

  insert into public.gostoso_club_redemptions (partner_id, business_id, codigo, origem, aparelho)
  values (v_cp.id, v_cp.business_id, v_codigo, v_origem, v_aparelho);

  return json_build_object(
    'ok', true,
    'codigo', v_codigo,
    'restantes', case when v_cp.limite_mensal is null then null
                      else v_cp.limite_mensal - v_usos_mes - 1 end
  );
end
$$;
revoke execute on function public.gostoso_club_usar(uuid, text, text) from public;
grant execute on function public.gostoso_club_usar(uuid, text, text) to anon, authenticated, service_role;

-- ── vistas ──────────────────────────────────────────────────────────────────
-- A pagina chama uma vez por visita com os parceiros que mostrou. Conta por dia.

create or replace function public.gostoso_club_registrar_vistas(p_partner_ids uuid[])
  returns void
  language sql volatile security definer set search_path = public as
$$
  insert into public.gostoso_club_views as v (partner_id, dia, n)
  select cp.id, public.gostoso_club_hoje(), 1
    from public.gostoso_club_partners cp
   where cp.id = any (p_partner_ids[1:30])
     and cp.status in ('no_ar', 'em_combinacao')
  on conflict (partner_id, dia) do update set n = v.n + 1
$$;
revoke execute on function public.gostoso_club_registrar_vistas(uuid[]) from public;
grant execute on function public.gostoso_club_registrar_vistas(uuid[]) to anon, authenticated, service_role;

-- ── visita a /p/NN ──────────────────────────────────────────────────────────

create or replace function public.gostoso_club_registrar_visita_plaquinha(p_codigo text)
  returns void
  language sql volatile security definer set search_path = public as
$$
  insert into public.gostoso_plaquinha_visitas as v (codigo, dia, n)
  select p_codigo, public.gostoso_club_hoje(), 1 where p_codigo ~ '^[0-9]{2}$'
  on conflict (codigo, dia) do update set n = v.n + 1
$$;
revoke execute on function public.gostoso_club_registrar_visita_plaquinha(text) from public;
grant execute on function public.gostoso_club_registrar_visita_plaquinha(text) to anon, authenticated, service_role;

-- ── painel do parceiro ──────────────────────────────────────────────────────
-- So o dono (ou admin) do negocio recebe algo; qualquer outro leva null.

create or replace function public.gostoso_club_painel(p_partner uuid)
  returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v_cp public.gostoso_club_partners%rowtype;
  v_inicio timestamptz := public.gostoso_club_inicio_do_mes();
begin
  select cp.* into v_cp from public.gostoso_club_partners cp where cp.id = p_partner;
  if not found then return null; end if;
  if not (public.gostoso_club_sou_dono(v_cp.business_id) or public.gostoso_is_admin()) then
    return null;
  end if;

  return json_build_object(
    'codigo_hoje', public.gostoso_club_codigo_do_dia(v_cp.id),
    'usos_mes', (select count(*) from public.gostoso_club_redemptions r
                  where r.partner_id = v_cp.id and r.created_at >= v_inicio),
    'vistas_mes', coalesce((select sum(w.n) from public.gostoso_club_views w
                  where w.partner_id = v_cp.id and w.dia >= (v_inicio at time zone 'America/Fortaleza')::date), 0),
    -- dias da semana (0 = domingo) com mais usos nos ultimos 90 dias, ate dois
    'dias_de_pico', coalesce((
        select json_agg(x.dow order by x.n desc, x.dow)
          from (select extract(dow from r.created_at at time zone 'America/Fortaleza')::int as dow,
                       count(*) as n
                  from public.gostoso_club_redemptions r
                 where r.partner_id = v_cp.id and r.created_at > now() - interval '90 days'
                 group by 1 order by 2 desc, 1 limit 2) x
      ), '[]'::json),
    'usos', coalesce((
        select json_agg(json_build_object('criado_em', u.created_at, 'codigo', u.codigo) order by u.created_at desc)
          from (select r.created_at, r.codigo from public.gostoso_club_redemptions r
                 where r.partner_id = v_cp.id order by r.created_at desc limit 30) u
      ), '[]'::json)
  );
end
$$;
revoke execute on function public.gostoso_club_painel(uuid) from public, anon;
grant execute on function public.gostoso_club_painel(uuid) to authenticated, service_role;

-- ── usos por mes (o que o dono recebe) ──────────────────────────────────────
-- security_invoker: respeita a RLS de quem consulta, entao cada dono ve so o seu.

create or replace view public.gostoso_club_usos_mensais with (security_invoker = true) as
  select r.partner_id,
         r.business_id,
         date_trunc('month', r.created_at at time zone 'America/Fortaleza')::date as mes,
         count(*)::int as usos
    from public.gostoso_club_redemptions r
   group by r.partner_id, r.business_id, 3;
revoke all on public.gostoso_club_usos_mensais from anon;
grant select on public.gostoso_club_usos_mensais to authenticated, service_role;

-- ── parceiros fundadores ────────────────────────────────────────────────────
-- Gostoso Expedicoes ja confirmou (5% no Pix ou em especie, todos os passeios,
-- sem limite por enquanto). Pousada Parcel e Casa Reduto entram "em combinacao":
-- aparecem no card assim e sem botao Usar ate o proprio dono ligar a vantagem.

insert into public.gostoso_club_partners (business_id, tipo, beneficio, regra, status)
select b.id, v.tipo, v.beneficio, v.regra, v.status
  from (values
    ('gostoso-expedicoes',          'Passeios',   '5% de desconto no Pix ou em espécie, em qualquer passeio.',
       'Qualquer dia da semana. Mostre o código antes de pagar.', 'no_ar'),
    ('pousada-parcel-do-gostoso',   'Hospedagem', 'Late check-out de cortesia.',                     null::text, 'em_combinacao'),
    ('casa-reduto-artesanato',      'Artesanato', 'Brinde feito pelas artesãs da casa.',            null::text, 'em_combinacao')
  ) as v (slug, tipo, beneficio, regra, status)
  join public.gostoso_businesses b on b.slug = v.slug
on conflict (business_id) do nothing;
