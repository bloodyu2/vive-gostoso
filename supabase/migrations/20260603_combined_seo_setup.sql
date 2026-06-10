-- ============================================================
-- Migration combinada: SEO Content Hub -- Vive Gostoso
-- 2026-06-03
-- Grants + Categorias + 5 posts-pilar
-- ============================================================

-- ============================================================
-- PARTE 1: Grants para tabelas existentes
-- ============================================================

grant select on public.gostoso_businesses to anon;
grant select, insert, update, delete on public.gostoso_businesses to authenticated;
grant all on public.gostoso_businesses to service_role;

grant select on public.gostoso_events to anon;
grant select, insert, update, delete on public.gostoso_events to authenticated;
grant all on public.gostoso_events to service_role;

grant select on public.gostoso_categories to anon;
grant select, insert, update, delete on public.gostoso_categories to authenticated;
grant all on public.gostoso_categories to service_role;

grant select on public.gostoso_fund_entries to anon;
grant select, insert, update, delete on public.gostoso_fund_entries to authenticated;
grant all on public.gostoso_fund_entries to service_role;

grant select on public.gostoso_goals to anon;
grant select, insert, update, delete on public.gostoso_goals to authenticated;
grant all on public.gostoso_goals to service_role;

grant select on public.gostoso_blog_posts to anon;
grant select, insert, update, delete on public.gostoso_blog_posts to authenticated;
grant all on public.gostoso_blog_posts to service_role;

grant select on public.gostoso_claim_requests to anon;
grant select, insert, update, delete on public.gostoso_claim_requests to authenticated;
grant all on public.gostoso_claim_requests to service_role;

grant select on public.gostoso_event_submissions to anon;
grant select, insert, update, delete on public.gostoso_event_submissions to authenticated;
grant all on public.gostoso_event_submissions to service_role;

grant select on public.gostoso_transfers to anon;
grant select, insert, update, delete on public.gostoso_transfers to authenticated;
grant all on public.gostoso_transfers to service_role;

grant select on public.gostoso_professionals to anon;
grant select, insert, update, delete on public.gostoso_professionals to authenticated;
grant all on public.gostoso_professionals to service_role;

-- ============================================================
-- PARTE 2: Novas categorias
-- ============================================================

INSERT INTO gostoso_categories (id, name, slug, verb, icon, color, display_order, active)
VALUES
  ('615e279c-16b4-4934-9ea7-1dceb1219324', 'Farmácia',          'farmacia',          'resolva', 'pharmacy',      '#E53E3E', 11, true),
  ('1ae0fc17-73f2-427f-b387-f46dcdbb515b', 'Mercado',           'mercado',           'resolva', 'shopping-cart', '#38A169', 12, true),
  ('8f3e4a2b-9c1d-4e5f-8a7b-6c9d0e1f2a3b', 'Posto de Gasolina','posto-gasolina',    'resolva', 'gas-station',   '#DD6B20', 13, true),
  ('5b59e94e-91aa-417d-859f-140511496f3d', 'Lavanderia',        'lavanderia',        'resolva', 'shirt',         '#3182CE', 14, true),
  ('7c4d5e6f-8a9b-0c1d-2e3f-4a5b6c7d8e9f', 'Aluguel de Bicicletas','aluguel-bicicletas','passeie','bicycle',       '#805AD5', 15, true),
  ('9e8f7a6b-5c4d-3e2f-1a0b-9c8d7e6f5a4b', 'Escola de Kite/Wind','escola-kite-wind', 'passeie', 'umbrella',      '#0D7C7C', 16, true),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Bar / Balada',     'bar-balada',        'come',    'beer',          '#D69E2E', 17, true),
  ('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Loja de Conveniência','loja-conveniencia','resolva','shopping-bag',  '#E53E3E', 18, true),
  ('6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c', 'Médico / Clínica', 'medico-clinica',   'resolva', 'heart',         '#E53E3E', 19, true),
  ('8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e', 'Dentista',         'dentista',          'resolva', 'smile',         '#38A169', 20, true),
  ('0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a', 'ATM / Banco',      'atm-banco',         'resolva', 'credit-card',   '#2B6CB0', 21, true),
  ('2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c', 'Pet Shop',         'pet-shop',          'resolva', 'paw-print',     '#DD6B20', 22, true),
  ('4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e', 'Academia',         'academia',          'resolva', 'dumbbell',      '#805AD5', 23, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PARTE 3: Coluna faq_jsonld + 5 posts-pilar SEO
-- ============================================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'gostoso_blog_posts' and column_name = 'faq_jsonld'
  ) then
    alter table public.gostoso_blog_posts add column faq_jsonld text;
  end if;
end $$;

INSERT INTO gostoso_blog_posts (slug, title, excerpt, content, tags, faq_jsonld, is_published, published_at, author, cover_url) VALUES

-- Post 1: Como Chegar
(
  'como-chegar-sao-miguel-do-gostoso',
  'Como Chegar em São Miguel do Gostoso: Guia Completo 2026',
  'Tudo sobre como chegar em São Miguel do Gostoso: de avião, carro e ônibus. Dicas de transfer, estradas e o aeroporto mais próximo.',
  '<p>São Miguel do Gostoso não tem aeroporto próprio. Mas não precisa: o aeroporto mais perto fica a 70 km, a estrada é boa e o caminho já é parte da experiência. Este guia traz tudo que você precisa saber pra chegar em Gostoso, seja de avião, carro ou ônibus, com dicas de quem faz esse trajeto toda semana e conhece cada curva da RN-160.</p><h2>De avião: o aeroporto mais próximo</h2><p>O aeroporto mais próximo de São Miguel do Gostoso é o <strong>Aeroporto Gov. Aluízio Alves</strong>, em Mossoró (OYK), a cerca de 70 km. O segundo mais usado é o <strong>Aeroporto Internacional de Natal</strong> (NAT), a 160 km. A escolha depende de onde você está saindo e qual companhia tem voo direto para a região.</p><h3>Aeroporto de Mossoró (OYK): 70 km de Gostoso</h3><p>Inaugurado em 2014, o aeroporto de Mossoró recebe voos da Azul e da Gol a partir de Recife, Fortaleza, São Paulo e Belo Horizonte. A vantagem é a distância curta: em 1h15 de carro você já está na praia. O aeroporto é moderno, pequeno e sem confusão: em 20 minutos você já está no carro a caminho de Gostoso.</p><ul><li><strong>Distância até Gostoso:</strong> 70 km</li><li><strong>Tempo de carro:</strong> 1h15 a 1h30</li><li><strong>Transfer particular:</strong> R$ 200 a R$ 350</li><li><strong>Transfer compartilhado:</strong> a partir de R$ 80 por pessoa</li></ul><h3>Aeroporto de Natal (NAT): 160 km de Gostoso</h3><p>O aeroporto de Natal tem mais voos, mais companhias e mais frequência que o de Mossoró. Latam, Gol e Azul operam rotas diretas a partir de Brasília, São Paulo (Guarulhos e Congonhas), Rio de Janeiro, Recife, Salvador e Belo Horizonte. Se o seu voo direto sai de Mossoró, ótimo. Se não, Natal é a opção mais prática.</p><ul><li><strong>Distância até Gostoso:</strong> 160 km</li><li><strong>Tempo de carro:</strong> 2h a 2h30</li><li><strong>Transfer particular:</strong> R$ 300 a R$ 500</li><li><strong>Transfer compartilhado:</strong> a partir de R$ 100 por pessoa</li></ul><p>A rota de Natal a Gostoso pela RN-160 é pavimentada e bem sinalizada. O trecho passa por Ceará-Mirim e Pureza, com paisagem de coqueiral que já coloca o visitante no clima nordestino.</p><h2>De carro: rotas e distâncias</h2><h3>Vindo de Natal (160 km, 2h a 2h30)</h3><p>Saia de Natal pela BR-406 sentido Mossoró. Após Ceará-Mirim, pegue a RN-160 em direção a São Miguel do Gostoso. A estrada é pavimentada do início ao fim. Não há pedágio nesse trecho.</p><h3>Vindo de Mossoró (70 km, 1h15)</h3><p>Saia de Mossoró pela RN-116 sentido litoral até o entroncamento com a RN-160. Dobre à esquerda em direção a Gostoso. Estrada pavimentada, pouco movimento, paisagem de caatinga que muda pra coqueiral conforme se aproxima do mar.</p><h3>Vindo de Fortaleza (480 km, 5h30 a 6h)</h3><p>Pegue a BR-222 ou a CE-040 até Mossoró, depois RN-116 e RN-160 até Gostoso. Dica: abasteça em Fortaleza antes de sair. Os postos entre Mossoró e Gostoso são poucos e com horário limitado.</p><h3>Vindo de João Pessoa (220 km, 3h a 3h30)</h3><p>BR-101 sul até Goianinha, depois RN-160 em direção a Gostoso. Rota simples e bem pavimentada.</p><h3>Vindo de Recife (400 km, 5h a 5h30)</h3><p>BR-101 norte até Goianinha (RN), depois RN-160 até Gostoso. Rota longa mas direta, toda asfaltada.</p><h2>De ônibus</h2><p>A Empresa Nordeste opera a linha entre Natal e São Miguel do Gostoso. O ônibus sai do Terminal Rodoviário de Natal e a viagem dura cerca de 2h45, custando em torno de R$ 25 a R$ 35. Horários variam conforme o dia da semana: consulte a empresa diretamente.</p><h2>Transfer: a opção mais prática</h2><p>Transfer particular de Mossoró: R$ 200 a R$ 350 (1h15). Transfer de Natal: R$ 300 a R$ 500 particular, a partir de R$ 100 compartilhado (2h a 2h30). Combine com pelo menos 24h de antecedência.</p><h2>Aluguel de carro</h2><p>Locadoras como Hertz, Localiza, Movida e Unidas têm balcão nos aeroportos de Natal e Mossoró. Preços: econômico R$ 120 a R$ 180/dia, SUV R$ 200 a R$ 350/dia na alta temporada.</p><p><strong>Dicas de direção:</strong> a RN-160 é pavimentada mas sem acostamento em trechos. Cuidado com animais na pista depois das 18h. Abasteça em Ceará-Mirim ou Mossoró. Não há pedágio.</p><h2>Dicas finais de quem mora aqui</h2><ul><li>Voo que chega à noite? Mossoró é melhor que Natal (trajeto mais curto e estrada mais tranquila)</li><li>Alta temporada: reserve transfer com 3+ dias de antecedência</li><li>Combine tudo por WhatsApp — motoristas respondem rápido</li><li>Na dúvida entre Natal e Mossoró: veja o preço da passagem aérea</li></ul>',
  ARRAY['como chegar','transfer','aeroporto','ônibus'],
  '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Tem aeroporto em São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Não. O aeroporto mais próximo fica em Mossoró (OYK), a 70 km, ou em Natal (NAT), a 160 km."}},{"@type":"Question","name":"Qual o aeroporto mais perto de São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"O Aeroporto Gov. Aluízio Alves, em Mossoró (OYK), a 70 km. O de Natal (NAT) fica a 160 km mas tem mais voos."}},{"@type":"Question","name":"Tem ônibus direto de Natal para São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Sim, a Empresa Nordeste opera a linha. A viagem dura cerca de 2h45 e custa R$ 25 a R$ 35. Frequência limitada."}},{"@type":"Question","name":"Quanto custa transfer de Mossoró para Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Transfer particular de Mossoró custa entre R$ 200 e R$ 350. Compartilhado a partir de R$ 80 por pessoa."}},{"@type":"Question","name":"A estrada para São Miguel do Gostoso é pavimentada?","acceptedAnswer":{"@type":"Answer","text":"Sim. A RN-160 é pavimentada do início ao fim. Cuidado com animais na pista depois das 18h."}}]}',
  true, now(), 'Vive Gostoso', NULL
),

-- Post 2: Kitesurf
(
  'kitesurf-sao-miguel-do-gostoso',
  'Kitesurf em São Miguel do Gostoso: A Meca do Kite no Nordeste',
  'Por que Gostoso é referência mundial em kitesurf. Spots, escolas, melhores épocas e tudo para planejar sua temporada de kite.',
  '<p>São Miguel do Gostoso é um dos melhores destinos de kitesurf do planeta. Vento constante, água plana, temperatura amena e uma comunidade que faz da vila um second home para kiters do mundo inteiro.</p><h2>Por que Gostoso é a meca do kite</h2><ul><li><strong>Água plana e rasa:</strong> fundo de areia, água que dá pra ficar de pé até 200 m da costa</li><li><strong>Temperatura da água:</strong> 26 a 28 graus o ano inteiro, sem wetsuit</li><li><strong>Variedade de spots:</strong> flat water, ondas, lagoas num raio de 15 km</li><li><strong>Infraestrutura completa:</strong> escolas, aluguel, guarderia, reparo, lojas</li><li><strong>Comunidade acolhedora:</strong> kiters do Brasil, Europa e América do Norte</li></ul><h2>Ponta do Santo Cristo: o spot mais famoso</h2><p>Vento sudeste (side-onshore), 20 a 35 nós na temporada, água flat a chop leve, fundo de areia, sem obstáculos. Na temporada chega a ter 50+ kites na água ao mesmo tempo.</p><h2>Praia do Marco: flat water para iniciantes</h2><p>A 8 km do centro, forma uma laguna de água parada na maré baixa. Ideal para aprender: água rasa, sem correnteza, vento constante.</p><h2>Melhores épocas</h2><p>Temporada: agosto a março. Pico: setembro a janeiro (25 a 35 nós). Outubro é geralmente o melhor mês. Abril a julho: vento fraco (5 a 15 nós).</p><h2>Preços médios (2026)</h2><ul><li>Aula particular (1h): R$ 200 a R$ 300</li><li>Pacote iniciante (6 a 8h): R$ 1.000 a R$ 1.800</li><li>Kite completo (1 dia): R$ 150 a R$ 250</li><li>Guarderia (1 dia): R$ 20 a R$ 40</li></ul><h2>Wingfoil e windfoil</h2><p>Gostoso também é ponto de wingfoil e windfoil. O Campeonato Brasileiro de Wing Foil já teve etapa aqui. Aulas de wing: R$ 200 a 300/hora.</p><h2>Depois do kite</h2><p>Buggy até Tourinhos, catamarã ao pôr do sol, gastronomia de frutos do mar. O pôr do sol na Praia da Xepa é o ponto de encontro de toda a comunidade kite.</p>',
  ARRAY['kitesurf','wind','esportes náuticos','ponta do santo cristo'],
  '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Quando é a temporada de kitesurf em São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"De agosto a março, com pico entre setembro e janeiro (25 a 35 nós). Outubro é o melhor mês."}},{"@type":"Question","name":"Onde ficar em Gostoso para praticar kite?","acceptedAnswer":{"@type":"Answer","text":"Na Ponta do Santo Cristo, com pousadas a 2-5 minutos da praia. Veja opções em vivegostoso.com.br/fique"}},{"@type":"Question","name":"Preciso levar equipamento de kitesurf?","acceptedAnswer":{"@type":"Answer","text":"Não. Escolas oferecem aluguel a partir de R$ 150/dia. Guarderia a R$ 20-40/dia."}},{"@type":"Question","name":"Tem aula para iniciante em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Sim, é uma das melhores cidades para aprender. Pacote iniciante (6 a 8h): R$ 1.000 a R$ 1.800."}},{"@type":"Question","name":"Qual o spot mais famoso?","acceptedAnswer":{"@type":"Answer","text":"Ponta do Santo Cristo. Água plana, vento side-onshore, fundo de areia."}}]}',
  true, now(), 'Vive Gostoso', NULL
),

-- Post 3: O Que Fazer
(
  'o-que-fazer-sao-miguel-do-gostoso',
  'O Que Fazer em São Miguel do Gostoso: 20 Experiências Imperdíveis',
  'Praias, passeios de buggy, kite, gastronomia, vida noturna e eventos. O guia completo do que fazer em Gostoso, com dicas de morador.',
  '<p>São Miguel do Gostoso tem 10 km de orla, 8 praias distintas, restaurantes surpreendentes e um calendário de eventos que lota a cidade. Este guia traz as 20 experiências que você não pode pular.</p><h2>Praias imperdíveis</h2><h3>1. Praia da Xepa</h3><p>A praia do pôr do sol. No centro, com barraquinhas de drinks, música ao vivo e o céu que parece pintado. A cidade para todo dia pra ver o sol se pôr.</p><h3>2. Ponta do Santo Cristo</h3><p>O paraíso do kitesurf. Mesmo sem fazer kite, vale ir pra ver os kites coloridos contra o céu.</p><h3>3. Praia de Tourinhos</h3><p>Dunas vermelhas, piscinas naturais, farol abandonado no topo. A mais fotografada de Gostoso.</p><h3>4. Praia do Maceió</h3><p>Água cristalina e morna. Perfeita para famílias. Fundo raso, sem correnteza.</p><h3>5. Praia do Marco</h3><p>Flat water, point de kiters iniciantes. Escolas de kite e barracas.</p><h2>Passeios de buggy</h2><ul><li><strong>Buggy até Tourinhos:</strong> 2 a 3h, R$ 150 a 250 por buggy (4 pessoas)</li><li><strong>Buggy até Lagoa de Pitangui:</strong> meio dia, R$ 300 a 500</li><li><strong>Buggy noturno ao pôr do sol:</strong> combine com motorista local</li><li><strong>Buggy até Zé Martins:</strong> praia deserta, meio dia, R$ 300 a 500</li></ul><h2>Kitesurf e esportes náuticos</h2><p>Aula de kite: pacote de 8h a partir de R$ 1.000. SUP: R$ 50 a 80/dia. Windsurf e wingfoil na Ponta do Santo Cristo.</p><h2>Passeios de barco</h2><p>Catamarã ao pôr do sol: R$ 80 a 120 por pessoa, 1h30 de navegação. Passeio de jangada com pescador local: experiência autêntica.</p><h2>Gastronomia</h2><p>Frutos do mar frescos na orla, tapioca com queijo coalho nas barracas da Xepa, restaurantes autorais no centro. Pratos a partir de R$ 40.</p><h2>Vida noturna</h2><p>Pôr do sol na Xepa todo dia a partir das 16h. Bares no centro com forró ao vivo até 23h. Gostoso não é destino de balada.</p><h2>Eventos</h2><p>Gostoso Sunset Festival (jul-set), Réveillon do Gostoso (28 dez a 2 jan), Bossa Nova & Jazz, Open de Beach Tênis, Festival Eita Camarão, Mostra de Cinema, Campeonato Brasileiro de Wing Foil.</p><h2>Roteiro de 3 dias</h2><p>Dia 1: Chegada, Xepa, pôr do sol. Dia 2: Buggy até Tourinhos, almoço no Maceió. Dia 3: Kite ou SUP, almoço, saída.</p><h2>Roteiro de 5 dias</h2><p>Dia 1: Chegada, Xepa. Dia 2: Buggy Tourinhos + Cardeiro. Dia 3: Kite + catamarã. Dia 4: Lagoa de Pitangui. Dia 5: Artesanato, saída.</p>',
  ARRAY['o que fazer','passeios','praias','gastronomia'],
  '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Quantos dias ficar em São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Mínimo 3 dias. Ideal: 5 dias. Para temporada de kite: 7 a 14 dias."}},{"@type":"Question","name":"Tem praia para crianças em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Sim. Praia do Maceió e Xepa têm água rasa e morna. Tourinhos tem piscinas naturais na maré baixa."}},{"@type":"Question","name":"Tem vida noturna em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Discreta: pôr do sol na Xepa com música, bares com forró até 23h. Para balada, Pipa fica a 3h30."}},{"@type":"Question","name":"Precisa de carro em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Não é obrigatório. O centro é caminhável. Para praias distantes, buggy ou mototaxi."}}]}',
  true, now(), 'Vive Gostoso', NULL
),

-- Post 4: Praias
(
  'praias-sao-miguel-do-gostoso',
  'As 8 Melhores Praias de São Miguel do Gostoso: Guia com Mapa',
  'Da Ponta do Santo Cristo à Praia do Amor: conheça as 8 praias de Gostoso, como chegar, para quem cada uma é ideal e dicas de morador.',
  '<p>São Miguel do Gostoso tem 8 praias ao longo de 10 km de orla, cada uma com personalidade própria. Este guia traz cada praia em detalhe.</p><h2>1. Ponta do Santo Cristo</h2><p>A rainha do kite. Vento lateral-direita, água plana, fundo de areia. 4 km do centro. Ideal para kiters e windsurfistas. Escolas, aluguel, barracas.</p><h2>2. Praia do Marco</h2><p>Paraíso do flat water. 8 km do centro. Ideal para iniciantes de kite. Água rasa e parada, sem ondas.</p><h2>3. Praia do Maceió</h2><p>A praia da família. 2 km do centro. Água cristalina, morna e calma. Barracas completas. Perfeita para crianças.</p><h2>4. Praia de Tourinhos</h2><p>A mais fotografada. 12 km do centro, só de buggy. Dunas vermelhas, piscinas naturais, farol abandonado.</p><h2>5. Praia do Minhoto</h2><p>A praia dos pescadores. 1,5 km do centro. Jangadas coloridas, peixe fresco direto do barco. Cultura viva.</p><h2>6. Praia do Cardeiro</h2><p>Sossego perto do centro. 3 km. Menos frequentada, ideal para banho e piquenique.</p><h2>7. Praia de Zé Martins</h2><p>A praia escondida. 15 km, só de buggy. Areia branca, coqueiros, privacidade total.</p><h2>8. Praia do Amor</h2><p>A praia romântica. 10 km. Formato de concha, protegida do vento. Ideal para casais e snorkel.</p><h2>Qual praia escolher: guia rápido</h2><p>Kitesurf: Ponta do Santo Cristo ou Marco. Família: Maceió. Fotos: Tourinhos. Cultura: Minhoto. Romantismo: Amor. Isolamento: Zé Martins. Sossego perto: Cardeiro. Pôr do sol: Xepa.</p>',
  ARRAY['praias','ponta do santo cristo','maceió','tourinhos'],
  '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Qual a praia mais bonita de São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Tourinhos é a mais fotografada (dunas vermelhas). Ponta do Santo Cristo é a mais famosa (kite). Xepa tem o melhor pôr do sol."}},{"@type":"Question","name":"Tem praia com piscina natural em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Sim. Tourinhos e Maceió formam piscinas naturais na maré baixa."}},{"@type":"Question","name":"Qual praia é melhor para kitesurf?","acceptedAnswer":{"@type":"Answer","text":"Ponta do Santo Cristo (spot principal) e Praia do Marco (iniciantes)."}},{"@type":"Question","name":"Tem praia calma para crianças?","acceptedAnswer":{"@type":"Answer","text":"Praia do Maceió é a melhor: água rasa, morna e sem correnteza."}}]}',
  true, now(), 'Vive Gostoso', NULL
),

-- Post 5: Pousadas
(
  'pousadas-sao-miguel-do-gostoso',
  'Pousadas em São Miguel do Gostoso: Onde Ficar em 2026',
  'Guia completo de pousadas em Gostoso: regiões, preços, temporada e como reservar direto com os donos, sem intermediário.',
  '<p>São Miguel do Gostoso tem cerca de 250 meios de hospedagem. Mas diferente de destinos massificados, aqui a maioria é familiar: o dono te recebe na porta.</p><h2>Por região</h2><h3>Centro (Praia da Xepa)</h3><p>Tudo perto, caminhável. Ideal para quem quer vida social. R$ 150 a 400 (baixa) / R$ 250 a 700 (alta).</p><h3>Orla: pé na areia</h3><p>Vista para o mar, acesso direto à praia. R$ 250 a 600 (baixa) / R$ 400 a 1.000 (alta).</p><h3>Ponta do Santo Cristo</h3><p>A região dos kiters. Pousadas a 2-5 minutos da água. R$ 200 a 500 (baixa) / R$ 350 a 800 (alta).</p><h2>Tipos de pousada</h2><ul><li><strong>Boutique:</strong> decoração cuidada, R$ 400 a 1.000 na alta</li><li><strong>Familiar:</strong> custo-benefício, R$ 150 a 350 na alta</li><li><strong>Chalés:</strong> mais espaço e privacidade, R$ 200 a 600 na alta</li><li><strong>Hostel:</strong> R$ 60 a 120 na alta</li></ul><h2>Airbnb vs pousada</h2><p>Reservar direto com a pousada sai até 20% mais barato que Airbnb (sem taxa de plataforma). O dono recebe mais e você paga menos.</p><h2>Melhor época para reservar</h2><p>Alta temporada (dez-fev, jul): reserve com 3+ meses de antecedência. Temporada de kite (ago-nov): 2 a 4 semanas. Baixa temporada (mar-jun): 1 a 2 semanas.</p>',
  ARRAY['pousadas','hospedagem','onde ficar'],
  '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Quanto custa pousada em São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Baixa temporada: R$ 120 a 200 (simples), R$ 300 a 500 (boutique). Alta: R$ 250 a 400 (simples), R$ 600 a 1.200 (boutique)."}},{"@type":"Question","name":"Qual a melhor região para ficar em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Centro (vida social), orla (vista), Ponta do Santo Cristo (kite), estrada (orçamento)."}},{"@type":"Question","name":"Tem pousada all inclusive em Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Não. A maioria oferece café da manhã incluso. A cidade tem bons restaurantes próximos."}},{"@type":"Question","name":"Pousada em Gostoso aceita pet?","acceptedAnswer":{"@type":"Answer","text":"Algumas aceitam. Verifique antes de reservar informando o porte do animal."}}]}',
  true, now(), 'Vive Gostoso', NULL
);

-- grants do blog
grant select on public.gostoso_blog_posts to anon;
grant select, insert, update, delete on public.gostoso_blog_posts to authenticated;
grant all on public.gostoso_blog_posts to service_role;
