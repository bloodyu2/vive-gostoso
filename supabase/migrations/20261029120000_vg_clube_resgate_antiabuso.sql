-- Passaporte Gostoso: protecao contra abuso do resgate e limpeza por prazo, 29/10/2026.
--
-- NAO APLICADA. Fica so como arquivo ate o deploy READY e a frase do Victor. Depende de
-- 20261026120000 e 20261028100000 (precisa de gostoso_club_vouchers e de gostoso_club_resgatar).
-- Compativel com o codigo antigo: a assinatura de gostoso_club_resgatar nao muda, e o
-- motivo novo ('limite_contato') cai no erro generico da tela antiga.
--
-- Sem service role e sem chave nova: tudo roda DENTRO de gostoso_club_resgatar, que o
-- navegador chama direto pelo PostgREST com a chave publica.
--
-- O que entra:
--   coluna gostoso_club_vouchers.ip_hash   hash do IP de quem resgatou (nunca o IP puro)
--   gostoso_club__ip_hash()                le o IP de current_setting('request.headers')
--   gostoso_club_resgatar (mesma assinatura, nova versao), com tres tetos novos:
--       15 cupons por hora e 40 por dia por IP (todos os parceiros)       -> 'muitos'
--       3 cupons por mes por e-mail (chave normalizada) por parceiro       -> 'limite_contato'
--       3 cupons por mes por telefone por parceiro                         -> 'limite_contato'
--   gostoso_club_manutencao()               apaga o que passou de 12 meses; chamada pelo
--                                           painel do parceiro (authenticated), nunca por anon
--
-- DE ONDE VEM O IP. O navegador chama o PostgREST do Supabase; o PostgREST entrega todos os
-- cabecalhos da requisicao na configuracao request.headers (JSON, chaves em minuscula). A
-- ordem de preferencia e cf-connecting-ip (posto pela Cloudflare na frente do Supabase,
-- que sobrescreve o que o cliente mandar), depois x-real-ip e, so como ultimo recurso, o
-- PRIMEIRO item de x-forwarded-for (esse o cliente pode forjar; forjar so desliga o teto,
-- nunca bloqueia outra pessoa). Sem nenhum dos tres, o teto por IP nao se aplica e valem os
-- demais. IPv6 conta pelo bloco /64 (a casa inteira), IPv4 pelo endereco.
-- NAO VERIFICADO EM PRODUCAO que o PostgREST recebe cf-connecting-ip: os logs de borda do
-- projeto mostram o cabecalho em 134 de 134 requisicoes da ultima hora, mas o que chega na
-- funcao so se ve depois de aplicar (consulta de conferencia no fim deste arquivo).
--
-- RISCO CONHECIDO. Operadoras moveis do Brasil usam CGNAT: muita gente divide um IPv4. 15 por
-- hora e 40 por dia deixam folga para o uso normal de uma cidade pequena; se a conferencia
-- pos-aplicacao mostrar que todos caem no mesmo hash, voltar a funcao anterior (reversao abaixo).
--
-- O hash e sha256 do IP com um prefixo fixo. Isso e pseudonimizacao, nao anonimizacao: quem
-- tiver o banco consegue testar enderecos. A coluna nao e legivel pelo parceiro (grant por coluna
-- de 20261028100000 nao a inclui) e e apagada junto com o resgate (12 meses). A politica de
-- privacidade cita isso.
--
-- REVERSAO (volta ao resgatar anterior; a coluna e a limpeza podem ficar):
--   reaplicar o `create or replace function public.gostoso_club_resgatar` de 20261028100000.
--   drop function if exists public.gostoso_club_manutencao();
--   drop function if exists public.gostoso_club__ip_hash();
--   alter table public.gostoso_club_vouchers drop column if exists ip_hash;
--
-- CONFERENCIA DEPOIS DE APLICAR (service role ou SQL do painel; faca 2 resgates de redes
-- diferentes e olhe se os hashes sao distintos e se nenhum e nulo):
--   select left(ip_hash, 8) as ip, count(*) from public.gostoso_club_vouchers
--    where created_at > now() - interval '1 day' group by 1 order by 2 desc;

-- ── coluna e indices ────────────────────────────────────────────────────────

alter table public.gostoso_club_vouchers
  add column if not exists ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$');

create index if not exists idx_gostoso_club_vouchers_ip
  on public.gostoso_club_vouchers (ip_hash, created_at desc) where ip_hash is not null;
create index if not exists idx_gostoso_club_vouchers_telefone
  on public.gostoso_club_vouchers (partner_id, telefone, created_at desc);
create index if not exists idx_gostoso_club_vouchers_criado
  on public.gostoso_club_vouchers (created_at);

-- grants por coluna: ip_hash NAO entra na lista do authenticated (ver 20261028100000).
-- Repetido aqui de forma idempotente, para o arquivo se provar sozinho.
revoke all on public.gostoso_club_vouchers from anon, authenticated;
grant select (id, partner_id, business_id, codigo, nome, email, telefone, status, expira_em,
              usado_em, usado_via, origem, created_at, consentimento_em, consentimento_versao)
  on public.gostoso_club_vouchers to authenticated;
grant all on public.gostoso_club_vouchers to service_role;

-- ── hash do IP ──────────────────────────────────────────────────────────────

create or replace function public.gostoso_club__ip_hash() returns text
  language plpgsql stable set search_path = public as
$$
declare
  v_raw text := nullif(current_setting('request.headers', true), '');
  v_h   json;
  v_ip  text;
  v_net inet;
  v_txt text;
begin
  if v_raw is null then
    return null;
  end if;
  begin
    v_h := v_raw::json;
  exception when others then
    return null;
  end;

  v_ip := coalesce(
    nullif(btrim(v_h->>'cf-connecting-ip'), ''),
    nullif(btrim(v_h->>'x-real-ip'), ''),
    nullif(btrim(split_part(coalesce(v_h->>'x-forwarded-for', ''), ',', 1)), '')
  );
  if v_ip is null or char_length(v_ip) > 45 then
    return null;
  end if;

  begin
    v_net := v_ip::inet;
  exception when others then
    return null;
  end;

  v_txt := case when family(v_net) = 6 then host(network(set_masklen(v_net, 64))) else host(v_net) end;
  return encode(sha256(convert_to('vg-club-ip-v1:' || v_txt, 'UTF8')), 'hex');
end
$$;
revoke execute on function public.gostoso_club__ip_hash() from public, anon, authenticated;
grant execute on function public.gostoso_club__ip_hash() to service_role;

-- ── resgatar, com os tetos novos ────────────────────────────────────────────
-- Devolve {ok:true, token, codigo, expira_em, negocio, beneficio} ou {ok:false, motivo}.
-- Motivos: consentimento, nome, email, telefone, indisponivel, ja_tem, esgotada, muitos,
-- limite_contato (novo: este e-mail ou telefone ja resgatou 3 vezes este parceiro no mes).

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
  v_ip_hash   text := public.gostoso_club__ip_hash();
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

  -- Travas sempre nesta ordem (parceiro, depois IP), para nunca haver impasse. A do IP
  -- faz duas chamadas simultaneas do mesmo IP em parceiros diferentes contarem uma a outra.
  perform pg_advisory_xact_lock(hashtext('club-resgate:' || p_partner::text));
  if v_ip_hash is not null then
    perform pg_advisory_xact_lock(hashtext('club-ip:' || v_ip_hash));
  end if;

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
  select btrim(b.name) into v_negocio from public.gostoso_businesses b where b.id = v_cp.business_id;

  if position(lower(v_negocio) in lower(p_texto)) = 0
     or p_texto !~* '^(autorizo|i agree|i authorize)' then
    return json_build_object('ok', false, 'motivo', 'consentimento');
  end if;

  if exists (
    select 1 from public.gostoso_club_vouchers v
     where v.partner_id = v_cp.id
       and public.gostoso_club__email_chave(v.email) = public.gostoso_club__email_chave(v_email)
       and v.status = 'valido'
       and v.expira_em >= public.gostoso_club_hoje()
  ) then
    return json_build_object('ok', false, 'motivo', 'ja_tem');
  end if;

  select count(*) into v_usos_mes from public.gostoso_club_vouchers v
   where v.partner_id = v_cp.id and v.status <> 'cancelado'
     and v.created_at >= public.gostoso_club_inicio_do_mes();
  if v_cp.limite_mensal is not null and v_usos_mes >= v_cp.limite_mensal then
    return json_build_object('ok', false, 'motivo', 'esgotada');
  end if;

  -- NOVO: teto por contato. Conta cupons de qualquer status (cancelar nao zera o teto) no
  -- mes de Gostoso. E-mail pela chave normalizada (ana+1@gmail.com e a.na@gmail.com sao
  -- ana@gmail.com). E-mail e telefone nao sao verificados: isto freia, nao autentica.
  if (select count(*) from public.gostoso_club_vouchers v
       where v.partner_id = v_cp.id
         and v.created_at >= public.gostoso_club_inicio_do_mes()
         and public.gostoso_club__email_chave(v.email) = public.gostoso_club__email_chave(v_email)) >= 3
     or (select count(*) from public.gostoso_club_vouchers v
          where v.partner_id = v_cp.id
            and v.created_at >= public.gostoso_club_inicio_do_mes()
            and v.telefone = v_tel) >= 3 then
    return json_build_object('ok', false, 'motivo', 'limite_contato');
  end if;

  -- NOVO: teto por IP, em todos os parceiros.
  if v_ip_hash is not null and (
       (select count(*) from public.gostoso_club_vouchers v
         where v.ip_hash = v_ip_hash and v.created_at > now() - interval '1 hour') >= 15
       or (select count(*) from public.gostoso_club_vouchers v
            where v.ip_hash = v_ip_hash and v.created_at > now() - interval '1 day') >= 40) then
    return json_build_object('ok', false, 'motivo', 'muitos');
  end if;

  -- anti-abuso que ja existia: 3 por aparelho por dia (o aparelho vem do navegador, entao so
  -- freia o uso normal), 5 por minuto e 30 por hora por parceiro.
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
     consentimento_versao, consentimento_texto, expira_em, origem, aparelho, ip_hash)
  values
    (v_cp.id, v_cp.business_id, v_codigo, v_nome, v_email, v_tel,
     p_versao, p_texto, v_expira, v_origem, v_aparelho, v_ip_hash)
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

-- ── limpeza por prazo (retencao de 12 meses) ────────────────────────────────
-- gostoso_club_limpar_resgates continua so do service_role. Esta e a porta que o painel do
-- parceiro usa: prazo FIXO (12 meses, o que a politica de privacidade promete), sem
-- parametro e sem retorno, entao quem chamar nao escolhe nada nem aprende nada. So
-- authenticated (dono ou admin logado); anon nao executa. Sem pg_cron e sem chave de servico.

create or replace function public.gostoso_club_manutencao() returns void
  language plpgsql security definer set search_path = public as
$$
begin
  perform public.gostoso_club_limpar_resgates(12);
end
$$;
revoke execute on function public.gostoso_club_manutencao() from public, anon;
grant execute on function public.gostoso_club_manutencao() to authenticated, service_role;
