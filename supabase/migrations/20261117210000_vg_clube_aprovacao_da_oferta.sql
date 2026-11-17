-- Passaporte Gostoso: a equipe aprova a vantagem do negocio antes de ir ao ar (KAN-917, Item 294, 17/11/2026).
--
-- Antes (26/10): o dono ligava a propria vantagem e ela valia na hora, sem aprovacao.
-- Agora: o dono ENVIA a vantagem (status em_analise); Iza e Victor aprovam ou recusam com motivo.
-- Victor e admin; a Iza NAO vira admin (Item 305): ela entra na tabela gostoso_aprovadores, um papel
-- menor que so decide vantagens (nao modera avaliacoes, eventos, negocios etc.). Aprovada vira no_ar. O dono continua pausando e religando sozinho enquanto o texto
-- for o que foi aprovado. O lojista confirmar o uso do voucher ja existe (gostoso_club_marcar_usado,
-- 28/10) e nao muda aqui.
--
-- O que muda:
--   gostoso_club_partners.status   aceita tambem 'em_analise' e 'rejeitado'
--   colunas novas (so a equipe escreve): motivo_recusa, analisado_em, analisado_por, aprovado_hash
--   trigger gostoso_club_partners_aprovacao: para o dono (authenticated/anon), insert nasce em_analise;
--       ligar (no_ar) so vale se o texto for igual ao aprovado; mudou o texto, volta a em_analise e sai do ar
--   gostoso_aprovadores (tabela sem grant) e gostoso_pode_aprovar(): admin OU quem esta na tabela
--   funcoes da equipe: gostoso_club_analise_fila(), gostoso_club_analise_decidir(uuid, boolean, text)
--   politicas de insert e update do dono passam a aceitar em_analise
--
-- O que conta como "o texto": beneficio, regra e os tres campos de agendamento. Limite mensal e
-- validade NAO entram: restringem o uso e o dono precisa poder renovar sem esperar a equipe.
--
-- Vantagens que ja estavam no ar ou pausadas em 17/11/2026 ficam aprovadas como estao (aprovado_hash
-- gravado agora, analisado_por nulo). Vantagens em_combinacao seguem sendo nossas e nao mudam.
-- A leitura publica nao muda: so no_ar e em_combinacao aparecem; em_analise e rejeitado ficam so para
-- o dono e para o admin.
--
-- REVERSAO (rodar para desfazer):
--   drop function if exists public.gostoso_club_analise_decidir(uuid, boolean, text);
--   drop function if exists public.gostoso_pode_aprovar();
--   drop table if exists public.gostoso_aprovadores;
--   drop function if exists public.gostoso_club_analise_fila();
--   drop trigger if exists gostoso_club_partners_aprovacao on public.gostoso_club_partners;
--   drop function if exists public.gostoso_club_partners_aprovacao();
--   drop function if exists public.gostoso_club_hash_conteudo(jsonb);
--   update public.gostoso_club_partners set status = 'pausado' where status in ('em_analise', 'rejeitado');
--   alter table public.gostoso_club_partners drop constraint gostoso_club_partners_status_check;
--   alter table public.gostoso_club_partners add constraint gostoso_club_partners_status_check
--     check (status in ('em_combinacao', 'no_ar', 'pausado'));
--   alter table public.gostoso_club_partners drop column if exists aprovado_hash, drop column if exists analisado_por,
--     drop column if exists analisado_em, drop column if exists motivo_recusa;
--   (e reaplicar as politicas club_partners_owner_insert e club_partners_owner_update de 20261026120000)

-- ── colunas e estados ───────────────────────────────────────────────────────

alter table public.gostoso_club_partners
  add column if not exists motivo_recusa text check (motivo_recusa is null or char_length(motivo_recusa) <= 300),
  add column if not exists analisado_em timestamptz,
  add column if not exists analisado_por uuid references auth.users (id) on delete set null,
  add column if not exists aprovado_hash text;

alter table public.gostoso_club_partners drop constraint if exists gostoso_club_partners_status_check;
alter table public.gostoso_club_partners
  add constraint gostoso_club_partners_status_check
  check (status in ('em_combinacao', 'no_ar', 'pausado', 'em_analise', 'rejeitado'));

-- Hash do que a equipe aprova. Recebe a linha como jsonb para nao depender da ordem das migracoes
-- (os campos de agendamento vieram depois; ausente vale nulo).
create or replace function public.gostoso_club_hash_conteudo(p jsonb) returns text
  language sql immutable set search_path = public as
$$
  select md5(jsonb_build_array(
    p -> 'beneficio', p -> 'regra', p -> 'requer_agendamento', p -> 'agendamento_com', p -> 'agendamento_contato'
  )::text)
$$;

-- ── trigger: o dono nunca se aprova ──────────────────────────────────────────
-- Vale para quem chega pelo PostgREST (authenticated e anon). O service_role, as funcoes SECURITY
-- DEFINER da equipe e as migracoes rodam com outro current_user e passam direto.

create or replace function public.gostoso_club_partners_aprovacao() returns trigger
  language plpgsql set search_path = public as
$$
declare
  v_hash text;
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'em_analise';
    new.motivo_recusa := null;
    new.analisado_em := null;
    new.analisado_por := null;
    new.aprovado_hash := null;
    return new;
  end if;

  -- Os campos da equipe nao mudam pelo dono (as colunas ja nao tem grant; isto e reforco).
  new.motivo_recusa := old.motivo_recusa;
  new.analisado_em := old.analisado_em;
  new.analisado_por := old.analisado_por;
  new.aprovado_hash := old.aprovado_hash;

  v_hash := public.gostoso_club_hash_conteudo(to_jsonb(new));

  if new.status = 'no_ar' then
    -- Ligar so vale com o texto aprovado e vindo de no_ar ou pausado. Todo o resto espera a equipe.
    if old.aprovado_hash is distinct from v_hash or old.status not in ('no_ar', 'pausado') then
      new.status := 'em_analise';
    end if;
  elsif new.status = 'pausado' then
    null;  -- pausar e sempre do dono
  elsif new.status = 'em_analise' then
    null;  -- reenviar e sempre do dono
  elsif new.status = 'rejeitado' and old.status = 'rejeitado' then
    null;  -- o dono salvou sem reenviar: segue recusada, com o motivo
  elsif new.status is distinct from old.status then
    raise exception 'status invalido' using errcode = '42501';
  end if;

  -- Editou o texto de uma vantagem que estava no ar: sai do ar ate a equipe aprovar de novo.
  if new.status = 'no_ar' and old.aprovado_hash is distinct from v_hash then
    new.status := 'em_analise';
  end if;

  if new.status = 'em_analise' then
    new.motivo_recusa := null;
  end if;

  return new;
end
$$;

drop trigger if exists gostoso_club_partners_aprovacao on public.gostoso_club_partners;
create trigger gostoso_club_partners_aprovacao
  before insert or update on public.gostoso_club_partners
  for each row execute function public.gostoso_club_partners_aprovacao();

-- Politicas do dono: aceitam em_analise (o trigger troca no_ar por em_analise ANTES da checagem).
drop policy if exists "club_partners_owner_insert" on public.gostoso_club_partners;
create policy "club_partners_owner_insert" on public.gostoso_club_partners
  for insert to authenticated
  with check (
    public.gostoso_club_sou_dono(gostoso_club_partners.business_id)
    and gostoso_club_partners.status in ('no_ar', 'pausado', 'em_analise')
  );

drop policy if exists "club_partners_owner_update" on public.gostoso_club_partners;
create policy "club_partners_owner_update" on public.gostoso_club_partners
  for update to authenticated
  using (public.gostoso_club_sou_dono(gostoso_club_partners.business_id))
  with check (
    public.gostoso_club_sou_dono(gostoso_club_partners.business_id)
    and gostoso_club_partners.status in ('no_ar', 'pausado', 'em_analise', 'rejeitado')
  );

-- ── o que ja existia fica aprovado como esta ────────────────────────────────

update public.gostoso_club_partners cp
   set aprovado_hash = public.gostoso_club_hash_conteudo(to_jsonb(cp)),
       analisado_em = now()
 where cp.status in ('no_ar', 'pausado') and cp.aprovado_hash is null;

-- ── quem pode aprovar ───────────────────────────────────────────────────────
-- Admin completo ou aprovador. Para pôr alguem (service_role, no SQL do painel, depois da frase do Victor):
--   insert into public.gostoso_aprovadores (auth_user_id) select id from auth.users where email = '<email da pessoa>';
-- Para tirar: delete from public.gostoso_aprovadores where auth_user_id = '<id>';

create table if not exists public.gostoso_aprovadores (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em    timestamptz not null default now()
);
alter table public.gostoso_aprovadores enable row level security;
revoke all on public.gostoso_aprovadores from anon, authenticated;
grant all on public.gostoso_aprovadores to service_role;

create or replace function public.gostoso_pode_aprovar() returns boolean
  language sql stable security definer set search_path = public as
$$
  select public.gostoso_is_admin()
      or exists (select 1 from public.gostoso_aprovadores a where a.auth_user_id = auth.uid())
$$;
revoke all on function public.gostoso_pode_aprovar() from public, anon;
grant execute on function public.gostoso_pode_aprovar() to authenticated, service_role;

-- ── funcoes da equipe ───────────────────────────────────────────────────────

create or replace function public.gostoso_club_analise_fila() returns jsonb
  language plpgsql stable security definer set search_path = public as
$$
begin
  if not public.gostoso_pode_aprovar() then
    raise exception 'sem acesso' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'partner_id', cp.id, 'business_id', cp.business_id, 'nome', b.name, 'slug', b.slug,
             'beneficio', cp.beneficio, 'regra', cp.regra, 'limite_mensal', cp.limite_mensal,
             'valido_ate', cp.valido_ate, 'enviado_em', cp.updated_at,
             'ja_aprovada_antes', cp.aprovado_hash is not null,
             'ultimo_motivo', cp.motivo_recusa) order by cp.updated_at)
      from public.gostoso_club_partners cp
      join public.gostoso_businesses b on b.id = cp.business_id
     where cp.status = 'em_analise'
  ), '[]'::jsonb);
end
$$;

-- Aprova (no_ar) ou recusa (rejeitado, com motivo) uma vantagem em analise. So admin.
create or replace function public.gostoso_club_analise_decidir(p_partner uuid, p_aprovar boolean, p_motivo text default null)
  returns json
  language plpgsql security definer set search_path = public as
$$
declare
  v public.gostoso_club_partners%rowtype;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
begin
  if not public.gostoso_pode_aprovar() then
    raise exception 'sem acesso' using errcode = '42501';
  end if;
  if not coalesce(p_aprovar, false) and (v_motivo is null or char_length(v_motivo) < 5 or char_length(v_motivo) > 300) then
    return json_build_object('ok', false, 'motivo', 'motivo_obrigatorio');
  end if;

  select cp.* into v from public.gostoso_club_partners cp where cp.id = p_partner for update;
  if not found then
    return json_build_object('ok', false, 'motivo', 'nao_encontrado');
  end if;
  if v.status <> 'em_analise' then
    return json_build_object('ok', false, 'motivo', 'nao_esta_em_analise', 'status', v.status);
  end if;

  if p_aprovar then
    update public.gostoso_club_partners cp
       set status = 'no_ar', motivo_recusa = null, analisado_em = now(), analisado_por = auth.uid(),
           aprovado_hash = public.gostoso_club_hash_conteudo(to_jsonb(cp))
     where cp.id = p_partner;
    return json_build_object('ok', true, 'status', 'no_ar');
  end if;

  update public.gostoso_club_partners cp
     set status = 'rejeitado', motivo_recusa = v_motivo, analisado_em = now(), analisado_por = auth.uid()
   where cp.id = p_partner;
  return json_build_object('ok', true, 'status', 'rejeitado');
end
$$;

revoke all on function public.gostoso_club_analise_fila(), public.gostoso_club_analise_decidir(uuid, boolean, text)
  from public, anon;
grant execute on function public.gostoso_club_analise_fila(), public.gostoso_club_analise_decidir(uuid, boolean, text)
  to authenticated, service_role;
