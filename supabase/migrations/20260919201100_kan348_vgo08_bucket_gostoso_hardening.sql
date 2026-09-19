-- KAN-348 (VGO-08): restringe o bucket `gostoso` (imagens de negocio).
--
-- Medido antes: policy "public read gostoso storage" (SELECT, usando
-- `bucket_id = 'gostoso'`) e "gostoso_admin_all" (ALL, so admin). O bucket
-- aceitava upload de qualquer `authenticated` sem escopo de pasta, e o corpus
-- mantinha suporte a SVG -- um SVG servido pela origem do site e vetor de
-- script.
--
-- Este arquivo NAO foi aplicado: restringir storage em producao pode quebrar
-- telas de dono de negocio que hoje sobem imagem; e decisao de release do dono.
--
-- O que ele faz:
--   1. recusa `image/svg+xml` no bucket (o site nao precisa de SVG de upload);
--   2. escopa o INSERT a pasta do proprio negocio, como ja e feito no bucket
--      `business-photos` (primeiro segmento do nome = id do negocio do dono).

update storage.buckets
   set allowed_mime_types = array[
         'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'
       ]
 where id = 'gostoso';

drop policy if exists "gostoso_admin_all" on storage.objects;
create policy "gostoso_admin_all"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'gostoso'
    and exists (
      select 1 from public.gostoso_profiles
       where auth_user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'gostoso'
    and exists (
      select 1 from public.gostoso_profiles
       where auth_user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "gostoso_owner_insert" on storage.objects;
create policy "gostoso_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gostoso'
    and (storage.foldername(name))[1] in (
      select (b.id)::text
        from public.gostoso_businesses b
        join public.gostoso_profiles p on p.id = b.profile_id
       where p.auth_user_id = auth.uid()
    )
  );
