-- Insercao anonima com tetos de tamanho e colunas internas fixas.
--
-- Avaliacoes, vagas, servicos e transfers (como ja e o caso de eventos, migracao
-- 20260919201000) passam a validar o que o visitante grava:
--   * tetos de tamanho acima do que os formularios enviam e dos maiores textos
--     reais;
--   * vaga e transfer entram sem `business_id`; transfer sem `slug` e sem
--     `photo_url`; servico sem `photo_url` (os formularios ja enviam nulo);
--   * eventos: `source_url` e `cover_url` aceitam so http(s) e tem teto.
-- Linhas existentes nao sao tocadas (so a politica de INSERT muda).
--
-- REVERSAO (rodar para desfazer):
--   drop policy "public_insert_review" on public.gostoso_reviews;
--   create policy "public_insert_review" on public.gostoso_reviews for insert to public
--     with check (approved = false and (((business_id is not null)::int + (professional_id is not null)::int + (transfer_id is not null)::int) = 1));
--   drop policy "job_listings_public_insert" on public.gostoso_job_listings;
--   create policy "job_listings_public_insert" on public.gostoso_job_listings for insert to public with check (is_active = false);
--   drop policy "service_listings_public_insert" on public.gostoso_service_listings;
--   create policy "service_listings_public_insert" on public.gostoso_service_listings for insert to public with check (is_active = false and is_featured = false);
--   drop policy "transfers_public_insert" on public.gostoso_transfers;
--   create policy "transfers_public_insert" on public.gostoso_transfers for insert to public with check (active = false);
--   drop policy "public_insert_submissions" on public.gostoso_event_submissions;
--   create policy "public_insert_submissions" on public.gostoso_event_submissions for insert to anon, authenticated
--     with check (is_approved = false and admin_note is null and reviewed_at is null and id is not null
--       and char_length(name) between 1 and 200 and char_length(coalesce(description, '')) <= 4000
--       and char_length(submitter_name) between 1 and 200 and char_length(submitter_email) between 3 and 320
--       and char_length(coalesce(submitter_phone, '')) <= 40);

-- Avaliacoes
drop policy if exists "public_insert_review" on public.gostoso_reviews;
create policy "public_insert_review" on public.gostoso_reviews for insert to public
  with check (
    approved = false
    and (((business_id is not null)::int + (professional_id is not null)::int + (transfer_id is not null)::int) = 1)
    and char_length(coalesce(author_name, '')) <= 120
    and char_length(coalesce(comment, '')) <= 1000
  );

-- Vagas
drop policy if exists "job_listings_public_insert" on public.gostoso_job_listings;
create policy "job_listings_public_insert" on public.gostoso_job_listings for insert to public
  with check (
    is_active = false
    and business_id is null
    and char_length(coalesce(business_name, '')) <= 200
    and char_length(coalesce(title, '')) <= 200
    and char_length(coalesce(description, '')) <= 4000
    and char_length(coalesce(whatsapp, '')) <= 40
  );

-- Servicos
drop policy if exists "service_listings_public_insert" on public.gostoso_service_listings;
create policy "service_listings_public_insert" on public.gostoso_service_listings for insert to public
  with check (
    is_active = false
    and is_featured = false
    and photo_url is null
    and char_length(coalesce(name, '')) <= 200
    and char_length(coalesce(headline, '')) <= 300
    and char_length(coalesce(description, '')) <= 4000
    and char_length(coalesce(whatsapp, '')) <= 40
  );

-- Transfers
drop policy if exists "transfers_public_insert" on public.gostoso_transfers;
create policy "transfers_public_insert" on public.gostoso_transfers for insert to public
  with check (
    active = false
    and business_id is null
    and slug is null
    and photo_url is null
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

-- Eventos enviados pelo publico (mantem as travas anteriores e soma as novas)
drop policy if exists "public_insert_submissions" on public.gostoso_event_submissions;
create policy "public_insert_submissions" on public.gostoso_event_submissions for insert to anon, authenticated
  with check (
    is_approved = false
    and admin_note is null
    and reviewed_at is null
    and id is not null
    and char_length(name) between 1 and 200
    and char_length(coalesce(description, '')) <= 4000
    and char_length(submitter_name) between 1 and 200
    and char_length(submitter_email) between 3 and 320
    and char_length(coalesce(submitter_phone, '')) <= 40
    and char_length(coalesce(location, '')) <= 300
    and char_length(coalesce(source_url, '')) <= 2000
    and (coalesce(source_url, '') = '' or source_url ~* '^https?://')
    and char_length(coalesce(cover_url, '')) <= 2000
    and (coalesce(cover_url, '') = '' or cover_url ~* '^https?://')
  );
