-- Aviso ao dono quando a equipe decide a vantagem do Passaporte (KAN-917, Item 306, 17/11/2026).
--
-- Decisao do Victor: o aviso vai por WhatsApp, pelo numero do Vive Gostoso, respeitando o limite diario
-- de envios. ESTA MIGRACAO SO GUARDA O AVISO NUMA FILA; ela nao envia nada. Quem envia e um robo que ainda
-- nao existe (o WhatsApp Web do Vive esta fora do ar, KAN-788) e que le a fila pelas duas funcoes de
-- service_role abaixo. Enquanto ele nao existir os avisos ficam pendentes, sem efeito para ninguem.
--
-- O que entra:
--   gostoso_avisos_dono               uma linha por aviso (sem grant: so service_role e as funcoes)
--   gostoso_aviso_proximos(limite)    devolve os pendentes que cabem no que falta do limite de HOJE
--                                     (dia de Gostoso). So service_role.
--   gostoso_aviso_marcar(id, status)  o robo avisa que enviou ou falhou. So service_role.
--   gostoso_club_analise_decidir      redefinida: alem de decidir, enfileira o aviso
--
-- Um aviso por decisao e por vantagem pendente (indice unico parcial). Dono sem WhatsApp valido nasce
-- como sem_numero e nunca vai para o robo. O texto e curto, sem emoji, e a recusa leva o motivo que a equipe escreveu.
-- LGPD: o numero e o do proprio negocio (ja publico na ficha); o aviso e transacional, sobre o cadastro dele.
-- Retencao: apagar avisos enviados ha mais de 90 dias (passo operacional, nao agendado).
--
-- REVERSAO (rodar para desfazer):
--   drop function if exists public.gostoso_aviso_marcar(uuid, text);
--   drop function if exists public.gostoso_aviso_proximos(integer);
--   drop table if exists public.gostoso_avisos_dono;
--   (e reaplicar gostoso_club_analise_decidir de 20261117210000)

create table if not exists public.gostoso_avisos_dono (
  id          uuid primary key default gen_random_uuid(),
  partner_id  uuid not null references public.gostoso_club_partners (id) on delete cascade,
  business_id uuid not null references public.gostoso_businesses (id) on delete cascade,
  tipo        text not null check (tipo in ('vantagem_aprovada', 'vantagem_recusada')),
  telefone    text check (telefone is null or telefone ~ '^[0-9]{12,13}$'),
  texto       text not null check (char_length(texto) between 1 and 1000),
  status      text not null default 'pendente' check (status in ('pendente', 'enviado', 'falhou', 'sem_numero')),
  criado_em   timestamptz not null default now(),
  enviado_em  timestamptz
);
create unique index if not exists gostoso_avisos_dono_um_pendente
  on public.gostoso_avisos_dono (partner_id, tipo) where status = 'pendente';
create index if not exists gostoso_avisos_dono_fila
  on public.gostoso_avisos_dono (criado_em) where status = 'pendente';
create index if not exists gostoso_avisos_dono_enviados
  on public.gostoso_avisos_dono (enviado_em) where status = 'enviado';

alter table public.gostoso_avisos_dono enable row level security;
revoke all on public.gostoso_avisos_dono from anon, authenticated;
grant all on public.gostoso_avisos_dono to service_role;

-- Numero do negocio no formato do WhatsApp (55 + DDD + numero). Sem numero valido devolve nulo.
create or replace function public.gostoso_aviso__telefone(p_bruto text) returns text
  language sql immutable set search_path = public as
$$
  select case
    when d ~ '^55[0-9]{10,11}$' then d
    when d ~ '^[0-9]{10,11}$' then '55' || d
    else null
  end
  from (select regexp_replace(coalesce(p_bruto, ''), '[^0-9]', '', 'g') as d) t
$$;

-- Guarda o aviso. Chamada so de dentro de gostoso_club_analise_decidir.
create or replace function public.gostoso_aviso__enfileirar(p_partner uuid, p_aprovada boolean, p_motivo text)
  returns void
  language plpgsql security definer set search_path = public as
$$
declare
  v_business uuid;
  v_nome     text;
  v_tel      text;
  v_texto    text;
begin
  select b.id, b.name, public.gostoso_aviso__telefone(b.whatsapp)
    into v_business, v_nome, v_tel
    from public.gostoso_club_partners cp
    join public.gostoso_businesses b on b.id = cp.business_id
   where cp.id = p_partner;
  if v_business is null then
    return;
  end if;

  if p_aprovada then
    v_texto := 'Oi! Aqui é o Vive Gostoso. A vantagem do ' || v_nome || ' no Passaporte Gostoso foi aprovada e já está no ar. '
            || 'Quando um cliente usar o cupom, você marca como usado no painel.';
  else
    v_texto := 'Oi! Aqui é o Vive Gostoso. A equipe ainda não aprovou a vantagem do ' || v_nome || ' no Passaporte Gostoso. '
            || 'Motivo: ' || coalesce(p_motivo, 'ajuste o texto') || ' '
            || 'Ajuste o texto no painel (vivegostoso.com.br/cadastre/passaporte) e reenvie.';
  end if;

  insert into public.gostoso_avisos_dono (partner_id, business_id, tipo, telefone, texto, status)
  values (p_partner, v_business,
          case when p_aprovada then 'vantagem_aprovada' else 'vantagem_recusada' end,
          v_tel, v_texto,
          case when v_tel is null then 'sem_numero' else 'pendente' end)
  on conflict (partner_id, tipo) where status = 'pendente' do nothing;
end
$$;
revoke all on function public.gostoso_aviso__telefone(text), public.gostoso_aviso__enfileirar(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.gostoso_aviso__telefone(text), public.gostoso_aviso__enfileirar(uuid, boolean, text) to service_role;

-- A decisao da equipe, agora com o aviso. Mesma assinatura e mesmo resultado de 20261117210000.
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
    perform public.gostoso_aviso__enfileirar(p_partner, true, null);
    return json_build_object('ok', true, 'status', 'no_ar');
  end if;

  update public.gostoso_club_partners cp
     set status = 'rejeitado', motivo_recusa = v_motivo, analisado_em = now(), analisado_por = auth.uid()
   where cp.id = p_partner;
  perform public.gostoso_aviso__enfileirar(p_partner, false, v_motivo);
  return json_build_object('ok', true, 'status', 'rejeitado');
end
$$;
revoke all on function public.gostoso_club_analise_decidir(uuid, boolean, text) from public, anon;
grant execute on function public.gostoso_club_analise_decidir(uuid, boolean, text) to authenticated, service_role;

-- ── para o robo de envio (service_role) ─────────────────────────────────────
-- Devolve, do mais antigo para o mais novo, so os pendentes que cabem no que falta do limite de hoje.
-- "Hoje" e o dia de Gostoso. Limite zero ou negativo devolve lista vazia.
create or replace function public.gostoso_aviso_proximos(p_limite_diario integer) returns jsonb
  language plpgsql stable security definer set search_path = public as
$$
declare
  v_hoje    date := public.gostoso_club_hoje();
  v_enviados integer;
  v_resta   integer;
begin
  select count(*) into v_enviados
    from public.gostoso_avisos_dono a
   where a.status = 'enviado'
     and (a.enviado_em at time zone 'America/Fortaleza')::date = v_hoje;
  v_resta := greatest(coalesce(p_limite_diario, 0) - v_enviados, 0);
  if v_resta = 0 then
    return '[]'::jsonb;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', x.id, 'telefone', x.telefone, 'texto', x.texto, 'tipo', x.tipo) order by x.criado_em)
      from (select a.* from public.gostoso_avisos_dono a
             where a.status = 'pendente' order by a.criado_em limit v_resta) x
  ), '[]'::jsonb);
end
$$;

create or replace function public.gostoso_aviso_marcar(p_id uuid, p_status text) returns boolean
  language plpgsql security definer set search_path = public as
$$
begin
  if p_status not in ('enviado', 'falhou') then
    raise exception 'status' using errcode = '22023';
  end if;
  update public.gostoso_avisos_dono a
     set status = p_status, enviado_em = case when p_status = 'enviado' then now() else a.enviado_em end
   where a.id = p_id and a.status = 'pendente';
  return found;
end
$$;
revoke all on function public.gostoso_aviso_proximos(integer), public.gostoso_aviso_marcar(uuid, text) from public, anon, authenticated;
grant execute on function public.gostoso_aviso_proximos(integer), public.gostoso_aviso_marcar(uuid, text) to service_role;
