-- MODELO: novo aceite do Passaporte por um negocio que ainda nao tem perfil no site.
-- (decisoes.md, secao "Novo aceite do clube sem perfil", 30/10/2026)
--
-- NAO RODAR COMO ESTA. Copie para um arquivo datado (scripts/cadastros/AAAA-MM-DD-<slug>.sql),
-- troque os valores do bloco "dados", faca a conferencia da secao e rode so depois
-- de o Victor autorizar, com as fotos ja enviadas ao bucket (ver "Fotos" na secao).
--
-- O que faz, em um unico comando (CTE), idempotente:
--   1. cria o perfil em gostoso_businesses: verificado, publicado, ativo, plano free, SEM dono
--      (profile_id nulo, gerido pela Balaio), ja com cover_url e photos;
--   2. cria a vantagem em gostoso_club_partners (status 'em_combinacao' ou 'no_ar').
-- Rodar de novo nao duplica nada: o slug e unico e a vantagem e unica por negocio.
--
-- Por que is_verified = true aqui, mesmo com o gatilho: o gatilho gostoso_guard_business_insert
-- ja o liga quando quem insere e admin ou service role (auth.uid() nulo). O valor explicito
-- deixa a intencao escrita e o resultado igual se o gatilho mudar.
--
-- Seguranca contra o negocio errado: se o slug ja existe e o nome e outro, NADA e gravado
-- (o comando devolve zero linhas). Se o slug ja existe com o MESMO nome, so a vantagem
-- falta, e ela entra.
--
-- REVERSAO (troque <slug> pelo slug usado):
--   delete from public.gostoso_club_partners where business_id = (select id from public.gostoso_businesses where slug = '<slug>');
--   delete from public.gostoso_businesses where slug = '<slug>';
--   (e apague a pasta <id>/ do bucket business-photos, se as fotos foram enviadas)

with dados as (
  select
    -- id gerado ANTES de enviar as fotos (select gen_random_uuid();), porque a pasta no bucket
    -- e <id>/. Guarde o mesmo id para rodar de novo.
    '00000000-0000-4000-8000-000000000000'::uuid          as id,
    'Nome Exato do Negocio'::text                         as nome,
    'nome-exato-do-negocio'::text                         as slug,
    'restaurantes'::text                                  as categoria_slug,       -- gostoso_categories.slug
    'Rua Exemplo, 123, Sao Miguel do Gostoso/RN'::text    as endereco,
    'instagram_sem_arroba'::text                          as instagram,
    '5584999999999'::text                                 as whatsapp,             -- so digitos, com 55
    null::text                                            as telefone,             -- ex.: '(84) 99999-9999'
    null::text                                            as site,
    'Uma ou duas frases do que o lugar e e oferece (texto nosso, sem copiar o Maps).'::text as descricao,
    -- horario no formato do site: chaves dom, seg, ter, qua, qui, sex, sab
    (
      select jsonb_object_agg(d, jsonb_build_object('open', '11:00', 'close', '19:00', 'closed', false))
        from unnest(array['dom','seg','ter','qua','qui','sex','sab']) as d
    )                                                     as horario,
    'google_maps_30_10'::text                             as horario_fonte,        -- de onde veio o horario e quando
    date '2026-10-30'                                     as horario_conferido_em,
    -- nomes dos arquivos ja enviados para business-photos/<id>/ ; o primeiro vira a capa
    array['1793000000000-nome-do-negocio-01.jpg','1793000000000-nome-do-negocio-02.jpg']::text[] as arquivos,
    -- a vantagem
    'Brinde de cortesia na primeira visita.'::text        as beneficio,            -- 3 a 140 caracteres
    null::text                                            as regra,                -- ate 200 caracteres
    null::int                                             as limite_mensal,
    null::date                                            as valido_ate,
    'em_combinacao'::text                                 as status                -- ou 'no_ar'
),
base as (
  select d.*,
         'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/' || d.id::text || '/' as pasta
    from dados d
),
novo as (
  insert into public.gostoso_businesses
    (id, name, slug, description, category_id, profile_id, address, instagram, whatsapp, phone, website,
     opening_hours, horario_fonte, horario_conferido_em, cover_url, photos,
     is_verified, is_published, active, plan, business_type)
  select b.id, b.nome, b.slug, b.descricao, c.id, null, b.endereco, b.instagram, b.whatsapp, b.telefone, b.site,
         b.horario, b.horario_fonte, b.horario_conferido_em,
         b.pasta || b.arquivos[1],
         (select array_agg(b.pasta || a order by ord) from unnest(b.arquivos) with ordinality as t(a, ord)),
         true, true, true, 'free', 'local'
    from base b
    join public.gostoso_categories c on c.slug = b.categoria_slug
  on conflict (slug) do nothing
  returning id
),
negocio as (
  select id from novo
  union all
  -- ja existia com este slug E este nome: so falta a vantagem
  select e.id
    from public.gostoso_businesses e
    join base b on b.slug = e.slug and b.nome = e.name
   where not exists (select 1 from novo)
)
insert into public.gostoso_club_partners (business_id, beneficio, regra, limite_mensal, valido_ate, status)
select n.id, b.beneficio, b.regra, b.limite_mensal, b.valido_ate, b.status
  from negocio n, base b
on conflict (business_id) do nothing
returning business_id, status;

-- ── COMO CHECAR DEPOIS (rodar em seguida, so leitura) ───────────────────────
-- select b.name, b.slug, b.is_verified, b.is_published, b.active, b.profile_id, c.name as categoria,
--        b.cover_url is not null as tem_capa, coalesce(array_length(b.photos, 1), 0) as fotos,
--        cp.status, cp.beneficio
--   from public.gostoso_businesses b
--   left join public.gostoso_categories c on c.id = b.category_id
--   left join public.gostoso_club_partners cp on cp.business_id = b.id
--  where b.slug = 'nome-exato-do-negocio';
-- Esperado: is_verified, is_published e active = true; profile_id nulo; tem_capa = true; fotos >= 1;
-- status = o combinado. Depois abra /negocio/<slug> e /clube no site (a /clube mostra o parceiro
-- se o status for no_ar).
