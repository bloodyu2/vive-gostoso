-- Passaporte Gostoso: perguntar ao cliente se usou o voucher, KAN-896, 16/11/2026.
--
-- Decisao do Victor (cartao Item 126): os parceiros nao fazem login nem dao baixa nos
-- vouchers, entao todo resgate fica "valido" para sempre. Um dia depois do resgate o
-- sistema pergunta ao cliente, por e-mail, se ele usou. Se a resposta for sim, grava
-- usado_em e usado_via = 'cliente'. Nao ha PIN de parceiro.
--
-- CONSENTIMENTO. O consentimento gravado nos resgates anteriores (versao 2026-10-28)
-- autoriza so o REPASSE ao parceiro, "para que ele me procure sobre esta vantagem". Nao
-- autoriza o Vive Gostoso a escrever para a pessoa. Por isso a pergunta tem consentimento
-- proprio, opcional e separado (colunas pergunta_*), gravado a parte; quem nao aceitou
-- nunca recebe a pergunta. Os resgates antigos NAO recebem nada ate o Victor decidir.
--
-- O que entra:
--   usado_via aceita 'cliente'
--   colunas: pergunta_aceita_em, pergunta_versao, pergunta_texto, pergunta_idioma,
--            resposta_token (link do e-mail, distinto do token do cupom), pergunta_enviada_em,
--            pergunta_tentativas, resposta_uso ('sim' | 'nao'), resposta_em
--   funcoes publicas (anon): gostoso_club_aceitar_pergunta, gostoso_club_pergunta_dados,
--            gostoso_club_responder_uso. Aceitam o token do cupom OU o token da pergunta.
--   funcoes do servico (service_role): gostoso_club_pergunta_reservar, gostoso_club_pergunta_contar,
--            gostoso_club_pergunta_falhou
--   dono ou admin: gostoso_club_uso_painel(partner)
--   view so do servico: gostoso_club_uso_mensal (HUB)
--
-- Reverter:
--   drop view if exists public.gostoso_club_uso_mensal;
--   drop function if exists public.gostoso_club_uso_painel(uuid);
--   drop function if exists public.gostoso_club_pergunta_contar(timestamptz);
--   drop function if exists public.gostoso_club_pergunta_falhou(uuid);
--   drop function if exists public.gostoso_club_pergunta_reservar(integer, timestamptz);
--   drop function if exists public.gostoso_club_responder_uso(text, boolean);
--   drop function if exists public.gostoso_club_pergunta_dados(text);
--   drop function if exists public.gostoso_club_aceitar_pergunta(text, text, text, text);
--   alter table public.gostoso_club_vouchers drop column pergunta_aceita_em, drop column pergunta_versao,
--     drop column pergunta_texto, drop column pergunta_idioma, drop column resposta_token,
--     drop column pergunta_enviada_em, drop column pergunta_tentativas, drop column resposta_uso,
--     drop column resposta_em;   (antes, trocar os usado_via = 'cliente' por 'painel')

-- ── usado_via aceita 'cliente' ──────────────────────────────────────────────

do $$
declare
  c text;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.gostoso_club_vouchers'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) like '%usado_via%'
  loop
    execute format('alter table public.gostoso_club_vouchers drop constraint %I', c);
  end loop;
end
$$;

alter table public.gostoso_club_vouchers
  add constraint gostoso_club_vouchers_usado_via_check
  check (usado_via is null or usado_via in ('painel', 'codigo', 'cliente'));

-- ── colunas da pergunta ─────────────────────────────────────────────────────

alter table public.gostoso_club_vouchers
  add column if not exists pergunta_aceita_em   timestamptz,
  add column if not exists pergunta_versao      text,
  add column if not exists pergunta_texto       text,
  add column if not exists pergunta_idioma      text,
  add column if not exists resposta_token       text not null
    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  add column if not exists pergunta_enviada_em  timestamptz,
  add column if not exists pergunta_tentativas  integer not null default 0,
  add column if not exists resposta_uso         text,
  add column if not exists resposta_em          timestamptz;

alter table public.gostoso_club_vouchers drop constraint if exists gostoso_club_vouchers_pergunta_check;
alter table public.gostoso_club_vouchers add constraint gostoso_club_vouchers_pergunta_check check (
  resposta_token ~ '^[0-9a-f]{64}$'
  and (pergunta_versao is null or pergunta_versao ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
  and (pergunta_texto is null or char_length(pergunta_texto) between 20 and 600)
  and (pergunta_idioma is null or pergunta_idioma in ('pt', 'en', 'es'))
  and (resposta_uso is null or resposta_uso in ('sim', 'nao'))
  and ((resposta_uso is null) = (resposta_em is null))
  -- aceitar a pergunta grava os quatro campos juntos
  and ((pergunta_aceita_em is null) = (pergunta_versao is null))
  and ((pergunta_aceita_em is null) = (pergunta_texto is null))
  and ((pergunta_aceita_em is null) = (pergunta_idioma is null))
);

create unique index if not exists idx_gostoso_club_vouchers_resposta_token
  on public.gostoso_club_vouchers (resposta_token);
create index if not exists idx_gostoso_club_vouchers_pergunta_fila
  on public.gostoso_club_vouchers (created_at)
  where pergunta_aceita_em is not null and pergunta_enviada_em is null and status = 'valido';

-- Os grants por coluna de authenticated (migracao 20261029120000) nao incluem estas colunas:
-- o dono do negocio nao le o token da pergunta nem o consentimento da pergunta. Sem grant novo.

-- ── aceitar a pergunta (consentimento proprio) ──────────────────────────────
-- Chamada logo depois do resgate, por quem tem o token do cupom. Grava o texto exato que a
-- pessoa leu e o idioma do e-mail. Uma vez gravado, nao muda.

create or replace function public.gostoso_club_aceitar_pergunta(
  p_token  text,
  p_versao text,
  p_texto  text,
  p_idioma text
) returns json
  language plpgsql security definer set search_path = public as
$$
declare
  v public.gostoso_club_vouchers%rowtype;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return json_build_object('ok', false, 'motivo', 'invalido');
  end if;
  if p_versao is null or p_versao !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
     or p_texto is null or char_length(p_texto) not between 20 and 600
     or p_idioma is null or p_idioma not in ('pt', 'en', 'es') then
    return json_build_object('ok', false, 'motivo', 'consentimento');
  end if;

  select v2.* into v
    from public.gostoso_club_vouchers v2
   where v2.token = p_token or v2.resposta_token = p_token
   for update;
  if not found then
    return json_build_object('ok', false, 'motivo', 'invalido');
  end if;
  if v.status = 'cancelado' then
    return json_build_object('ok', false, 'motivo', 'cancelado');
  end if;
  if v.pergunta_aceita_em is not null then
    return json_build_object('ok', true, 'ja_aceito', true);
  end if;
  -- o texto tem que citar o Vive Gostoso e a pergunta, e nao pode ser um texto qualquer
  if p_texto not ilike '%vive gostoso%' then
    return json_build_object('ok', false, 'motivo', 'consentimento');
  end if;

  update public.gostoso_club_vouchers
     set pergunta_aceita_em = now(),
         pergunta_versao = p_versao,
         pergunta_texto = p_texto,
         pergunta_idioma = p_idioma
   where id = v.id;
  return json_build_object('ok', true, 'ja_aceito', false);
end
$$;
revoke execute on function public.gostoso_club_aceitar_pergunta(text, text, text, text) from public;
grant execute on function public.gostoso_club_aceitar_pergunta(text, text, text, text) to anon, authenticated, service_role;

-- ── dados da pagina "Voce usou?" ────────────────────────────────────────────
-- So primeiro nome, negocio, vantagem, status e a resposta ja dada. Nunca e-mail nem telefone.

create or replace function public.gostoso_club_pergunta_dados(p_token text) returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v record;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return json_build_object('status', 'invalido');
  end if;
  select v2.status, v2.nome, v2.resposta_uso, v2.codigo, v2.expira_em, btrim(b.name) as negocio, b.slug, cp.beneficio
    into v
    from public.gostoso_club_vouchers v2
    join public.gostoso_businesses b on b.id = v2.business_id
    join public.gostoso_club_partners cp on cp.id = v2.partner_id
   where v2.token = p_token or v2.resposta_token = p_token;
  if not found then
    return json_build_object('status', 'invalido');
  end if;
  return json_build_object(
    'status', v.status,
    'primeiro_nome', split_part(v.nome, ' ', 1),
    'negocio', v.negocio,
    'slug', v.slug,
    'beneficio', v.beneficio,
    'codigo', v.codigo,
    'expira_em', v.expira_em,
    'resposta', v.resposta_uso
  );
end
$$;
revoke execute on function public.gostoso_club_pergunta_dados(text) from public;
grant execute on function public.gostoso_club_pergunta_dados(text) to anon, authenticated, service_role;

-- ── responder: usou ou nao ──────────────────────────────────────────────────
-- Sim: o cupom vira usado, com usado_via = 'cliente' (se o parceiro ja tinha dado baixa,
-- fica a baixa dele e so a resposta e registrada). Sim e definitivo. Nao: registra a
-- resposta e o cupom continua valido; a pessoa pode responder sim depois, pelo mesmo link.

create or replace function public.gostoso_club_responder_uso(p_token text, p_usou boolean) returns json
  language plpgsql security definer set search_path = public as
$$
declare
  v public.gostoso_club_vouchers%rowtype;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' or p_usou is null then
    return json_build_object('ok', false, 'motivo', 'invalido');
  end if;

  select v2.* into v
    from public.gostoso_club_vouchers v2
   where v2.token = p_token or v2.resposta_token = p_token
   for update;
  if not found then
    return json_build_object('ok', false, 'motivo', 'invalido');
  end if;
  if v.status = 'cancelado' then
    return json_build_object('ok', false, 'motivo', 'cancelado');
  end if;
  if v.resposta_uso = 'sim' then
    return json_build_object('ok', true, 'resposta', 'sim', 'ja_respondido', true);
  end if;

  if p_usou then
    update public.gostoso_club_vouchers
       set resposta_uso = 'sim',
           resposta_em = now(),
           status = 'usado',
           usado_em = coalesce(usado_em, now()),
           usado_via = coalesce(usado_via, 'cliente')
     where id = v.id;
    return json_build_object('ok', true, 'resposta', 'sim', 'ja_respondido', false);
  end if;

  update public.gostoso_club_vouchers
     set resposta_uso = 'nao',
         resposta_em = now()
   where id = v.id;
  return json_build_object('ok', true, 'resposta', 'nao', 'ja_respondido', v.resposta_uso = 'nao');
end
$$;
revoke execute on function public.gostoso_club_responder_uso(text, boolean) from public;
grant execute on function public.gostoso_club_responder_uso(text, boolean) to anon, authenticated, service_role;

-- ── fila do envio (so o servico) ────────────────────────────────────────────
-- Reserva, de uma vez e sem repetir, os resgates que ja devem receber a pergunta:
--   aceitaram a pergunta, ainda "valido", sem resposta, nunca reservados, criados em um dia
--   anterior (hora de Fortaleza) e ha pelo menos 12 horas, e no maximo 7 dias atras, para
--   uma parada do envio nao despejar mensagem velha. p_agora existe para o teste fixar o relogio;
--   a rota nao o passa. Marca pergunta_enviada_em NA RESERVA:
--   a mesma pessoa nunca recebe duas vezes. Se o envio falhar, gostoso_club_pergunta_falhou
--   devolve para a fila, ate 3 tentativas.

create or replace function public.gostoso_club_pergunta_reservar(
  p_limite integer default 50,
  p_agora  timestamptz default now()
)
  returns table (
    id uuid,
    nome text,
    email text,
    idioma text,
    resposta_token text,
    negocio text,
    beneficio text,
    codigo text,
    expira_em date
  )
  language plpgsql security definer set search_path = public as
$$
begin
  return query
  with alvo as (
    select v2.id
      from public.gostoso_club_vouchers v2
     where v2.pergunta_aceita_em is not null
       and v2.pergunta_enviada_em is null
       and v2.resposta_uso is null
       and v2.status = 'valido'
       and v2.pergunta_tentativas < 3
       and v2.created_at <= p_agora - interval '12 hours'
       and v2.created_at > p_agora - interval '7 days'
       and (v2.created_at at time zone 'America/Fortaleza')::date < (p_agora at time zone 'America/Fortaleza')::date
     order by v2.created_at
     limit greatest(1, least(coalesce(p_limite, 50), 200))
     for update skip locked
  ),
  marcado as (
    update public.gostoso_club_vouchers v3
       set pergunta_enviada_em = now()
      from alvo
     where v3.id = alvo.id
    returning v3.id, v3.nome, v3.email, v3.pergunta_idioma, v3.resposta_token,
              v3.business_id, v3.partner_id, v3.codigo, v3.expira_em
  )
  select m.id, m.nome, m.email, m.pergunta_idioma, m.resposta_token,
         btrim(b.name), cp.beneficio, m.codigo, m.expira_em
    from marcado m
    join public.gostoso_businesses b on b.id = m.business_id
    join public.gostoso_club_partners cp on cp.id = m.partner_id;
end
$$;
revoke execute on function public.gostoso_club_pergunta_reservar(integer, timestamptz) from public, anon, authenticated;
grant execute on function public.gostoso_club_pergunta_reservar(integer, timestamptz) to service_role;

-- Quantos estariam na fila agora, sem reservar nada (ensaio da rota, so o servico chama).
create or replace function public.gostoso_club_pergunta_contar(p_agora timestamptz default now()) returns integer
  language sql stable security definer set search_path = public as
$$
  select count(*)::integer
    from public.gostoso_club_vouchers v2
   where v2.pergunta_aceita_em is not null
     and v2.pergunta_enviada_em is null
     and v2.resposta_uso is null
     and v2.status = 'valido'
     and v2.pergunta_tentativas < 3
     and v2.created_at <= p_agora - interval '12 hours'
     and v2.created_at > p_agora - interval '7 days'
     and (v2.created_at at time zone 'America/Fortaleza')::date < (p_agora at time zone 'America/Fortaleza')::date;
$$;
revoke execute on function public.gostoso_club_pergunta_contar(timestamptz) from public, anon, authenticated;
grant execute on function public.gostoso_club_pergunta_contar(timestamptz) to service_role;

create or replace function public.gostoso_club_pergunta_falhou(p_id uuid) returns void
  language sql security definer set search_path = public as
$$
  update public.gostoso_club_vouchers
     set pergunta_enviada_em = null,
         pergunta_tentativas = pergunta_tentativas + 1
   where id = p_id and resposta_uso is null;
$$;
revoke execute on function public.gostoso_club_pergunta_falhou(uuid) from public, anon, authenticated;
grant execute on function public.gostoso_club_pergunta_falhou(uuid) to service_role;

-- ── numeros de uso ──────────────────────────────────────────────────────────
-- Por parceiro (dono ou admin). usados = baixa do parceiro + resposta do cliente. A resposta
-- do cliente aparece separada para o parceiro e o Victor verem de onde veio o numero.

create or replace function public.gostoso_club_uso_painel(p_partner uuid) returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v_cp public.gostoso_club_partners%rowtype;
begin
  select cp.* into v_cp from public.gostoso_club_partners cp where cp.id = p_partner;
  if not found then return null; end if;
  if not (public.gostoso_club_sou_dono(v_cp.business_id) or public.gostoso_is_admin()) then
    return null;
  end if;

  return (
    select json_build_object(
      'resgates', count(*) filter (where v.status <> 'cancelado'),
      'usados', count(*) filter (where v.status = 'usado'),
      'usados_pelo_parceiro', count(*) filter (where v.status = 'usado' and v.usado_via in ('painel', 'codigo')),
      'usados_pelo_cliente', count(*) filter (where v.status = 'usado' and v.usado_via = 'cliente'),
      'perguntas_enviadas', count(*) filter (where v.pergunta_enviada_em is not null),
      'respostas', count(*) filter (where v.resposta_uso is not null),
      'respostas_sim', count(*) filter (where v.resposta_uso = 'sim'),
      'respostas_nao', count(*) filter (where v.resposta_uso = 'nao'),
      'sem_resposta', count(*) filter (where v.pergunta_enviada_em is not null and v.resposta_uso is null)
    )
    from public.gostoso_club_vouchers v
    where v.partner_id = p_partner
  );
end
$$;
revoke execute on function public.gostoso_club_uso_painel(uuid) from public, anon;
grant execute on function public.gostoso_club_uso_painel(uuid) to authenticated, service_role;

-- Por parceiro e por mes, so para o servico (HUB e relatorios). Sem dado pessoal.
create or replace view public.gostoso_club_uso_mensal as
  select v.partner_id,
         v.business_id,
         date_trunc('month', v.created_at at time zone 'America/Fortaleza')::date as mes,
         count(*) filter (where v.status <> 'cancelado')::int as resgates,
         count(*) filter (where v.status = 'usado')::int as usados,
         count(*) filter (where v.status = 'usado' and v.usado_via in ('painel', 'codigo'))::int as usados_pelo_parceiro,
         count(*) filter (where v.status = 'usado' and v.usado_via = 'cliente')::int as usados_pelo_cliente,
         count(*) filter (where v.pergunta_aceita_em is not null)::int as aceitaram_a_pergunta,
         count(*) filter (where v.pergunta_enviada_em is not null)::int as perguntas_enviadas,
         count(*) filter (where v.resposta_uso = 'sim')::int as respostas_sim,
         count(*) filter (where v.resposta_uso = 'nao')::int as respostas_nao
    from public.gostoso_club_vouchers v
   group by v.partner_id, v.business_id, 3;
revoke all on public.gostoso_club_uso_mensal from public, anon, authenticated;
grant select on public.gostoso_club_uso_mensal to service_role;
