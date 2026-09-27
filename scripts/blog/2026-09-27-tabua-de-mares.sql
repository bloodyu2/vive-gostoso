-- Post "Tábua de marés de São Miguel do Gostoso", em pt, es e en (27/09/2026).
--
-- A tabela gostoso_blog_posts não tem coluna de idioma: cada idioma é uma linha
-- com slug próprio, e o site liga as três por src/data/blog-traducoes.json
-- (hreflang, redirecionamento e lista do blog por idioma).
--
-- Capa: servida pelo próprio site, rota /api/og/blog-mares?lang=xx. Sem upload.
--
-- COMO APLICAR (em duas partes):
--   Parte 1 pode rodar a qualquer momento: grava as três linhas NÃO publicadas.
--   Parte 2 só depois do deploy da branch feat/blog-bio-vitrine estar READY na
--   master: publica as três. Antes desse deploy, o código em produção não
--   conhece o mapa de traduções e mostraria as três versões na lista em pt.
--
-- Idempotente: a parte 1 usa "where not exists" e a parte 2 só toca estes três
-- slugs. Nenhum outro post é alterado.

-- ===================== PARTE 1: gravar (não publicado) =====================

INSERT INTO public.gostoso_blog_posts
  (slug, title, excerpt, content, cover_url, author, tags, is_published, published_at, faq_jsonld)
SELECT v.slug, v.title, v.excerpt, v.content, v.cover_url, 'Vive Gostoso', v.tags, false, '2026-09-27 09:00:00-03'::timestamptz, NULL
FROM (VALUES
(
  'tabua-de-mares-sao-miguel-do-gostoso',
  'Tábua de marés de São Miguel do Gostoso: a maré de hoje, praia por praia',
  'Horário e altura da maré alta e baixa em 14 praias de Gostoso, Touros e Pedra Grande, com o melhor horário para as piscinas do Cardeiro e os parrachos de Perobas.',
  $POST_PT$
<p>Quem passa uns dias em São Miguel do Gostoso aprende rápido que a maré manda no roteiro. Chegar ao Cardeiro na maré alta é dar de cara com o mar em cima das pedras, sem nenhuma piscina à vista. Duas horas depois, na maré baixa, a mesma praia vira um conjunto de piscinas rasas e mornas entre as rochas. O passeio é o mesmo, e o horário muda tudo.</p>

<p>Foi pensando nisso que o Vive Gostoso ganhou uma <a href="/explore/mares">tábua de marés</a> própria, organizada por praia.</p>

<h2>Como funciona</h2>

<p>Você escolhe a praia e o dia. A página mostra:</p>

<ul>
<li>o horário e a altura de cada maré alta e baixa;</li>
<li>uma curva do dia, com a marcação de agora;</li>
<li>a fase da lua;</li>
<li>o que a maré muda naquela praia e o melhor horário para aproveitar.</li>
</ul>

<p>A previsão cobre hoje e os próximos sete dias, e cada praia tem um link próprio, fácil de mandar no grupo da viagem.</p>

<h2>De onde vêm os dados</h2>

<p>Os horários vêm das Tábuas de Maré oficiais da <a href="https://www.marinha.mil.br/chm/tabuas-de-mare-6" target="_blank" rel="noopener noreferrer">Marinha do Brasil</a>, publicadas pelo Centro de Hidrografia. Gostoso não tem estação própria, então cada praia usa a estação mais próxima. Para Gostoso e Pedra Grande, é o Porto de Guamaré. Para Touros, é o Porto de Natal. Na areia, a maré pode chegar alguns minutos antes ou depois, então vale sair de casa com uma folga. A página não serve para navegação.</p>

<h2>As praias na tábua</h2>

<p>Em São Miguel do Gostoso: <a href="/explore/mares/cardeiro">Cardeiro</a>, Xêpa, Maceió, Santo Cristo, Tourinhos, Minhoto, Praia do Amor, Zé Martins e Malhada.</p>

<p>Em Touros: <a href="/explore/mares/perobas">Perobas</a>, Carnaubinha, Farol do Calcanhar e Cajueiro.</p>

<p>Em Pedra Grande: Marco.</p>

<h2>Onde a maré faz mais diferença</h2>

<p><strong>Piscinas do Cardeiro.</strong> As piscinas aparecem na maré baixa. A página calcula a janela do dia, algo como "melhor entre 8h52 e 11h59", e já mostra isso no cartão.</p>

<p><strong>Parrachos de Perobas.</strong> Os parrachos, bancos de recife a alguns quilômetros da costa de Touros, só valem a visita na maré baixa, quando dá para caminhar e ver os peixes na água rasa. A <a href="https://gostosense.com.br/passeios/perobas-de-buggy" target="_blank" rel="noopener noreferrer">Gostosense Turismo</a> faz o passeio de buggy até Perobas e marca a saída de acordo com a maré, então vale conferir a tábua antes de fechar a data.</p>

<p><strong>Kite no Santo Cristo.</strong> A lâmina d'água muda o spot ao longo do dia. Quem está aprendendo costuma preferir a água mais rasa.</p>

<p><strong>Tourinhos.</strong> Na maré alta, a água estoura entre as dunas petrificadas.</p>

<h2>Onde ficar perto do mar</h2>

<p>Para quem está pensando em passar mais tempo no litoral norte, o <a href="https://www.cajuparadise.com.br/pt" target="_blank" rel="noopener noreferrer">Caju Paradise</a>, em Touros, fica dentro do <a href="https://www.cajuparadise.com.br/pt" target="_blank" rel="noopener noreferrer">Cajueiro Boulevard</a>, a poucos minutos das praias do Cajueiro e de Perobas. O <a href="/explore/mapa">mapa do Vive Gostoso</a> mostra essas praias, o Farol do Calcanhar e outros pontos da região, cada um com o link da maré.</p>

<h2>Antes de sair</h2>

<p>Abra a tábua no celular, escolha a praia e veja a janela do dia. Se o passeio depende da maré baixa, chegue um pouco antes dela. E se for com guia, pergunte o horário: quem conhece a costa marca a saída pela maré, não pelo relógio.</p>

<p><a href="/explore/mares">Ver a tábua de marés de hoje</a></p>
$POST_PT$,
  'https://www.vivegostoso.com.br/api/og/blog-mares?lang=pt',
  ARRAY['marés', 'tábua de marés', 'dicas', 'são miguel do gostoso']::text[]
),
(
  'tabla-de-mareas-sao-miguel-do-gostoso',
  'Tabla de mareas de São Miguel do Gostoso: la marea de hoy, playa por playa',
  'Hora y altura de la marea alta y baja en 14 playas de Gostoso, Touros y Pedra Grande, con el mejor horario para las piscinas del Cardeiro y los parrachos de Perobas.',
  $POST_ES$
<p>Quien pasa unos días en São Miguel do Gostoso aprende rápido que la marea manda en el itinerario. Llegar al Cardeiro con la marea alta es encontrarse con el mar encima de las piedras, sin ninguna piscina a la vista. Dos horas después, con la marea baja, la misma playa se convierte en un conjunto de piscinas poco profundas y tibias entre las rocas. El paseo es el mismo, y el horario lo cambia todo.</p>

<p>Pensando en eso, Vive Gostoso tiene ahora su propia <a href="/es/explore/mares">tabla de mareas</a>, organizada por playa.</p>

<h2>Cómo funciona</h2>

<p>Eliges la playa y el día. La página muestra:</p>

<ul>
<li>la hora y la altura de cada marea alta y baja;</li>
<li>una curva del día, con la marca de ahora;</li>
<li>la fase de la luna;</li>
<li>lo que la marea cambia en esa playa y el mejor horario para aprovecharla.</li>
</ul>

<p>La previsión cubre hoy y los próximos siete días, y cada playa tiene su propio enlace, fácil de mandar al grupo del viaje.</p>

<h2>De dónde vienen los datos</h2>

<p>Los horarios vienen de las Tablas de Marea oficiales de la <a href="https://www.marinha.mil.br/chm/tabuas-de-mare-6" target="_blank" rel="noopener noreferrer">Marina de Brasil</a>, publicadas por el Centro de Hidrografía. Gostoso no tiene estación propia, así que cada playa usa la estación más cercana. Para Gostoso y Pedra Grande, es el Puerto de Guamaré. Para Touros, es el Puerto de Natal. En la arena, la marea puede llegar unos minutos antes o después, así que conviene salir de casa con margen. La página no sirve para navegación.</p>

<h2>Las playas de la tabla</h2>

<p>En São Miguel do Gostoso: <a href="/es/explore/mares/cardeiro">Cardeiro</a>, Xêpa, Maceió, Santo Cristo, Tourinhos, Minhoto, Praia do Amor, Zé Martins y Malhada.</p>

<p>En Touros: <a href="/es/explore/mares/perobas">Perobas</a>, Carnaubinha, Farol do Calcanhar y Cajueiro.</p>

<p>En Pedra Grande: Marco.</p>

<h2>Dónde la marea cambia más las cosas</h2>

<p><strong>Piscinas del Cardeiro.</strong> Las piscinas aparecen con la marea baja. La página calcula la ventana del día, algo como "mejor entre 8:52 y 11:59", y ya la muestra en la tarjeta.</p>

<p><strong>Parrachos de Perobas.</strong> Los parrachos, bancos de arrecife a algunos kilómetros de la costa de Touros, solo valen la visita con la marea baja, cuando se puede caminar y ver los peces en el agua poco profunda. <a href="https://gostosense.com.br/passeios/perobas-de-buggy" target="_blank" rel="noopener noreferrer">Gostosense Turismo</a> hace el paseo en buggy hasta Perobas y fija la salida según la marea, así que conviene mirar la tabla antes de cerrar la fecha.</p>

<p><strong>Kite en Santo Cristo.</strong> La lámina de agua cambia el spot a lo largo del día. Quien está aprendiendo suele preferir el agua más baja.</p>

<p><strong>Tourinhos.</strong> Con la marea alta, el agua rompe entre las dunas petrificadas.</p>

<h2>Dónde quedarse cerca del mar</h2>

<p>Si estás pensando en pasar más tiempo en el litoral norte, <a href="https://www.cajuparadise.com.br/es" target="_blank" rel="noopener noreferrer">Caju Paradise</a>, en Touros, está dentro del <a href="https://www.cajuparadise.com.br/es" target="_blank" rel="noopener noreferrer">Cajueiro Boulevard</a>, a pocos minutos de las playas de Cajueiro y de Perobas. El <a href="/es/explore/mapa">mapa de Vive Gostoso</a> muestra esas playas, el Farol do Calcanhar y otros puntos de la región, cada uno con el enlace de su marea.</p>

<h2>Antes de salir</h2>

<p>Abre la tabla en el celular, elige la playa y mira la ventana del día. Si el paseo depende de la marea baja, llega un poco antes. Y si vas con guía, pregunta el horario: quien conoce la costa fija la salida por la marea, no por el reloj.</p>

<p><a href="/es/explore/mares">Ver la tabla de mareas de hoy</a></p>
$POST_ES$,
  'https://www.vivegostoso.com.br/api/og/blog-mares?lang=es',
  ARRAY['mareas', 'tabla de mareas', 'consejos', 'são miguel do gostoso']::text[]
),
(
  'tide-table-sao-miguel-do-gostoso',
  'São Miguel do Gostoso tide table: today''s tide, beach by beach',
  'Times and heights of high and low tide on 14 beaches in Gostoso, Touros and Pedra Grande, with the best time for the Cardeiro pools and the Perobas reefs.',
  $POST_EN$
<p>Spend a few days in São Miguel do Gostoso and you quickly learn that the tide sets the plan. Arrive at Cardeiro at high tide and the sea is right over the rocks, with no pools in sight. Two hours later, at low tide, the same beach turns into a set of shallow, warm pools between the rocks. Same trip, and the time of day changes everything.</p>

<p>That is why Vive Gostoso now has its own <a href="/en/explore/mares">tide table</a>, organized by beach.</p>

<h2>How it works</h2>

<p>You pick the beach and the day. The page shows:</p>

<ul>
<li>the time and height of each high and low tide;</li>
<li>a curve for the day, with a marker for right now;</li>
<li>the moon phase;</li>
<li>what the tide changes on that beach and the best time to enjoy it.</li>
</ul>

<p>The forecast covers today and the next seven days, and each beach has its own link, easy to send to your travel group.</p>

<h2>Where the data comes from</h2>

<p>The times come from the official Tide Tables of the <a href="https://www.marinha.mil.br/chm/tabuas-de-mare-6" target="_blank" rel="noopener noreferrer">Brazilian Navy</a>, published by its Hydrography Center. Gostoso has no station of its own, so each beach uses the nearest one. For Gostoso and Pedra Grande, that is the Port of Guamaré. For Touros, it is the Port of Natal. On the sand, the tide can arrive a few minutes earlier or later, so leave with some time to spare. The page is not meant for navigation.</p>

<h2>The beaches on the table</h2>

<p>In São Miguel do Gostoso: <a href="/en/explore/mares/cardeiro">Cardeiro</a>, Xêpa, Maceió, Santo Cristo, Tourinhos, Minhoto, Praia do Amor, Zé Martins and Malhada.</p>

<p>In Touros: <a href="/en/explore/mares/perobas">Perobas</a>, Carnaubinha, Farol do Calcanhar and Cajueiro.</p>

<p>In Pedra Grande: Marco.</p>

<h2>Where the tide matters most</h2>

<p><strong>Cardeiro pools.</strong> The pools show up at low tide. The page works out the window for the day, something like "best between 8:52 and 11:59", and shows it right on the card.</p>

<p><strong>Perobas reefs.</strong> The parrachos, reef banks a few kilometers off the Touros coast, are only worth the trip at low tide, when you can walk on them and see the fish in the shallow water. <a href="https://gostosense.com.br/passeios/perobas-de-buggy" target="_blank" rel="noopener noreferrer">Gostosense Turismo</a> runs the buggy trip to Perobas and sets the departure by the tide, so check the table before you book a date.</p>

<p><strong>Kiting at Santo Cristo.</strong> The water depth changes the spot through the day. Beginners usually prefer shallower water.</p>

<p><strong>Tourinhos.</strong> At high tide, the water breaks between the petrified dunes.</p>

<h2>Where to stay near the sea</h2>

<p>If you are thinking of spending more time on the north coast, <a href="https://www.cajuparadise.com.br/en" target="_blank" rel="noopener noreferrer">Caju Paradise</a>, in Touros, is inside <a href="https://www.cajuparadise.com.br/en" target="_blank" rel="noopener noreferrer">Cajueiro Boulevard</a>, a few minutes from the Cajueiro and Perobas beaches. The <a href="/en/explore/mapa">Vive Gostoso map</a> shows these beaches, Farol do Calcanhar and other spots in the region, each with a link to its tide.</p>

<h2>Before you go</h2>

<p>Open the table on your phone, pick the beach and check the day's window. If the trip depends on low tide, get there a little before it. And if you go with a guide, ask about the time: people who know this coast set the departure by the tide, not the clock.</p>

<p><a href="/en/explore/mares">See today's tide table</a></p>
$POST_EN$,
  'https://www.vivegostoso.com.br/api/og/blog-mares?lang=en',
  ARRAY['tides', 'tide table', 'tips', 'são miguel do gostoso']::text[]
)
) AS v(slug, title, excerpt, content, cover_url, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM public.gostoso_blog_posts p WHERE p.slug = v.slug
);

-- ===================== PARTE 2: publicar (só depois do deploy READY) =====================
-- Descomente e rode depois que a master com feat/blog-bio-vitrine estiver READY.

-- UPDATE public.gostoso_blog_posts
--    SET is_published = true
--  WHERE slug IN (
--          'tabua-de-mares-sao-miguel-do-gostoso',
--          'tabla-de-mareas-sao-miguel-do-gostoso',
--          'tide-table-sao-miguel-do-gostoso'
--        )
--    AND is_published = false;
