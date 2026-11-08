-- Duas acoes novas nos cliques das plaquinhas (/p/NN), 08/11/2026.
--
-- Por que existe: a pagina ganhou a setinha "Conhecer mais" (acao 'conhecer_mais') e o botao
-- "Seguir @vivegostoso no Instagram" (acao 'seguir_vive'). O CHECK da tabela e o filtro da funcao
-- so aceitavam as 4 acoes antigas, entao o banco descartaria as novas em silencio (o GA4 ja conta).
-- Aplicar ANTES do deploy do codigo; as 4 acoes antigas continuam valendo.
--
-- REVERSAO (rodar para desfazer; apaga antes as linhas das acoes novas):
--   delete from public.gostoso_plaquinha_cliques where acao in ('conhecer_mais', 'seguir_vive');
--   alter table public.gostoso_plaquinha_cliques drop constraint gostoso_plaquinha_cliques_acao_check;
--   alter table public.gostoso_plaquinha_cliques add constraint gostoso_plaquinha_cliques_acao_check
--     check (acao in ('avaliar', 'instagram', 'perfil', 'passaporte'));
--   e recriar a funcao com a lista de 4 acoes (ver 20261108120000_vg_plaquinha_cliques.sql).

alter table public.gostoso_plaquinha_cliques drop constraint if exists gostoso_plaquinha_cliques_acao_check;
alter table public.gostoso_plaquinha_cliques add constraint gostoso_plaquinha_cliques_acao_check
  check (acao in ('avaliar', 'instagram', 'perfil', 'passaporte', 'conhecer_mais', 'seguir_vive'));

create or replace function public.gostoso_club_registrar_clique_plaquinha(p_codigo text, p_acao text)
  returns void
  language sql volatile security definer set search_path = public as
$$
  insert into public.gostoso_plaquinha_cliques as c (codigo, acao, dia, n)
  select p_codigo, p_acao, public.gostoso_club_hoje(), 1
  where p_codigo ~ '^[0-9]{2}$'
    and p_acao in ('avaliar', 'instagram', 'perfil', 'passaporte', 'conhecer_mais', 'seguir_vive')
  on conflict (codigo, acao, dia) do update set n = c.n + 1
$$;
revoke execute on function public.gostoso_club_registrar_clique_plaquinha(text, text) from public;
grant execute on function public.gostoso_club_registrar_clique_plaquinha(text, text) to anon, authenticated, service_role;
