-- KAN-348 (VGO-04): endurece o INSERT anonimo em `gostoso_event_submissions`.
--
-- Medido antes: policy "public_insert_submissions" (INSERT, roles {anon,
-- authenticated}) com `with check (is_approved = false)`. O anon escolhe
-- TODAS as demais colunas: podia gravar `admin_note`, `reviewed_at` e ate
-- `created_at`/`id` arbitrarios, alem de nao haver teto de tamanho nem limite
-- de taxa para uma tabela que recebe PII (nome, email, telefone).
--
-- APLICADO em 2026-09-19 (projeto wppsmvgbagalczoardfl), com ordem do Victor.
-- Verificado depois de aplicar: policy `public_insert_submissions` com o
-- `with check` reconstruido, e o insert do visitante (sem as colunas internas)
-- passando. A tentativa de inserir com `is_approved=true` e `admin_note`
-- preenchido continua reprovada pela policy, que era o ponto.
--
-- O `with check` reconstruido trava as colunas internas no default e mantem
-- `is_approved` em false. As colunas de conteudo seguem aceitas do visitante,
-- que e o proposito da tabela.

drop policy if exists "public_insert_submissions" on public.gostoso_event_submissions;

create policy "public_insert_submissions"
  on public.gostoso_event_submissions for insert
  to anon, authenticated
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
  );
