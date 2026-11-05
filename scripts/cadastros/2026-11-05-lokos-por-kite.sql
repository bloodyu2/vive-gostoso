-- Lokos por Kite no guia do Vive Gostoso (05/11/2026): negocio NOVO, verificado e publicado, SEM vantagem do clube.
--
-- Pedido do Victor: a dona da Pousada Oasis dos Ventos mandou o negocio de kite do marido
-- (https://www.instagram.com/lokosporkite) para entrar como estabelecimento verificado. Ele fica no mesmo
-- lugar da pousada (bio: "aulas de kitesurf em Touros e Sao Miguel do Gostoso na pousada @oasisdosventos")
-- e aparece na pagina da plaquinha /p/07, depois da pousada.
--
-- Roda UMA vez, logo depois do merge do PR (regra: nada parcial em producao antes do push final), com as 5
-- fotos JA enviadas ao bucket business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/. Idempotente: o slug e
-- unico. NAO cria linha em gostoso_club_partners (nao ha beneficio definido; nada foi inventado).
--
-- Dados: nome e Instagram vem do perfil; WhatsApp e o do link da bio do Instagram (publico); endereco e o da
-- Oasis dos Ventos (mesmo lugar); fotos sao do Instagram do proprio negocio (nenhuma de IA). O Google nao
-- tem ficha com esse nome (busca no Maps em 05/11), entao nao ha place_id e o botao de avaliar nao aparece.
-- Horario nao conferido: fica vazio, nao inventado.
--
-- REVERSAO:
--   delete from public.gostoso_businesses where id = 'f44adaf0-5da6-41c4-8adc-cdc879c02a98' and slug = 'lokos-por-kite';
--   (e apague a pasta f44adaf0-5da6-41c4-8adc-cdc879c02a98/ do bucket business-photos)

insert into public.gostoso_businesses
  (id, name, slug, description, category_id, profile_id, address, instagram, whatsapp,
   cover_url, photos, is_verified, is_published, active, plan, business_type)
select
  'f44adaf0-5da6-41c4-8adc-cdc879c02a98'::uuid,
  'Lokos por Kite',
  'lokos-por-kite',
  'Aulas de kitesurf em Sao Miguel do Gostoso e em Touros, na Pousada Oasis dos Ventos, e venda de equipamentos e acessorios.',
  c.id,
  null,
  'Condominio Monte Alegre, lote b21, Sao Miguel do Gostoso/RN (Pousada Oasis dos Ventos)',
  'lokosporkite',
  '5584987456580',
  'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/1793907960375-lokos-por-kite-01.jpg',
  array[
    'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/1793907960375-lokos-por-kite-01.jpg',
    'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/1793907960376-lokos-por-kite-02.jpg',
    'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/1793907960377-lokos-por-kite-03.jpg',
    'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/1793907960378-lokos-por-kite-04.jpg',
    'https://wppsmvgbagalczoardfl.supabase.co/storage/v1/object/public/business-photos/f44adaf0-5da6-41c4-8adc-cdc879c02a98/1793907960379-lokos-por-kite-05.jpg'
  ],
  true, true, true, 'free', 'local'
from public.gostoso_categories c
where c.slug = 'kite-windsurf'
on conflict (slug) do nothing;

-- Conferir: 1 linha, verificada, publicada, com 5 fotos e sem vantagem.
select b.name, b.slug, b.is_verified, b.is_published, b.instagram, array_length(b.photos, 1) as fotos,
       (select count(*) from public.gostoso_club_partners p where p.business_id = b.id) as vantagens
  from public.gostoso_businesses b where b.slug = 'lokos-por-kite';
