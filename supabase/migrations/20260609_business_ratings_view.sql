-- View agregada de ratings: evita N+1 no grid de negocios.
-- Uma unica query retorna avg + count de todas as reviews aprovadas por negocio.
create or replace view public.gostoso_business_ratings as
select
  business_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)::int as review_count
from public.gostoso_reviews
where approved = true and business_id is not null
group by business_id;

-- Grant obrigatorio: views novas nao sao expostas automaticamente
grant select on public.gostoso_business_ratings to anon;
grant select on public.gostoso_business_ratings to authenticated;
grant select on public.gostoso_business_ratings to service_role;
