-- Fotos em todos os cadastros e varios tipos por servico (pedido do Victor, 11/10/2026).
--
-- 1. Storage: qualquer usuario logado grava, troca e apaga fotos na propria pasta
--    `u/<auth.uid()>/` do bucket `business-photos`. As pastas por negocio
--    (`<business_id>/`) continuam como estavam. Leitura publica ja existe.
-- 2. gostoso_service_listings ganha `service_categories` (varios tipos) e `photos`
--    (ate 5 fotos). `service_category` continua sendo o tipo principal.
-- 3. A insercao publica de servico, transfer e evento passa a aceitar foto, mas so
--    URL do nosso bucket `business-photos`. Fora disso a linha e recusada.
--
-- REVERSAO (rodar para desfazer):
--   drop policy "fotos_usuario_insert" on storage.objects;
--   drop policy "fotos_usuario_update" on storage.objects;
--   drop policy "fotos_usuario_delete" on storage.objects;
--   alter table public.gostoso_service_listings drop column service_categories, drop column photos;
--   drop policy "service_listings_public_insert" on public.gostoso_service_listings;
--   create policy "service_listings_public_insert" on public.gostoso_service_listings for insert to public
--     with check (is_active = false and is_featured = false and photo_url is null
--       and char_length(coalesce(name,'')) <= 200 and char_length(coalesce(headline,'')) <= 300
--       and char_length(coalesce(description,'')) <= 4000 and char_length(coalesce(whatsapp,'')) <= 40);
--   drop policy "transfers_public_insert" on public.gostoso_transfers;  -- e recriar com `photo_url is null` (ver 20261007034448)

-- 1. Storage
drop policy if exists "fotos_usuario_insert" on storage.objects;
create policy "fotos_usuario_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'business-photos'
    and (storage.foldername(name))[1] = 'u'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "fotos_usuario_update" on storage.objects;
create policy "fotos_usuario_update" on storage.objects for update to authenticated
  using (
    bucket_id = 'business-photos'
    and (storage.foldername(name))[1] = 'u'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'business-photos'
    and (storage.foldername(name))[1] = 'u'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "fotos_usuario_delete" on storage.objects;
create policy "fotos_usuario_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'business-photos'
    and (storage.foldername(name))[1] = 'u'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- 2. Servicos: varios tipos e varias fotos
alter table public.gostoso_service_listings
  add column if not exists service_categories text[] not null default '{}',
  add column if not exists photos text[] not null default '{}';

update public.gostoso_service_listings
   set service_categories = array[service_category]
 where cardinality(service_categories) = 0 and service_category is not null;

-- 3. Insercao publica com foto restrita ao nosso bucket
drop policy if exists "service_listings_public_insert" on public.gostoso_service_listings;
create policy "service_listings_public_insert" on public.gostoso_service_listings for insert to public
  with check (
    is_active = false
    and is_featured = false
    and (photo_url is null or photo_url like 'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/u/%')
    and cardinality(photos) <= 5
    and not exists (
      select 1 from unnest(photos) p
      where p not like 'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/u/%'
    )
    and cardinality(service_categories) <= 7
    and char_length(coalesce(name, '')) <= 200
    and char_length(coalesce(headline, '')) <= 300
    and char_length(coalesce(description, '')) <= 4000
    and char_length(coalesce(whatsapp, '')) <= 40
  );

drop policy if exists "transfers_public_insert" on public.gostoso_transfers;
create policy "transfers_public_insert" on public.gostoso_transfers for insert to public
  with check (
    active = false
    and business_id is null
    and slug is null
    and (photo_url is null or photo_url like 'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/u/%')
    and char_length(coalesce(provider_name, '')) <= 200
    and char_length(coalesce(whatsapp, '')) <= 40
    and char_length(coalesce(vehicle_type, '')) <= 100
    and char_length(coalesce(available_hours, '')) <= 200
    and char_length(coalesce(description, '')) <= 4000
    and char_length(coalesce(advance_notice, '')) <= 300
    and char_length(coalesce(meeting_point, '')) <= 300
    and char_length(coalesce(observations, '')) <= 2000
    and coalesce(pg_column_size(routes), 0) <= 20000
    and coalesce(cardinality(languages), 0) <= 20
    and coalesce(cardinality(payment_methods), 0) <= 20
  );

-- Evento: a politica ja aceita cover_url https com teto; nada a mudar.
