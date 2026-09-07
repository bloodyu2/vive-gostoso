-- 20260906_contrate_taxonomia_cidade_praia.sql
-- Fase 5 do Contrate: taxonomia de cidade de praia (~10 mil habitantes) no
-- lugar da taxonomia de consultoria urbana (coach/mentor/consultor/...).
-- Ver src/types/professional.ts (GRUPOS_DE_CATEGORIA / PROFESSIONAL_CATEGORIES
-- / CATEGORIA_LEGADA) para a taxonomia nova e o mapa de origem.
--
-- Estado antes (2 cadastros): Michel Comunicacao em 'designer', Poliane
-- Rodrigues de Oliveira em 'outro'. Depois: Michel em 'marketing-design',
-- Poliane em 'outro'. Nenhum registro perdido.

-- Drop old consultancy-taxonomy check constraint so migrated rows can take
-- the new "beach town" categories.
alter table public.gostoso_professionals drop constraint gostoso_professionals_category_check;

-- Remap the existing registrations from the old taxonomy to the new one.
-- Nothing is deleted: every row keeps its id, only category changes.
update public.gostoso_professionals set category = case category
  when 'coach' then 'outro' when 'mentor' then 'outro' when 'consultor' then 'outro'
  when 'designer' then 'marketing-design' when 'fotografo' then 'fotografo'
  when 'juridico' then 'contabilidade-juridico' when 'educacao' then 'aulas-particulares'
  else 'outro' end
where category in ('coach','mentor','consultor','designer','fotografo','juridico','educacao','outro');

-- New check constraint: beach-town taxonomy (21 categories + "outro"), must
-- stay in sync with GRUPOS_DE_CATEGORIA / PROFESSIONAL_CATEGORIES in
-- src/types/professional.ts.
alter table public.gostoso_professionals add constraint gostoso_professionals_category_check
  check (category = any (array[
    'pedreiro-reforma','eletrica','hidraulica','pintura','marcenaria','piscina',
    'ar-condicionado','jardinagem','caseiro','diarista-limpeza','dedetizacao',
    'transfer-motorista','cozinheira-chef','baba','massagem-bem-estar',
    'professor-esportes','fotografo','audiovisual','marketing-design',
    'contabilidade-juridico','aulas-particulares','outro'
  ]));
