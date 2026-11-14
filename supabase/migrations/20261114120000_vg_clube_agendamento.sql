-- Passaporte Gostoso: vantagem que exige agendamento previo (KAN-882, 14/11/2026).
--
-- Por que existe: a Casa Surya (yoga) so atende a primeira aula com hora marcada com a Satya. O cupom
-- precisa dizer isso, com o contato, para a pessoa nao chegar sem avisar. O campo e generico: serve a
-- escola de kite, de surf ou a qualquer parceiro que trabalhe com agenda.
--
-- Colunas novas em gostoso_club_partners:
--   requer_agendamento   boolean, padrao false. true = o cupom e o cartao avisam "agende antes".
--   agendamento_contato  WhatsApp so com digitos (10 a 15), com DDI. Vazio = usa o WhatsApp do negocio.
--   agendamento_com      com quem agendar ("Satya"), ate 40 caracteres. Vazio = o nome do negocio.
--
-- Funcoes: gostoso_club_vantagens ganha tres colunas no fim (precisa de drop, porque create or replace
-- nao muda as colunas que a funcao devolve); gostoso_club_cupom e gostoso_club_verificar ganham as mesmas
-- chaves no JSON. Compativel com o codigo antigo: ele ignora o que nao conhece, e o codigo novo trata a
-- ausencia das chaves como "nao exige agendamento". Pode rodar antes ou depois do deploy.
--
-- O dono do negocio pode ligar o aviso pelo painel (grant por coluna, como nas outras colunas da vantagem).
--
-- Dados: no fim, a Casa Surya passa a exigir agendamento com a Satya (WhatsApp do estudio) e a regra perde
-- o que a lista ja mostra por conta propria (limite de 5 por mes e validade). Idempotente.
--
-- REVERSAO (rodar para desfazer; depois reaplicar o `create or replace function` de gostoso_club_vantagens,
-- gostoso_club_cupom e gostoso_club_verificar de 20261028100000_vg_clube_resgate.sql):
--   drop function if exists public.gostoso_club_vantagens(uuid[]);
--   alter table public.gostoso_club_partners
--     drop column if exists requer_agendamento, drop column if exists agendamento_contato,
--     drop column if exists agendamento_com;

alter table public.gostoso_club_partners
  add column if not exists requer_agendamento boolean not null default false,
  add column if not exists agendamento_contato text,
  add column if not exists agendamento_com text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'gostoso_club_partners_agendamento_contato_chk') then
    alter table public.gostoso_club_partners
      add constraint gostoso_club_partners_agendamento_contato_chk
      check (agendamento_contato is null or agendamento_contato ~ '^[0-9]{10,15}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'gostoso_club_partners_agendamento_com_chk') then
    alter table public.gostoso_club_partners
      add constraint gostoso_club_partners_agendamento_com_chk
      check (agendamento_com is null or char_length(agendamento_com) <= 40);
  end if;
end
$$;

grant insert (requer_agendamento, agendamento_contato, agendamento_com)
  on public.gostoso_club_partners to authenticated;
grant update (requer_agendamento, agendamento_contato, agendamento_com)
  on public.gostoso_club_partners to authenticated;

-- ── vantagens publicas (a /clube, a /p/NN e a faixa do perfil) ──────────────

drop function if exists public.gostoso_club_vantagens(uuid[]);

create function public.gostoso_club_vantagens(p_business_ids uuid[] default null)
  returns table (
    partner_id          uuid,
    business_id         uuid,
    nome                text,
    slug                text,
    logo_url            text,
    capa_url            text,
    tipo                text,
    beneficio           text,
    regra               text,
    limite_mensal       integer,
    valido_ate          date,
    status              text,
    esgotada            boolean,
    requer_agendamento  boolean,
    agendamento_contato text,
    agendamento_com     text
  )
  language sql stable security definer set search_path = public as
$$
  select cp.id, b.id, btrim(b.name), b.slug, b.logo_url,
         coalesce(nullif(btrim(b.cover_url), ''), nullif(btrim(b.photos[1]), '')),
         coalesce(cp.tipo, c.name),
         cp.beneficio, cp.regra, cp.limite_mensal, cp.valido_ate, cp.status,
         (cp.limite_mensal is not null and (
            select count(*) from public.gostoso_club_vouchers v
             where v.partner_id = cp.id
               and v.status <> 'cancelado'
               and v.created_at >= public.gostoso_club_inicio_do_mes()
          ) >= cp.limite_mensal),
         cp.requer_agendamento,
         case when cp.requer_agendamento
              then coalesce(nullif(btrim(cp.agendamento_contato), ''), nullif(regexp_replace(coalesce(b.whatsapp, ''), '[^0-9]', '', 'g'), ''))
         end,
         case when cp.requer_agendamento then nullif(btrim(cp.agendamento_com), '') end
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

-- ── verificar (a pagina que o QR abre) ──────────────────────────────────────

create or replace function public.gostoso_club_verificar(p_token text) returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v record;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return json_build_object('status', 'invalido');
  end if;
  select v2.status, v2.nome, v2.codigo, v2.expira_em, v2.usado_em, btrim(b.name) as negocio, b.slug, cp.beneficio,
         cp.requer_agendamento, nullif(btrim(cp.agendamento_com), '') as agendamento_com
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
    'usado_em', v.usado_em,
    'requer_agendamento', v.requer_agendamento,
    'agendamento_com', case when v.requer_agendamento then v.agendamento_com end
  );
end
$$;
revoke execute on function public.gostoso_club_verificar(text) from public;
grant execute on function public.gostoso_club_verificar(text) to anon, authenticated, service_role;

-- ── cupom (a pagina e a imagem do titular) ──────────────────────────────────

create or replace function public.gostoso_club_cupom(p_token text) returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v record;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return json_build_object('status', 'invalido');
  end if;
  select v2.status, v2.nome, v2.codigo, v2.expira_em, v2.usado_em, btrim(b.name) as negocio, b.slug, cp.beneficio,
         coalesce(nullif(btrim(b.cover_url), ''), nullif(btrim(b.photos[1]), '')) as capa,
         cp.requer_agendamento,
         coalesce(nullif(btrim(cp.agendamento_contato), ''), nullif(regexp_replace(coalesce(b.whatsapp, ''), '[^0-9]', '', 'g'), '')) as contato,
         nullif(btrim(cp.agendamento_com), '') as agendamento_com
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
    'capa', v.capa,
    'codigo', v.codigo,
    'expira_em', v.expira_em,
    'usado_em', v.usado_em,
    'requer_agendamento', v.requer_agendamento,
    'agendamento_contato', case when v.requer_agendamento then v.contato end,
    'agendamento_com', case when v.requer_agendamento then v.agendamento_com end
  );
end
$$;
revoke execute on function public.gostoso_club_cupom(text) from public;
grant execute on function public.gostoso_club_cupom(text) to anon, authenticated, service_role;

-- ── Casa Surya: agendamento previo com a Satya ──────────────────────────────
-- O contato fica vazio de proposito: a funcao usa o WhatsApp do negocio (5561981760790), que e o da Satya.
-- A regra perde "ate o fim do mes" e "cinco primeiras aulas por mes": a lista ja mostra o limite e a validade.

update public.gostoso_club_partners
   set requer_agendamento = true,
       agendamento_com = 'Satya',
       regra = 'Vale na primeira aula de yoga no Estúdio Casa Surya.'
 where business_id = '15238397-df9e-422c-858b-56a5ccb0ed10'
   and (requer_agendamento is distinct from true or agendamento_com is distinct from 'Satya');
