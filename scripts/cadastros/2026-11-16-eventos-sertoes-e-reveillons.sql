-- Agenda do /participe: Sertoes Kitesurf e as quatro festas de reveillon (16/11/2026), item 103 da auditoria KAN-888.
--
-- Pedido do Victor em 16/11/2026 (decisao no cartao, via coordenadora): cadastrar o Sertoes Kitesurf e as quatro
-- festas de reveillon que o blog ja lista. Os dados vem dos posts publicados no proprio site, conferidos nas
-- fontes oficiais em 10/11 (reveillons) e 12/11 (Sertoes), e `source_url` aponta para o post, que tem a fonte de
-- cada evento. Nada foi inventado: sem preco (lote muda), sem atracao alem do que o post diz, sem horario de
-- encerramento que a fonte nao deu (`ends_at` nulo no Reveillon da Praia e na etapa do Sertoes alem do dia).
--
-- Horarios em Brasilia (UTC-3) convertidos para UTC. Idempotente: so insere se nao existir evento com o mesmo
-- nome e a mesma data de inicio. Roda UMA vez, depois do deploy (as capas ja existem em public/images/events).
--
-- NAO MEXE no evento antigo "Reveillon do Gostoso" (26/12 a 02/01, fonte festaserrejota.com.br): ele nao esta entre
-- as quatro festas do guia de 10/11 e a fonte nao foi reconferida; decisao do Victor se sai ou fica.
--
-- REVERSAO:
--   delete from public.gostoso_events
--    where name in ('Sertões Kitesurf 2026: etapa com largada em Gostoso', 'Réveillon Amy Gostoso',
--                   'Aqui Se Faz Gostoso (réveillon)', 'Réveillon da Praia (Bar da Praia)', 'Réveillon Solarium');

with novos(name, description, starts_at, ends_at, location, cover_url, event_type, source_url) as (
  values
  (
    'Sertões Kitesurf 2026: etapa com largada em Gostoso',
    'Travessia de kitesurf em etapas entre Touros (RN) e Fortim (CE), de 25 a 28 de novembro. A segunda etapa parte de São Miguel do Gostoso, do Kauli Seadi Beach Hotel, rumo a Galinhos. O horário da largada em Gostoso ainda não estava divulgado em 12/11; confirme com a organização.',
    timestamptz '2026-11-25 12:00:00+00',
    timestamptz '2026-11-28 21:00:00+00',
    'Kauli Seadi Beach Hotel, São Miguel do Gostoso (largada da 2ª etapa)',
    '/images/events/wing_foil.jpg',
    'esporte',
    'https://www.vivegostoso.com.br/blog/copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso'
  ),
  (
    'Réveillon Amy Gostoso',
    'Virada pé na areia, das 21h às 5h30, com DJ Leandro Rallo e convidados (house music) e open bar e open food segundo a organização. Há traslado exclusivo e opcional saindo da Rua da Xêpa. Ingresso e dúvidas no site oficial e no perfil @amy.gostoso.',
    timestamptz '2027-01-01 00:00:00+00',
    timestamptz '2027-01-01 08:30:00+00',
    'Restaurante Coco Gostoso, Praia Morro dos Martins',
    '/images/events/reveillon.jpg',
    'festival',
    'https://www.vivegostoso.com.br/blog/reveillon-sao-miguel-do-gostoso-2027-festas-e-ingressos'
  ),
  (
    'Aqui Se Faz Gostoso (réveillon)',
    'Três noites no Dune Beach & Ville: 31 de dezembro às 21h30, 2 de janeiro às 20h e 3 de janeiro às 16h, com mais de 12 atrações, entre elas Malive e Dre Guazzelli. Open bar premium na noite da virada. Ingressos pela Ingresse e no perfil @reveillonaquisefazgostoso.',
    timestamptz '2027-01-01 00:30:00+00',
    timestamptz '2027-01-04 02:00:00+00',
    'Dune Beach & Ville, São Miguel do Gostoso',
    '/images/events/reveillon.jpg',
    'festival',
    'https://www.vivegostoso.com.br/blog/reveillon-sao-miguel-do-gostoso-2027-festas-e-ingressos'
  ),
  (
    'Réveillon da Praia (Bar da Praia)',
    'Virada no Bar da Praia, pé na areia, a partir das 22h, com Rádio Axé, Dani Cruz, DJ Fornox e DJ Cari. Venda por lotes, pelo OutGo ou pelo WhatsApp do perfil @dapraiareveillon; confirme o lote e o valor atuais com a organização.',
    timestamptz '2027-01-01 01:00:00+00',
    null,
    'Bar da Praia, Rua dos Corais, São Miguel do Gostoso',
    '/images/events/reveillon.jpg',
    'festival',
    'https://www.vivegostoso.com.br/blog/reveillon-sao-miguel-do-gostoso-2027-festas-e-ingressos'
  ),
  (
    'Réveillon Solarium',
    'Réveillon Solarium, Gostoso de Viver 2027, das 21h às 2h, com banda ao vivo, DJ retrô, ceia de Ano-Novo e queima de fogos incluídas. Vendas pelo Sympla até 29/12/2026; confira valores e regras na página de venda. Cooler liberado e rolha free.',
    timestamptz '2027-01-01 00:00:00+00',
    timestamptz '2027-01-01 05:00:00+00',
    'Pousada Solarium de Gostoso, Rua dos Dourados, 380',
    '/images/events/reveillon.jpg',
    'festival',
    'https://www.vivegostoso.com.br/blog/reveillon-sao-miguel-do-gostoso-2027-festas-e-ingressos'
  )
)
insert into public.gostoso_events (name, description, starts_at, ends_at, location, cover_url, event_type, is_featured, source_url, active)
select n.name, n.description, n.starts_at, n.ends_at, n.location, n.cover_url, n.event_type, false, n.source_url, true
  from novos n
 where not exists (
   select 1 from public.gostoso_events e where e.name = n.name and e.starts_at = n.starts_at
 );
