-- Passaporte Gostoso: marca as vistas por parceiro de 26/10 ate o dia desta migration como invalidas (KAN-998, 26/11/2026).
--
-- Por que existe: ate o deploy do KAN-998 a pagina /clube mandava os ids de TODOS os parceiros a cada visita,
-- e gostoso_club_registrar_vistas soma 1 por id recebido. Em cada dia, todos os parceiros no ar ficaram com o
-- MESMO n (21/11: 11 parceiros com n = 58). Esse n e o numero de visitas a lista naquele dia (uma por aba), nao
-- as vezes que cada vantagem foi vista. O numero por parceiro desse periodo nao vale para nada.
--
-- O que NAO muda: o historico. Nenhuma linha de gostoso_club_views e alterada ou apagada. A marca e uma
-- tabela a parte com o periodo e o motivo, e o resto do sistema passa a ler "a partir de quando vale".
--
-- O que muda:
--   1. Tabela gostoso_club_views_invalidos: periodos em que o n por parceiro nao vale (RLS ligada, sem grant
--      para anon e authenticated; so service_role e as funcoes abaixo leem).
--   2. Uma linha nela: de 2026-10-26 ate o dia em que a migration roda (o dia do deploy conta, porque nele
--      conviveram o chamador antigo e o novo). Idempotente.
--   3. gostoso_club_vistas_validas_desde(): primeiro dia valido (ate + 1).
--   4. View gostoso_club_views_validas: so os dias validos, para relatorio. Use ela, nao a tabela, para
--      numero por parceiro.
--   5. gostoso_club_painel: 'vistas_mes' vira null enquanto o mes comecou antes do primeiro dia valido (o
--      painel mostra "–" em vez de numero errado) e ganha 'vistas_validas_desde'. As outras chaves ficam iguais
--      as de 20261028100000_vg_clube_resgate.sql.
--   6. Comentario na tabela gostoso_club_views avisando do periodo.
--
-- Ordem de uso: aplicar DEPOIS do deploy do codigo (o chamador por cartao), no mesmo dia ou no dia seguinte.
-- Compativel com o codigo antigo: o painel antigo le 'vistas_mes' como numero e passa a receber null, que o
-- codigo novo trata como "–"; o antigo mostraria "null" no cartao, por isso o codigo vai antes.
--
-- Leitura do periodo invalido, se alguem precisar: a visita a lista por dia (nao por parceiro) e o maior n do
-- dia, `select dia, max(n) from gostoso_club_views group by dia`. Vale como "abas que abriram a lista no dia",
-- com a ressalva de que parceiro que entrou no ar no meio do dia puxa o maximo para baixo.
--
-- REVERSAO (rodar para desfazer; depois reaplicar o `create or replace function public.gostoso_club_painel`
-- de 20261028100000_vg_clube_resgate.sql):
--   drop view if exists public.gostoso_club_views_validas;
--   drop function if exists public.gostoso_club_vistas_validas_desde();
--   drop table if exists public.gostoso_club_views_invalidos;
--   comment on table public.gostoso_club_views is null;

-- ── marca de periodo invalido ───────────────────────────────────────────────

create table if not exists public.gostoso_club_views_invalidos (
  id             uuid primary key default gen_random_uuid(),
  de             date not null,
  ate            date not null,
  motivo         text not null,
  ticket         text,
  registrado_em  timestamptz not null default now(),
  constraint gostoso_club_views_invalidos_periodo_chk check (ate >= de)
);

alter table public.gostoso_club_views_invalidos enable row level security;
-- RLS ligada, sem policy e sem grant para anon e authenticated: so service_role e as funcoes SECURITY DEFINER.
revoke all on public.gostoso_club_views_invalidos from anon, authenticated;
grant all on public.gostoso_club_views_invalidos to service_role;

insert into public.gostoso_club_views_invalidos (de, ate, motivo, ticket)
select date '2026-10-26',
       public.gostoso_club_hoje(),
       'n por parceiro nao vale: a pagina mandava todos os parceiros a cada visita, entao todos ficaram com o mesmo n por dia (visitas a lista, nao vistas da vantagem)',
       'KAN-998'
 where not exists (
   select 1 from public.gostoso_club_views_invalidos i where i.de = date '2026-10-26'
 );

-- ── primeiro dia valido ─────────────────────────────────────────────────────

create or replace function public.gostoso_club_vistas_validas_desde() returns date
  language sql stable security definer set search_path = public as
$$ select coalesce(max(i.ate) + 1, date '1970-01-01') from public.gostoso_club_views_invalidos i $$;
revoke execute on function public.gostoso_club_vistas_validas_desde() from public, anon;
grant execute on function public.gostoso_club_vistas_validas_desde() to authenticated, service_role;

-- ── view so com os dias validos ─────────────────────────────────────────────
-- security_invoker: respeita a RLS de gostoso_club_views (o dono ve so o proprio parceiro).

create or replace view public.gostoso_club_views_validas with (security_invoker = true) as
  select w.partner_id, w.dia, w.n
    from public.gostoso_club_views w
   where w.dia >= public.gostoso_club_vistas_validas_desde();
revoke all on public.gostoso_club_views_validas from anon, authenticated;
grant select on public.gostoso_club_views_validas to authenticated, service_role;

comment on table public.gostoso_club_views is
  'ATENCAO (KAN-998): o n por parceiro dos dias ate o registrado em gostoso_club_views_invalidos NAO vale (todos os parceiros com o mesmo n = visitas a lista). Para numero por parceiro use gostoso_club_views_validas.';

-- ── painel do parceiro: nao mostra vista do periodo invalido ────────────────
-- Mesmas chaves de 20261028100000_vg_clube_resgate.sql. Muda 'vistas_mes' (null enquanto o mes comecou antes
-- do primeiro dia valido) e entra 'vistas_validas_desde'.

create or replace function public.gostoso_club_painel(p_partner uuid)
  returns json
  language plpgsql stable security definer set search_path = public as
$$
declare
  v_cp public.gostoso_club_partners%rowtype;
  v_inicio timestamptz := public.gostoso_club_inicio_do_mes();
  v_mes date := (public.gostoso_club_inicio_do_mes() at time zone 'America/Fortaleza')::date;
  v_validas date := public.gostoso_club_vistas_validas_desde();
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
    -- null = o mes ainda tem dia sem contagem valida por parceiro; o painel mostra "–"
    'vistas_mes', case when v_mes < v_validas then null
                       else coalesce((select sum(w.n) from public.gostoso_club_views w
                                       where w.partner_id = v_cp.id and w.dia >= v_mes), 0) end,
    'vistas_validas_desde', v_validas,
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
