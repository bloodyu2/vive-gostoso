-- Gostoso Surf School: Instagram, horario e fotos da ficha (11/11/2026), KAN-846.
--
-- A escola respondeu no WhatsApp do Victor em 11/11/2026 (prints conferidos pela coordenacao):
--   1) Instagram correto: @gostososurfschoolll (tres L no final);
--   2) horario das 10h as 16h30, sempre com horario agendado por causa da mare, e agendar e importante;
--   3) a pagina ficou sem foto.
--
-- Roda UMA vez, DEPOIS do merge do PR e do deploy (as fotos moram em public/parceiros/gostoso-surf-school/
-- e so existem no ar depois do deploy; rodar antes quebra as imagens). Idempotente: o UPDATE grava sempre os
-- mesmos valores e so mexe na linha com este id E este slug.
--
-- O QUE ENTRA E O QUE NAO ENTRA
-- - Horario: o texto da escola nao diz em quais dias da semana ela atende, so "10h as 16h30, com horario
--   agendado". `opening_hours` e uma grade por dia (e a pagina pode mostrar "aberto agora"), entao NAO foi
--   preenchida: dia da semana inventado e pior que nao ter. O horario entra na descricao, com o aviso de
--   agendar. Quando a escola disser os dias, preencher `opening_hours`, `horario_conferido_em` e
--   `horario_fonte` (padrao do SQL da Casa Surya).
-- - Foto principal (ajuste de 11/11 a pedido do Victor): a LOGO da escola, que o Victor ja tinha entregue
--   (Drive da Balaio, "Vive Gostoso - Passaporte - Gostoso Surf School - logo.jpeg", linkada no KAN-846 em
--   11/11 as 07h50; copia recortada ja no repositorio em public/parceiros/gostoso-surf-school/logo.jpg, PR 76).
--   Capa e primeira foto = logo. Os dois quadros abaixo ficam so como fotos de apoio.
-- - Fotos de apoio: dois quadros dos Reels publicos da propria escola (@gostososurfschoolll), os mesmos que ja
--   entram no carrossel de 17/11 com credito na legenda: o rack de pranchas (capa) e o por do sol na praia.
--   Sao quadros de video de 640 px, nao os originais, e a autorizacao de uso NAO foi pedida a escola ainda
--   (mesmo caso da Casa Surya). Trocar pelos originais assim que ela mandar. Nenhuma foto e de IA.
-- - Continuam vazios, nao inventados: endereco, lat/lng, site e preco. `is_verified` segue falso.
--
-- REVERSAO (valores de antes, vindos do SQL de 2026-11-11-gostoso-surf-school-clube.sql):
--   update public.gostoso_businesses
--      set instagram = null, cover_url = null, photos = '{}'::text[],
--          description = 'Escola de surf e SUP em São Miguel do Gostoso. Aulas para iniciantes, intermediários e avançados e aluguel de pranchas de surf e SUP, para quem já sabe surfar ou remar. Combine dia e horário pelo WhatsApp.'
--    where id = '1d6b687c-cc25-4617-a0fa-068908048f74' and slug = 'gostoso-surf-school';
--   (as fotos saem junto com o codigo: public/parceiros/gostoso-surf-school/gostoso-surf-school-0*.jpg)

update public.gostoso_businesses
   set instagram   = 'gostososurfschoolll',
       cover_url   = '/parceiros/gostoso-surf-school/logo.jpg',
       photos      = array[
         '/parceiros/gostoso-surf-school/logo.jpg',
         '/parceiros/gostoso-surf-school/gostoso-surf-school-01.jpg',
         '/parceiros/gostoso-surf-school/gostoso-surf-school-02.jpg'
       ],
       description = 'Escola de surf e SUP em São Miguel do Gostoso. Aulas para iniciantes, intermediários e avançados e aluguel de pranchas de surf e SUP, para quem já sabe surfar ou remar. Atendimento das 10h às 16h30, sempre com horário agendado por causa da maré: agende pelo WhatsApp.'
 where id = '1d6b687c-cc25-4617-a0fa-068908048f74'
   and slug = 'gostoso-surf-school';

-- Conferir: 1 linha, publicada, Instagram, capa e 2 fotos, descricao com o horario.
select b.name, b.slug, b.is_published, b.instagram, b.cover_url, array_length(b.photos, 1) as fotos, b.description
  from public.gostoso_businesses b
 where b.slug = 'gostoso-surf-school';
