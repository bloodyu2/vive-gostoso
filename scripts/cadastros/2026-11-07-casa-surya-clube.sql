-- Casa Surya (estudio de yoga) no guia e no Passaporte Gostoso (07/11/2026), plaquinha /p/11.
--
-- Acordo do Victor com a Satya (WhatsApp, 07/11/2026): 10% de desconto na primeira aula de yoga no Estudio
-- Casa Surya, valido no mes em que for anunciado (renovado mes a mes), com 5 usos por mes.
--
-- Roda UMA vez, logo depois do merge do PR (regra: nada parcial em producao antes do push final). As 5 fotos
-- vao no proprio site, em public/parceiros/casa-surya/ (como as do Biscoitos da Damy em public/negocios/),
-- por caminho relativo: assim a CSP (img-src 'self'), o cupom (cupom-foto.ts so le Storage ou caminho do
-- site) e as previews aceitam. Nao ha nada a subir no bucket business-photos. Idempotente: o id e o slug sao
-- unicos, e a vantagem so entra uma vez por negocio.
--
-- VALIDADE: valido_ate = 2026-11-30. A vantagem sai do ar sozinha em 01/12 (a lista e o resgate exigem
-- valido_ate >= hoje) e o cupom pego em 28/11 vale ate 30/11 (30 dias a partir do resgate, limitado por
-- valido_ate). Para continuar em dezembro e preciso RENOVAR em 30/11 (update de valido_ate, ver abaixo) e
-- assim todo mes. Se ninguem renovar, a Casa Surya some do Passaporte sem erro.
--   update public.gostoso_club_partners set valido_ate = '2026-12-31'
--    where business_id = '15238397-df9e-422c-858b-56a5ccb0ed10';
--
-- Dados (coleta de 07/11/2026): endereco, lat/lng e telefone da ficha do Google Maps "Casa Surya hospedagem
-- e autocuidado" (o estudio e a pousada ficam no mesmo endereco e nao ha ficha so do estudio); Instagram
-- @casasurya.smg (bio: "estudio de yoga e vivencias de autocuidado"); site da professora; horario de
-- funcionamento do Wellhub (nao e a grade das aulas, que a Satya passa por WhatsApp). Aulas: Yin Yoga,
-- Vinyasa e Hatha. Fotos: 5 do Instagram do estudio e do escritorio de arquitetura que fez o espaco
-- (@casita_arquitetura); nenhuma de IA. Autorizacao de uso das fotos: ainda nao pedida a Satya.
-- Preco: a aula nao tem preco publico, entao o campo fica vazio, nao inventado.
--
-- REVERSAO:
--   delete from public.gostoso_club_partners where business_id = '15238397-df9e-422c-858b-56a5ccb0ed10';
--   delete from public.gostoso_businesses where id = '15238397-df9e-422c-858b-56a5ccb0ed10' and slug = 'casa-surya';
--   (as fotos saem junto com o codigo: public/parceiros/casa-surya/)

insert into public.gostoso_businesses
  (id, name, slug, description, category_id, address, lat, lng, phone, whatsapp, website, instagram,
   cover_url, photos, opening_hours, is_verified, is_featured, plan, active, is_published, services,
   business_type, horario_conferido_em, horario_fonte)
select
  '15238397-df9e-422c-858b-56a5ccb0ed10',
  'Casa Surya',
  'casa-surya',
  'Estúdio de yoga no centro de São Miguel do Gostoso, sob um cajueiro. Aulas de Yin Yoga, Vinyasa e Hatha para todos os níveis, com a professora Satya. A Casa Surya também tem chalés para pequenas e longas estadias.',
  '9180849e-db40-44de-b0d1-3b0a89e53a87',
  'Rua Ubaia Doce, 04, Centro, São Miguel do Gostoso - RN',
  -5.1257439,
  -35.6301226,
  '(61) 98176-0790',
  '5561981760790',
  'https://satyaastroyoga.com/casasurya',
  'casasurya.smg',
  '/parceiros/casa-surya/casa-surya-01.jpg',
  array[
    '/parceiros/casa-surya/casa-surya-01.jpg',
    '/parceiros/casa-surya/casa-surya-02.jpg',
    '/parceiros/casa-surya/casa-surya-03.jpg',
    '/parceiros/casa-surya/casa-surya-04.jpg',
    '/parceiros/casa-surya/casa-surya-05.jpg'
  ],
  '{"seg":{"open":"06:00","close":"20:00","closed":false},"ter":{"open":"06:00","close":"20:00","closed":false},"qua":{"open":"06:00","close":"20:00","closed":false},"qui":{"open":"06:00","close":"20:00","closed":false},"sex":{"open":"06:00","close":"20:00","closed":false},"sab":{"open":"06:00","close":"12:00","closed":false},"dom":{"open":"","close":"","closed":true}}'::jsonb,
  true, false, 'free', true, true,
  '[{"name":"Aula de yoga","price":"","description":"Yin Yoga, Vinyasa e Hatha, todos os níveis"}]'::jsonb,
  'local', '2026-11-07', 'wellhub_07_11'
where not exists (
  select 1 from public.gostoso_businesses
   where id = '15238397-df9e-422c-858b-56a5ccb0ed10' or slug = 'casa-surya'
);

insert into public.gostoso_club_partners (business_id, tipo, beneficio, regra, limite_mensal, valido_ate, status)
select '15238397-df9e-422c-858b-56a5ccb0ed10', 'Yoga',
       '10% de desconto na primeira aula de yoga.',
       'Vale na primeira aula de yoga no Estúdio Casa Surya, até o fim do mês. Cinco primeiras aulas por mês.',
       5, date '2026-11-30', 'no_ar'
 where exists (select 1 from public.gostoso_businesses where id = '15238397-df9e-422c-858b-56a5ccb0ed10')
   and not exists (select 1 from public.gostoso_club_partners where business_id = '15238397-df9e-422c-858b-56a5ccb0ed10');

-- Conferir: 1 linha, verificada, publicada, com 5 fotos e a vantagem no_ar com limite 5 e valido_ate
-- 2026-11-30; o contador da /clube passa a contar mais um parceiro.
select b.name, b.slug, b.is_verified, b.is_published, b.instagram, array_length(b.photos, 1) as fotos,
       c.status, c.beneficio, c.limite_mensal, c.valido_ate
  from public.gostoso_businesses b
  left join public.gostoso_club_partners c on c.business_id = b.id
 where b.slug = 'casa-surya';
