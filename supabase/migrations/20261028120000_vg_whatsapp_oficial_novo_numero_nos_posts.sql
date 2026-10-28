-- WhatsApp oficial do Vive Gostoso: 5584936180839 -> 558488182779 (Victor, 28/10/2026).
-- O codigo le o numero de OFFICIAL_WHATSAPP (src/lib/whatsapp.ts). Os posts do blog
-- guardam o link wa.me dentro do HTML do conteudo, entao o numero antigo precisa
-- sair do banco tambem. Os wa.me dos negocios (tabelas gostoso_businesses etc.)
-- sao dos proprios negocios e nao entram aqui.
-- Rodar DEPOIS do deploy do codigo, junto com o merge. Idempotente.

create table if not exists public.gostoso_blog_posts_bkp_20261028 as
  select * from public.gostoso_blog_posts
  where content ilike '%5584936180839%'
     or excerpt ilike '%5584936180839%'
     or faq_jsonld::text ilike '%5584936180839%';

alter table public.gostoso_blog_posts_bkp_20261028 enable row level security;

update public.gostoso_blog_posts
set content = replace(content, '5584936180839', '558488182779')
where content ilike '%5584936180839%';

update public.gostoso_blog_posts
set excerpt = replace(excerpt, '5584936180839', '558488182779')
where excerpt ilike '%5584936180839%';

update public.gostoso_blog_posts
set faq_jsonld = replace(faq_jsonld::text, '5584936180839', '558488182779')::jsonb
where faq_jsonld::text ilike '%5584936180839%';
