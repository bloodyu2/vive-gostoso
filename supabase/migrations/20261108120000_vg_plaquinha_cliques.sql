-- Cliques nas paginas das plaquinhas (/p/NN), 08/11/2026.
--
-- Por que existe: o Google Analytics so mede quem aceita os cookies, e a /p/NN nao
-- tinha aviso de cookies, entao ele nao via nenhum QR lido. A visita ja era contada
-- aqui (gostoso_plaquinha_visitas). Esta tabela conta o que a pessoa FEZ na pagina,
-- por codigo, por acao e por dia, sem dado pessoal e sem depender de aceite.
--
-- acao: 'avaliar' (botao Avaliar no Google), 'instagram', 'perfil' (perfil no Vive
-- Gostoso), 'passaporte' (convite do Passaporte Gostoso).
--
-- Mesmo molde de gostoso_plaquinha_visitas: RLS ligada, sem policy e sem grant para
-- anon e authenticated; so a funcao SECURITY DEFINER escreve, so o service_role le.
--
-- REVERSAO (rodar para desfazer):
--   drop function if exists public.gostoso_club_registrar_clique_plaquinha(text, text);
--   drop table if exists public.gostoso_plaquinha_cliques;

create table if not exists public.gostoso_plaquinha_cliques (
  codigo  text not null check (codigo ~ '^[0-9]{2}$'),
  acao    text not null check (acao in ('avaliar', 'instagram', 'perfil', 'passaporte')),
  dia     date not null,
  n       integer not null default 0,
  primary key (codigo, acao, dia)
);

alter table public.gostoso_plaquinha_cliques enable row level security;

revoke all on public.gostoso_plaquinha_cliques from anon, authenticated;
grant all on public.gostoso_plaquinha_cliques to service_role;

create or replace function public.gostoso_club_registrar_clique_plaquinha(p_codigo text, p_acao text)
  returns void
  language sql volatile security definer set search_path = public as
$$
  insert into public.gostoso_plaquinha_cliques as c (codigo, acao, dia, n)
  select p_codigo, p_acao, public.gostoso_club_hoje(), 1
  where p_codigo ~ '^[0-9]{2}$' and p_acao in ('avaliar', 'instagram', 'perfil', 'passaporte')
  on conflict (codigo, acao, dia) do update set n = c.n + 1
$$;
revoke execute on function public.gostoso_club_registrar_clique_plaquinha(text, text) from public;
grant execute on function public.gostoso_club_registrar_clique_plaquinha(text, text) to anon, authenticated, service_role;
