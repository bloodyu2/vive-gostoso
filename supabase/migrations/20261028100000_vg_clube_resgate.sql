-- Passaporte Gostoso: resgate com cadastro e cupom de uso unico, 28/10/2026.
--
-- Decisao do Victor (28/10): ao resgatar, a pessoa informa nome, e-mail e telefone e
-- autoriza o repasse ao estabelecimento. O sistema gera um cupom (token longo e um
-- codigo curto) que vale para UMA compra. Os dados viram a lista de resgates de cada
-- parceiro, visivel so para ele, depois do login. Isso SUBSTITUI o fluxo de "codigo do
-- dia" sem cadastro da migracao 20261026120000, que nao e reescrita: aqui a funcao
-- gostoso_club_usar perde o acesso do publico, e vantagens e painel passam a contar
-- resgates.
--
-- O que entra:
--   gostoso_club_vouchers      um resgate por linha: dados da pessoa, consentimento
--                              (data, versao da politica, texto exibido), status e validade
--   view gostoso_club_resgates_mensais   resgates e usos por parceiro por mes
--   funcoes: gostoso_club_resgatar, gostoso_club_verificar, gostoso_club_cupom,
--            gostoso_club_marcar_usado, gostoso_club_limpar_resgates
--   redefinidas (mesma assinatura): gostoso_club_vantagens, gostoso_club_painel
--
-- Quem acessa o que:
--   anon           so as funcoes resgatar, verificar e cupom; nenhuma leitura de tabela
--   authenticated  le os resgates do PROPRIO negocio (dono) ou todos (admin), sem as colunas
--                  token, aparelho e consentimento_texto; marca como usado pela funcao;
--                  nao escreve na tabela
--   service_role   tudo (inclui a limpeza por prazo)
--
-- DADOS PESSOAIS (LGPD). Nao ha cifra de coluna: a chave ficaria no mesmo banco que os
-- dados, entao nao protegeria de quem le o banco. A protecao e acesso: RLS, grants por
-- coluna e funcoes SECURITY DEFINER com validacao. A cifra do disco e do provedor
-- (Supabase) e nao foi verificada por este projeto. Retencao: a funcao
-- gostoso_club_limpar_resgates(meses) apaga o que passou do prazo; agendar (pg_cron, que
-- nao esta instalado) e passo operacional, nao automatico.
--
-- REVERSAO (rodar para desfazer; devolve a funcao antiga de uso ao publico):
--   drop view if exists public.gostoso_club_resgates_mensais;
--   drop function if exists public.gostoso_club_limpar_resgates(integer);
--   drop function if exists public.gostoso_club_marcar_usado(uuid, uuid, text);
--   drop function if exists public.gostoso_club_cupom(text);
--   drop function if exists public.gostoso_club_verificar(text);
--   drop function if exists public.gostoso_club_resgatar(uuid, text, text, text, boolean, text, text, text, text, text);
--   drop function if exists public.gostoso_club__codigo_cupom();
--   drop table if exists public.gostoso_club_vouchers;
--   grant execute on function public.gostoso_club_usar(uuid, text, text) to anon, authenticated;
--   (gostoso_club_vantagens e gostoso_club_painel: reaplicar as versoes de 20261026120000)

-- ── tabela ──────────────────────────────────────────────────────────────────

create table if not exists public.gostoso_club_vouchers (
  id                    uuid primary key default gen_random_uuid(),
  partner_id            uuid not null references public.gostoso_club_partners(id) on delete cascade,
  business_id           uuid not null references public.gostoso_businesses(id) on delete cascade,
  -- 64 hex = dois UUID v4 (244 bits aleatorios do gerador do Postgres); e o segredo do cupom
  token                 text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
                          check (token ~ '^[0-9a-f]{64}$'),
  codigo                text not null check (codigo ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$'),
  nome                  text not null check (char_length(nome) between 2 and 80),
  email                 text not null check (char_length(email) between 5 and 254),
  telefone              text not null check (telefone ~ '^[1-9][0-9]{9,10}$'),
  consentimento_em      timestamptz not null default now(),
  consentimento_versao  text not null check (consentimento_versao ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  consentimento_texto   text not null check (char_length(consentimento_texto) between 20 and 600),
  status                text not null default 'valido' check (status in ('valido', 'usado', 'cancelado')),
  expira_em             date not null,
  usado_em              timestamptz,
  usado_via             text check (usado_via is null or usado_via in ('painel', 'codigo')),
  origem                text check (origem is null or origem ~ '^[0-9]{2}$'),
  aparelho              text check (aparelho is null or aparelho ~ '^[0-9a-f-]{36}$'),
  created_at            timestamptz not null default now(),
  constraint gostoso_club_vouchers_usado_coerente check ((status = 'usado') = (usado_em is not null))
);

create unique index if not exists idx_gostoso_club_vouchers_codigo
  on public.gostoso_club_vouchers (partner_id, codigo);
create index if not exists idx_gostoso_club_vouchers_partner
  on public.gostoso_club_vouchers (partner_id, created_at desc);
create index if not exists idx_gostoso_club_vouchers_email
  on public.gostoso_club_vouchers (partner_id, lower(email));
create index if not exists idx_gostoso_club_vouchers_aparelho
  on public.gostoso_club_vouchers (aparelho, created_at desc) where aparelho is not null;

-- ── RLS e grants ────────────────────────────────────────────────────────────

alter table public.gostoso_club_vouchers enable row level security;

drop policy if exists "club_vouchers_owner_read" on public.gostoso_club_vouchers;
create policy "club_vouchers_owner_read" on public.gostoso_club_vouchers
  for select to authenticated
  using (
    public.gostoso_club_sou_dono(gostoso_club_vouchers.business_id)
    or public.gostoso_is_admin()
  );

revoke all on public.gostoso_club_vouchers from anon, authenticated;
grant select (id, partner_id, business_id, codigo, nome, email, telefone, status, expira_em,
              usado_em, usado_via, origem, created_at, consentimento_em, consentimento_versao)
  on public.gostoso_club_vouchers to authenticated;
grant all on public.gostoso_club_vouchers to service_role;

-- A funcao antiga de uso (codigo do dia, sem cadastro) sai do alcance do publico.
revoke execute on function public.gostoso_club_usar(uuid, text, text) from anon, authenticated;

-- ── codigo curto ────────────────────────────────────────────────────────────
-- 8 caracteres de um alfabeto sem 0, O, 1, I e L, sorteados com bytes do gerador seguro.

create or replace function public.gostoso_club__codigo_cupom() returns text
  language plpgsql volatile set search_path = public as
$$
declare
  v_alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea := decode(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'hex');
  v_codigo text := '';
  i integer;
begin
  for i in 0 .. 7 loop
    v_codigo := v_codigo || substr(v_alfabeto, (get_byte(v_bytes, i) % 31) + 1, 1);
  end loop;
  return v_codigo;
end
$$;
revoke execute on function public.gostoso_club__codigo_cupom() from public, anon, authenticated;
grant execute on function public.gostoso_club__codigo_cupom() to service_role;

-- ── chave do e-mail ─────────────────────────────────────────────────────────
-- Para o "um cupom ativo por e-mail": minuscula, sem o +etiqueta da parte local e, no
-- Gmail, sem pontos. Assim ana+1@gmail.com e a.na@gmail.com contam como ana@gmail.com.

create or replace function public.gostoso_club__email_chave(p_email text) returns text
  language sql immutable set search_path = public as
$$
  select case
    when lower(split_part(lower(btrim(p_email)), '@', 2)) in ('gmail.com', 'googlemail.com')
      then replace(split_part(split_part(lower(btrim(p_email)), '@', 1), '+', 1), '.', '') || '@gmail.com'
    else split_part(split_part(lower(btrim(p_email)), '@', 1), '+', 1) || '@' || split_part(lower(btrim(p_email)), '@', 2)
  end
$$;
revoke execute on function public.gostoso_club__email_chave(text) from public, anon, authenticated;
grant execute on function public.gostoso_club__email_chave(text) to service_role;

create index if not exists idx_gostoso_club_vouchers_email_chave
  on public.gostoso_club_vouchers (partner_id, (public.gostoso_club__email_chave(email)));

-- ── resgatar ────────────────────────────────────────────────────────────────
-- Devolve {ok:true, token, codigo, expira_em, negocio, beneficio} ou {ok:false, motivo}.
-- Motivos: consentimento, nome, email, telefone, indisponivel, ja_tem, esgotada, muitos.
-- Validacao igual a de src/lib/clube/resgate.ts, porque o navegador nao e confiavel.
-- p_isca e um campo escondido no formulario: robo preenche, pessoa nao.

create or replace function public.gostoso_club_resgatar(
  p_partner      uuid,
  p_nome         text,
  p_email        text,
  p_telefone     text,
  p_consentimento boolean,
  p_versao       text,
  p_texto        text,
  p_origem       text default null,
  p_aparelho     text default null,
  p_isca         text default null
) returns json
  language plpgsql security definer set search_path = public as
$$
declare
  v_nome      text := btrim(regexp_replace(coalesce(p_nome, ''), '[[:space:]]+', ' ', 'g'));
  v_email     text := lower(btrim(coalesce(p_email, '')));
  v_tel       text := regexp_replace(coalesce(p_telefone, ''), '[^0-9]', '', 'g');
  v_origem    text := case when p_origem ~ '^[0-9]{2}$' then p_origem else null end;
  v_aparelho  text := case when p_aparelho ~ '^[0-9a-f-]{36}$' then p_aparelho else null end;
  v_cp        public.gostoso_club_partners%rowtype;
  v_negocio   text;
  v_usos_mes  integer;
  v_expira    date;
  v_codigo    text;
  v_token     text;
  v_tentativa integer := 0;
begin
  if coalesce(btrim(p_isca), '') <> '' then
    return json_build_object('ok', false, 'motivo', 'muitos');
  end if;

  -- consentimento explicito, com versao da politica e o texto que a pessoa leu
  -- A versao tem de ser uma das que a politica publicou (lista abaixo; politica nova
  -- entra aqui numa migracao). O texto e conferido adiante contra o nome do negocio.
  if p_consentimento is not true
     or p_versao is null or p_versao not in ('2026-10-28')
     or char_length(coalesce(p_texto, '')) not between 20 and 600 then
    return json_build_object('ok', false, 'motivo', 'consentimento');
  end if;

  if char_length(v_nome) not between 2 and 80 then
    return json_build_object('ok', false, 'motivo', 'nome');
  end if;

  if char_length(v_email) not between 5 and 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:].][^@[:space:]]*[.][^@[:space:].]+$'
     or position('..' in v_email) > 0 then
    return json_build_object('ok', false, 'motivo', 'email');
  end if;

  if char_length(v_tel) in (12, 13) and left(v_tel, 2) = '55' then
    v_tel := substr(v_tel, 3);
  end if;
  if char_length(v_tel) not in (10, 11)
     or coalesce(nullif(left(v_tel, 2), '')::integer, 0) not between 11 and 99
     or (char_length(v_tel) = 11 and substr(v_tel, 3, 1) <> '9') then
    return json_build_object('ok', false, 'motivo', 'telefone');
  end if;

  perform pg_advisory_xact_lock(hashtext('club-resgate:' || p_partner::text));

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
  select b.name into v_negocio from public.gostoso_businesses b where b.id = v_cp.business_id;

  -- o texto que a pessoa leu tem de citar o negocio que vai receber os dados e comecar com
  -- o verbo de autorizacao de um dos tres idiomas; o que nao bate nao vira "consentimento"
  if position(lower(v_negocio) in lower(p_texto)) = 0
     or p_texto !~* '^(autorizo|i agree|i authorize)' then
    return json_build_object('ok', false, 'motivo', 'consentimento');
  end if;

  -- um cupom ativo por e-mail por parceiro (nao devolvemos o token do existente: o e-mail
  -- digitado nao foi confirmado, e entregar o cupom a quem sabe o e-mail seria um vazamento)
  if exists (
    select 1 from public.gostoso_club_vouchers v
     where v.partner_id = v_cp.id
       and public.gostoso_club__email_chave(v.email) = public.gostoso_club__email_chave(v_email)
       and v.status = 'valido'
       and v.expira_em >= public.gostoso_club_hoje()
  ) then
    return json_build_object('ok', false, 'motivo', 'ja_tem');
  end if;

  -- limite do mes: conta os cupons emitidos (cancelados nao contam)
  select count(*) into v_usos_mes from public.gostoso_club_vouchers v
   where v.partner_id = v_cp.id and v.status <> 'cancelado'
     and v.created_at >= public.gostoso_club_inicio_do_mes();
  if v_cp.limite_mensal is not null and v_usos_mes >= v_cp.limite_mensal then
    return json_build_object('ok', false, 'motivo', 'esgotada');
  end if;

  -- anti-abuso: 3 resgates por aparelho por dia (qualquer parceiro), 5 por minuto e 30 por
  -- hora por parceiro. O aparelho e informado pelo navegador, entao so freia o uso normal;
  -- quem chama a funcao direto esbarra nos tetos por parceiro.
  if v_aparelho is not null and (
       select count(*) from public.gostoso_club_vouchers v
        where v.aparelho = v_aparelho and v.created_at > now() - interval '1 day') >= 3 then
    return json_build_object('ok', false, 'motivo', 'muitos');
  end if;
  if (select count(*) from public.gostoso_club_vouchers v
       where v.partner_id = v_cp.id and v.created_at > now() - interval '1 minute') >= 5 then
    return json_build_object('ok', false, 'motivo', 'muitos');
  end if;
  if (select count(*) from public.gostoso_club_vouchers v
       where v.partner_id = v_cp.id and v.created_at > now() - interval '1 hour') >= 30 then
    return json_build_object('ok', false, 'motivo', 'muitos');
  end if;

  v_expira := least(public.gostoso_club_hoje() + 30, coalesce(v_cp.valido_ate, public.gostoso_club_hoje() + 30));

  loop
    v_codigo := public.gostoso_club__codigo_cupom();
    exit when not exists (
      select 1 from public.gostoso_club_vouchers v where v.partner_id = v_cp.id and v.codigo = v_codigo
    );
    v_tentativa := v_tentativa + 1;
    if v_tentativa > 10 then
      return json_build_object('ok', false, 'motivo', 'indisponivel');
    end if;
  end loop;

  insert into public.gostoso_club_vouchers
    (partner_id, business_id, codigo, nome, email, telefone,
     consentimento_versao, consentimento_texto, expira_em, origem, aparelho)
  values
    (v_cp.id, v_cp.business_id, v_codigo, v_nome, v_email, v_tel,
     p_versao, p_texto, v_expira, v_origem, v_aparelho)
  returning token into v_token;

  return json_build_object(
    'ok', true,
    'token', v_token,
    'codigo', v_codigo,
    'expira_em', v_expira,
    'negocio', v_negocio,
    'beneficio', v_cp.beneficio
  );
end
$$;
revoke execute on function public.gostoso_club_resgatar(uuid, text, text, text, boolean, text, text, text, text, text) from public;
grant execute on function public.gostoso_club_resgatar(uuid, text, text, text, boolean, text, text, text, text, text)
  to anon, authenticated, service_role;

-- ── verificar (pagina que o QR abre) ────────────────────────────────────────
-- So status, primeiro nome e dados do cupom. Nunca e-mail, telefone ou nome inteiro.

create or replace function public.gostoso_club_verificar(p_token text) returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v record;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return json_build_object('status', 'invalido');
  end if;
  select v2.status, v2.nome, v2.codigo, v2.expira_em, v2.usado_em, b.name as negocio, b.slug, cp.beneficio
    into v
    from public.gostoso_club_vouchers v2
    join public.gostoso_businesses b on b.id = v2.business_id
    join public.gostoso_club_partners cp on cp.id = v2.partner_id
   where v2.token = p_token;
  if not found then
    return json_build_object('status', 'invalido');
  end if;
  return json_build_object(
    'status', case when v.status = 'valido' and v.expira_em < public.gostoso_club_hoje() then 'expirado' else v.status end,
    'primeiro_nome', split_part(v.nome, ' ', 1),
    'negocio', v.negocio,
    'slug', v.slug,
    'beneficio', v.beneficio,
    'codigo', v.codigo,
    'expira_em', v.expira_em,
    'usado_em', v.usado_em
  );
end
$$;
revoke execute on function public.gostoso_club_verificar(text) from public;
grant execute on function public.gostoso_club_verificar(text) to anon, authenticated, service_role;

-- ── cupom (pagina e imagem do titular) ──────────────────────────────────────
-- Quem tem o token e o titular: aqui volta o nome inteiro, para a imagem. Sem e-mail
-- nem telefone.

create or replace function public.gostoso_club_cupom(p_token text) returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v record;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return json_build_object('status', 'invalido');
  end if;
  select v2.status, v2.nome, v2.codigo, v2.expira_em, v2.usado_em, b.name as negocio, b.slug, cp.beneficio
    into v
    from public.gostoso_club_vouchers v2
    join public.gostoso_businesses b on b.id = v2.business_id
    join public.gostoso_club_partners cp on cp.id = v2.partner_id
   where v2.token = p_token;
  if not found then
    return json_build_object('status', 'invalido');
  end if;
  return json_build_object(
    'status', case when v.status = 'valido' and v.expira_em < public.gostoso_club_hoje() then 'expirado' else v.status end,
    'nome', v.nome,
    'negocio', v.negocio,
    'slug', v.slug,
    'beneficio', v.beneficio,
    'codigo', v.codigo,
    'expira_em', v.expira_em,
    'usado_em', v.usado_em
  );
end
$$;
revoke execute on function public.gostoso_club_cupom(text) from public;
grant execute on function public.gostoso_club_cupom(text) to anon, authenticated, service_role;

-- ── marcar como usado (parceiro logado) ─────────────────────────────────────
-- Por id (botao da lista) ou pelo codigo curto digitado. Uma vez so.
-- Motivos: sem_permissao, nao_encontrado, ja_usado, cancelado, expirado.

create or replace function public.gostoso_club_marcar_usado(
  p_partner uuid,
  p_voucher uuid default null,
  p_codigo  text default null
) returns json
  language plpgsql security definer set search_path = public as
$$
declare
  v_business uuid;
  v_codigo   text;
  v          public.gostoso_club_vouchers%rowtype;
begin
  select cp.business_id into v_business from public.gostoso_club_partners cp where cp.id = p_partner;
  if v_business is null
     or not (public.gostoso_club_sou_dono(v_business) or public.gostoso_is_admin()) then
    return json_build_object('ok', false, 'motivo', 'sem_permissao');
  end if;

  v_codigo := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  if char_length(v_codigo) = 10 and left(v_codigo, 2) = 'GP' then
    v_codigo := substr(v_codigo, 3);
  end if;

  select v2.* into v
    from public.gostoso_club_vouchers v2
   where v2.partner_id = p_partner
     and ((p_voucher is not null and v2.id = p_voucher)
          or (p_voucher is null and char_length(v_codigo) = 8 and v2.codigo = v_codigo))
   for update;
  if not found then
    return json_build_object('ok', false, 'motivo', 'nao_encontrado');
  end if;

  if v.status = 'usado' then
    return json_build_object('ok', false, 'motivo', 'ja_usado', 'usado_em', v.usado_em);
  end if;
  if v.status = 'cancelado' then
    return json_build_object('ok', false, 'motivo', 'cancelado');
  end if;
  if v.expira_em < public.gostoso_club_hoje() then
    return json_build_object('ok', false, 'motivo', 'expirado');
  end if;

  update public.gostoso_club_vouchers
     set status = 'usado',
         usado_em = now(),
         usado_via = case when p_voucher is not null then 'painel' else 'codigo' end
   where id = v.id;

  return json_build_object('ok', true, 'id', v.id, 'primeiro_nome', split_part(v.nome, ' ', 1), 'codigo', v.codigo);
end
$$;
revoke execute on function public.gostoso_club_marcar_usado(uuid, uuid, text) from public, anon;
grant execute on function public.gostoso_club_marcar_usado(uuid, uuid, text) to authenticated, service_role;

-- ── limpeza por prazo (retencao) ────────────────────────────────────────────
-- Apaga resgates com mais de p_meses meses. So o servico executa; o agendamento e
-- passo operacional (ver cabecalho).

create or replace function public.gostoso_club_limpar_resgates(p_meses integer default 12) returns integer
  language plpgsql security definer set search_path = public as
$$
declare
  v_n integer;
begin
  if p_meses is null or p_meses < 1 then
    raise exception 'prazo invalido';
  end if;
  delete from public.gostoso_club_vouchers
   where created_at < now() - make_interval(months => p_meses);
  get diagnostics v_n = row_count;
  return v_n;
end
$$;
revoke execute on function public.gostoso_club_limpar_resgates(integer) from public, anon, authenticated;
grant execute on function public.gostoso_club_limpar_resgates(integer) to service_role;

-- ── vantagens: "esgotada" agora conta resgates ──────────────────────────────

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
            select count(*) from public.gostoso_club_vouchers v
             where v.partner_id = cp.id
               and v.status <> 'cancelado'
               and v.created_at >= public.gostoso_club_inicio_do_mes()
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

-- ── painel: numeros do resgate ──────────────────────────────────────────────
-- Mesmas chaves de antes (o painel antigo nao quebra), mais resgates_mes, usados_mes e
-- ativos. Dias de pico passam a vir dos resgates.

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
    'resgates_mes', (select count(*) from public.gostoso_club_vouchers v
                      where v.partner_id = v_cp.id and v.status <> 'cancelado' and v.created_at >= v_inicio),
    'usados_mes', (select count(*) from public.gostoso_club_vouchers v
                    where v.partner_id = v_cp.id and v.status = 'usado' and v.usado_em >= v_inicio),
    'ativos', (select count(*) from public.gostoso_club_vouchers v
                where v.partner_id = v_cp.id and v.status = 'valido' and v.expira_em >= public.gostoso_club_hoje()),
    'vistas_mes', coalesce((select sum(w.n) from public.gostoso_club_views w
                  where w.partner_id = v_cp.id and w.dia >= (v_inicio at time zone 'America/Fortaleza')::date), 0),
    -- dias da semana (0 = domingo) com mais resgates nos ultimos 90 dias, ate dois
    'dias_de_pico', coalesce((
        select json_agg(x.dow order by x.n desc, x.dow)
          from (select extract(dow from v.created_at at time zone 'America/Fortaleza')::int as dow,
                       count(*) as n
                  from public.gostoso_club_vouchers v
                 where v.partner_id = v_cp.id and v.created_at > now() - interval '90 days'
                 group by 1 order by 2 desc, 1 limit 2) x
      ), '[]'::json),
    'usos', '[]'::json
  );
end
$$;
revoke execute on function public.gostoso_club_painel(uuid) from public, anon;
grant execute on function public.gostoso_club_painel(uuid) to authenticated, service_role;

-- ── resgates por mes ────────────────────────────────────────────────────────

create or replace view public.gostoso_club_resgates_mensais with (security_invoker = true) as
  select v.partner_id,
         v.business_id,
         date_trunc('month', v.created_at at time zone 'America/Fortaleza')::date as mes,
         count(*) filter (where v.status <> 'cancelado')::int as resgates,
         count(*) filter (where v.status = 'usado')::int as usados
    from public.gostoso_club_vouchers v
   group by v.partner_id, v.business_id, 3;
revoke all on public.gostoso_club_resgates_mensais from anon, authenticated;
grant select on public.gostoso_club_resgates_mensais to authenticated, service_role;

-- ── texto do parceiro fundador: o cupom substitui o codigo do dia ───────────
-- So troca a regra que a migracao de 26/10 gravou; se o dono ja editou, nao mexe.

update public.gostoso_club_partners
   set regra = 'Qualquer dia da semana. Mostre o cupom antes de pagar.'
 where regra = 'Qualquer dia da semana. Mostre o código antes de pagar.';
