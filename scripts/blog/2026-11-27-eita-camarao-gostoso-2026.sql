-- Post do 6º Eita Camarão Gostoso (04 a 12/12/2026), em pt, en e es (27/11/2026).
-- Dados lidos em 27/11/2026 no perfil @eitacamaraogostoso, no post do Guia Descubra Gostoso e no reel da Abrasel RN.
-- Idempotente: reexecutar atualiza o texto e NÃO despublica nem muda a data de quem já está no ar.
-- Parte 1 grava os três posts como NÃO publicados (rode só depois do deploy READY, para o mapa src/data/blog-traducoes.json já estar no ar).
-- Parte 2 (comentada) publica os três e ativa o evento no calendário; roda depois do deploy.

insert into public.gostoso_blog_posts
  (slug, title, excerpt, content, cover_url, author, tags, is_published, published_at, faq_jsonld)
values
(
  'eita-camarao-gostoso-2026-programacao-arena-e-shows',
  '6º Eita Camarão Gostoso 2026: programação, Arena e shows',
  'O 6º Eita Camarão Gostoso é de 4 a 12/12/2026 em São Miguel do Gostoso: circuito nos restaurantes, Arena Sabores Potiguares, shows e quem realiza.',
  $vgpost$<p>O 6º Eita Camarão Gostoso acontece de 4 a 12 de dezembro de 2026, em São Miguel do Gostoso (RN). Nos nove dias, restaurantes da cidade servem pratos especiais com camarão no circuito do festival; nos dias 11 e 12, a Arena Sabores Potiguares abre na Avenida dos Arrecifes com comida, feira e música ao vivo. O tema desta edição é "Do Mar ao Ar".</p>
<p>Última conferência: 27/11/2026, no perfil oficial <a href="https://www.instagram.com/eitacamaraogostoso/" rel="noopener">@eitacamaraogostoso</a>, no post do <a href="https://www.instagram.com/descubragostoso/p/DgOFYUEHcKN/" rel="noopener">Guia Descubra Gostoso</a> e nas publicações da <a href="https://www.instagram.com/abraselnorn/" rel="noopener">Abrasel RN</a>. Horários, locais e preços podem mudar, então a palavra final é sempre da organização.</p>

<h2 id="resumo">O festival em uma tabela</h2>
<table class="comparison-table">
<thead><tr><th>Item</th><th>O que já está confirmado</th></tr></thead>
<tbody>
<tr><td>Datas</td><td>4 a 12 de dezembro de 2026</td></tr>
<tr><td>Onde</td><td>São Miguel do Gostoso (RN): restaurantes do circuito e Arena Sabores Potiguares</td></tr>
<tr><td>Arena Sabores Potiguares</td><td>Sexta 11 e sábado 12/12, das 16h às 23h, na Avenida dos Arrecifes, ao lado do Posto Ale</td></tr>
<tr><td>Música</td><td>DJ Galix, Diogo das Virgens, Segunda do Vagabundo, Sueldo Soares e Dani Cruz</td></tr>
<tr><td>Realização</td><td>Abrasel RN, AE Gostoso e VisitGostoso</td></tr>
<tr><td>Patrocínio</td><td>Bradesco, Camarão Potiporã e Prefeitura de São Miguel do Gostoso</td></tr>
</tbody>
</table>

<h2 id="circuito">O circuito nos restaurantes</h2>
<p>O Eita Camarão Gostoso é, desde a primeira edição, um circuito: cada restaurante participante cria um prato com camarão e o serve durante o festival. Em 2026, o circuito acontece junto com o Sabores Potiguares, projeto da Abrasel RN que estreia em Gostoso, e vai de 4 a 12 de dezembro. As inscrições dos restaurantes fecharam em 20/11, e a lista de participantes é divulgada pelo festival no perfil <strong>@eitacamaraogostoso</strong>. Vale conferir lá antes de reservar mesa.</p>
<p>Dois pratos já foram divulgados:</p>
<ul>
<li><strong>Taco Arretado, na Miguelita</strong> (Avenida dos Arrecifes): R$ 28 no restaurante. Nos dias 11 e 12, o festival informa que o prato também sai por R$ 25 no pavilhão.</li>
<li><strong>Tortellini de Camarão, no Mar y Brasa</strong>: massa artesanal recheada com creme de camarão, com molho de moqueca de camarão e tomate, por R$ 72.</li>
</ul>

<h2 id="arena">Arena Sabores Potiguares: 11 e 12 de dezembro</h2>
<p>A grande novidade de 2026 é a Arena. Segundo o Guia Descubra Gostoso, ela reúne pratos a R$ 29,90, feira de economia criativa e agricultura familiar, cozinha show, apresentações culturais e música nos dois dias, das 16h às 23h, na Avenida dos Arrecifes, ao lado do Posto Ale. A Abrasel RN também abriu a Arena para bares, restaurantes e lanchonetes que queiram expor.</p>

<h2 id="programacao-musical">Programação musical da Arena</h2>
<table class="comparison-table">
<thead><tr><th>Dia</th><th>Horário</th><th>Atração</th></tr></thead>
<tbody>
<tr><td>Sexta, 11/12</td><td>18h</td><td>DJ Galix</td></tr>
<tr><td>Sexta, 11/12</td><td>18h30</td><td>Diogo das Virgens</td></tr>
<tr><td>Sexta, 11/12</td><td>20h</td><td>DJ Galix</td></tr>
<tr><td>Sexta, 11/12</td><td>20h30</td><td>Segunda do Vagabundo</td></tr>
<tr><td>Sábado, 12/12</td><td>18h</td><td>DJ Galix</td></tr>
<tr><td>Sábado, 12/12</td><td>18h30</td><td>Sueldo Soares, no Baile do Batucauê</td></tr>
<tr><td>Sábado, 12/12</td><td>20h</td><td>DJ Galix</td></tr>
<tr><td>Sábado, 12/12</td><td>20h30</td><td>Dani Cruz</td></tr>
</tbody>
</table>
<p>A grade acima é a divulgada pelo festival em 20/11.</p>

<h2 id="quem-faz">Quem faz o festival</h2>
<p>A realização de 2026 é da Abrasel RN, da AE Gostoso (associação de empreendedores da cidade) e do VisitGostoso. O patrocínio vem do Bradesco, do Camarão Potiporã e da Prefeitura de São Miguel do Gostoso. Segundo o Guia Descubra Gostoso, o festival nasceu em 2021, idealizado por Emanuel Neri, Wagner Reis e Marisa Sonehara, da Camanor, em parceria com a AE Gostoso. A edição de 2025 foi de 1 a 30 de novembro; a de 2026 é mais curta, de 4 a 12 de dezembro.</p>

<h2 id="planejar">Como planejar a viagem</h2>
<p>Dezembro é alta temporada, então reserve cedo. O <a href="/blog/como-chegar-sao-miguel-do-gostoso">guia de como chegar</a> e a página de <a href="/transfer">transfer</a> ajudam com o caminho desde Natal. Para dormir, veja <a href="/fique">onde ficar</a> e as <a href="/blog/pousadas-sao-miguel-do-gostoso">pousadas de Gostoso</a>. Para comer fora do festival, o <a href="/come">guia de onde comer</a> tem a lista da cidade. E o <a href="/clube">Passaporte Gostoso</a> é grátis e traz vantagens em parceiros da cidade.</p>

<h2 id="perguntas">Perguntas frequentes</h2>
<h3>Quando é o Eita Camarão Gostoso 2026?</h3>
<p>De 4 a 12 de dezembro de 2026, em São Miguel do Gostoso (RN). A Arena Sabores Potiguares funciona nos dias 11 e 12.</p>
<h3>Onde fica a Arena Sabores Potiguares?</h3>
<p>Na Avenida dos Arrecifes, ao lado do Posto Ale, das 16h às 23h, segundo o Guia Descubra Gostoso.</p>
<h3>Quais restaurantes participam em 2026?</h3>
<p>A lista é divulgada pelo festival no perfil @eitacamaraogostoso. Miguelita (Taco Arretado) e Mar y Brasa (Tortellini de Camarão) já tiveram os pratos divulgados.</p>
<h3>Quem toca na Arena?</h3>
<p>Sexta, 11/12: DJ Galix, Diogo das Virgens e Segunda do Vagabundo. Sábado, 12/12: DJ Galix, Sueldo Soares (Baile do Batucauê) e Dani Cruz.</p>

<p>O Vive Gostoso não organiza o festival. As informações vêm do que a organização e as entidades parceiras publicaram; a divulgação oficial vale mais do que este resumo.</p>$vgpost$,
  '/images/blog/eita-camarao-gostoso-2026-programacao-arena-e-shows.png',
  'Vive Gostoso',
  array['eita camarão gostoso','festival gastronômico','camarão','eventos','dezembro','são miguel do gostoso'],
  false,
  null,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Quando é o Eita Camarão Gostoso 2026?","acceptedAnswer":{"@type":"Answer","text":"De 4 a 12 de dezembro de 2026, em São Miguel do Gostoso (RN). A Arena Sabores Potiguares funciona nos dias 11 e 12."}},{"@type":"Question","name":"Onde fica a Arena Sabores Potiguares?","acceptedAnswer":{"@type":"Answer","text":"Na Avenida dos Arrecifes, ao lado do Posto Ale, das 16h às 23h, segundo o Guia Descubra Gostoso."}},{"@type":"Question","name":"Quais restaurantes participam do Eita Camarão Gostoso em 2026?","acceptedAnswer":{"@type":"Answer","text":"A lista é divulgada pelo festival no perfil @eitacamaraogostoso. Miguelita (Taco Arretado) e Mar y Brasa (Tortellini de Camarão) já tiveram os pratos divulgados."}},{"@type":"Question","name":"Quem toca na Arena Sabores Potiguares?","acceptedAnswer":{"@type":"Answer","text":"Sexta, 11/12: DJ Galix, Diogo das Virgens e Segunda do Vagabundo. Sábado, 12/12: DJ Galix, Sueldo Soares (Baile do Batucauê) e Dani Cruz."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"pt-BR","name":"6º Eita Camarão Gostoso","startDate":"2026-12-04","endDate":"2026-12-12","image":"https://www.vivegostoso.com.br/images/blog/eita-camarao-gostoso-2026-programacao-arena-e-shows.png","location":{"@type":"Place","name":"São Miguel do Gostoso","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Festival gastronômico com circuito de pratos de camarão nos restaurantes de São Miguel do Gostoso e, nos dias 11 e 12, a Arena Sabores Potiguares com feira e música ao vivo.","url":"https://www.instagram.com/eitacamaraogostoso/","organizer":{"@type":"Organization","name":"Abrasel RN, AE Gostoso e VisitGostoso"}}]}$vgfaq$
),
(
  'eita-camarao-gostoso-2026-schedule-arena-and-concerts',
  '6th Eita Camarão Gostoso 2026: schedule, Arena and concerts',
  'The 6th Eita Camarão Gostoso runs Dec 4 to 12, 2026 in São Miguel do Gostoso: a shrimp dish circuit, the Sabores Potiguares Arena, concerts and organizers.',
  $vgpost$<p>The 6th Eita Camarão Gostoso takes place from December 4 to 12, 2026, in São Miguel do Gostoso (RN). For nine days, restaurants in town serve special shrimp dishes on the festival circuit; on December 11 and 12, the Sabores Potiguares Arena opens on Avenida dos Arrecifes with food, a market and live music. This year's theme is "Do Mar ao Ar" (From Sea to Air).</p>
<p>Last checked: 11/27/2026, on the official profile <a href="https://www.instagram.com/eitacamaraogostoso/" rel="noopener">@eitacamaraogostoso</a>, in the <a href="https://www.instagram.com/descubragostoso/p/DgOFYUEHcKN/" rel="noopener">Guia Descubra Gostoso</a> post and in <a href="https://www.instagram.com/abraselnorn/" rel="noopener">Abrasel RN</a> publications. Times, places and prices can change, so the organizers have the final word. The festival's own material is in Portuguese.</p>

<h2 id="resumo">The festival at a glance</h2>
<table class="comparison-table">
<thead><tr><th>Item</th><th>What is already confirmed</th></tr></thead>
<tbody>
<tr><td>Dates</td><td>December 4 to 12, 2026</td></tr>
<tr><td>Where</td><td>São Miguel do Gostoso (RN): circuit restaurants and the Sabores Potiguares Arena</td></tr>
<tr><td>Sabores Potiguares Arena</td><td>Friday, December 11 and Saturday, December 12, 4 pm to 11 pm, on Avenida dos Arrecifes, next to Posto Ale</td></tr>
<tr><td>Music</td><td>DJ Galix, Diogo das Virgens, Segunda do Vagabundo, Sueldo Soares and Dani Cruz</td></tr>
<tr><td>Organized by</td><td>Abrasel RN, AE Gostoso and VisitGostoso</td></tr>
<tr><td>Sponsors</td><td>Bradesco, Camarão Potiporã and the São Miguel do Gostoso city government</td></tr>
</tbody>
</table>

<h2 id="circuito">The restaurant circuit</h2>
<p>Since its first edition, Eita Camarão Gostoso has been a circuit: each participating restaurant creates a shrimp dish and serves it during the festival. In 2026 the circuit runs together with Sabores Potiguares, an Abrasel RN project making its debut in Gostoso, from December 4 to 12. Restaurant registration closed on 11/20, and the festival publishes the list of participants on its profile, <strong>@eitacamaraogostoso</strong>. Check it before booking a table.</p>
<p>Two dishes have already been announced:</p>
<ul>
<li><strong>Taco Arretado, at Miguelita</strong> (Avenida dos Arrecifes): R$ 28 at the restaurant. On December 11 and 12, the festival says the dish is also available for R$ 25 at its pavilion.</li>
<li><strong>Shrimp Tortellini, at Mar y Brasa</strong>: handmade pasta filled with shrimp cream, served with a shrimp moqueca and tomato sauce, for R$ 72.</li>
</ul>

<h2 id="arena">Sabores Potiguares Arena: December 11 and 12</h2>
<p>The big novelty of 2026 is the Arena. According to the Guia Descubra Gostoso, it brings dishes at R$ 29.90, a creative economy and family farming market, a cooking show, cultural performances and music on both days, from 4 pm to 11 pm, on Avenida dos Arrecifes, next to Posto Ale. Abrasel RN has also opened the Arena to bars, restaurants and snack bars that want to exhibit.</p>

<h2 id="programacao-musical">Arena music schedule</h2>
<table class="comparison-table">
<thead><tr><th>Day</th><th>Time</th><th>Act</th></tr></thead>
<tbody>
<tr><td>Friday, Dec 11</td><td>6 pm</td><td>DJ Galix</td></tr>
<tr><td>Friday, Dec 11</td><td>6:30 pm</td><td>Diogo das Virgens</td></tr>
<tr><td>Friday, Dec 11</td><td>8 pm</td><td>DJ Galix</td></tr>
<tr><td>Friday, Dec 11</td><td>8:30 pm</td><td>Segunda do Vagabundo</td></tr>
<tr><td>Saturday, Dec 12</td><td>6 pm</td><td>DJ Galix</td></tr>
<tr><td>Saturday, Dec 12</td><td>6:30 pm</td><td>Sueldo Soares, at the Baile do Batucauê</td></tr>
<tr><td>Saturday, Dec 12</td><td>8 pm</td><td>DJ Galix</td></tr>
<tr><td>Saturday, Dec 12</td><td>8:30 pm</td><td>Dani Cruz</td></tr>
</tbody>
</table>
<p>The lineup above is the one the festival published on 11/20.</p>

<h2 id="quem-faz">Who is behind the festival</h2>
<p>The 2026 edition is organized by Abrasel RN, AE Gostoso (the town's entrepreneurs association) and VisitGostoso. Sponsors are Bradesco, Camarão Potiporã and the city government. According to the Guia Descubra Gostoso, the festival began in 2021, created by Emanuel Neri, Wagner Reis and Marisa Sonehara, of Camanor, together with AE Gostoso. The 2025 edition ran from November 1 to 30; the 2026 edition is shorter, from December 4 to 12.</p>

<h2 id="planejar">Planning your trip</h2>
<p>December is high season, so book early. The <a href="/blog/how-to-get-to-sao-miguel-do-gostoso">guide on how to get here</a> and the <a href="/transfer">transfer</a> page help with the trip from Natal. To sleep, see <a href="/fique">where to stay</a> and the <a href="/blog/where-to-stay-sao-miguel-do-gostoso">guide to lodging in Gostoso</a>. For meals outside the festival, the <a href="/come">where-to-eat guide</a> lists the town's restaurants. And the <a href="/clube">Passaporte Gostoso</a> is free and brings perks at partner businesses.</p>

<h2 id="perguntas">Frequently asked questions</h2>
<h3>When is Eita Camarão Gostoso 2026?</h3>
<p>December 4 to 12, 2026, in São Miguel do Gostoso (RN). The Sabores Potiguares Arena runs on December 11 and 12.</p>
<h3>Where is the Sabores Potiguares Arena?</h3>
<p>On Avenida dos Arrecifes, next to Posto Ale, from 4 pm to 11 pm, according to the Guia Descubra Gostoso.</p>
<h3>Which restaurants take part in 2026?</h3>
<p>The festival publishes the list on its profile, @eitacamaraogostoso. Miguelita (Taco Arretado) and Mar y Brasa (Shrimp Tortellini) have already had their dishes announced.</p>
<h3>Who plays at the Arena?</h3>
<p>Friday, Dec 11: DJ Galix, Diogo das Virgens and Segunda do Vagabundo. Saturday, Dec 12: DJ Galix, Sueldo Soares (Baile do Batucauê) and Dani Cruz.</p>

<p>Vive Gostoso does not organize the festival. The information comes from what the organizers and partner entities published; their official announcements take precedence over this summary.</p>$vgpost$,
  '/images/blog/eita-camarao-gostoso-2026-schedule-arena-and-concerts.png',
  'Vive Gostoso',
  array['eita camarão gostoso','food festival','shrimp','events','december','são miguel do gostoso'],
  false,
  null,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"When is Eita Camarão Gostoso 2026?","acceptedAnswer":{"@type":"Answer","text":"December 4 to 12, 2026, in São Miguel do Gostoso (RN). The Sabores Potiguares Arena runs on December 11 and 12."}},{"@type":"Question","name":"Where is the Sabores Potiguares Arena?","acceptedAnswer":{"@type":"Answer","text":"On Avenida dos Arrecifes, next to Posto Ale, from 4 pm to 11 pm, according to the Guia Descubra Gostoso."}},{"@type":"Question","name":"Which restaurants take part in Eita Camarão Gostoso 2026?","acceptedAnswer":{"@type":"Answer","text":"The festival publishes the list on its profile, @eitacamaraogostoso. Miguelita (Taco Arretado) and Mar y Brasa (Shrimp Tortellini) have already had their dishes announced."}},{"@type":"Question","name":"Who plays at the Sabores Potiguares Arena?","acceptedAnswer":{"@type":"Answer","text":"Friday, Dec 11: DJ Galix, Diogo das Virgens and Segunda do Vagabundo. Saturday, Dec 12: DJ Galix, Sueldo Soares (Baile do Batucauê) and Dani Cruz."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"en","name":"6th Eita Camarão Gostoso","startDate":"2026-12-04","endDate":"2026-12-12","image":"https://www.vivegostoso.com.br/images/blog/eita-camarao-gostoso-2026-schedule-arena-and-concerts.png","location":{"@type":"Place","name":"São Miguel do Gostoso","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Food festival with a circuit of shrimp dishes in São Miguel do Gostoso restaurants and, on December 11 and 12, the Sabores Potiguares Arena with a market and live music.","url":"https://www.instagram.com/eitacamaraogostoso/","organizer":{"@type":"Organization","name":"Abrasel RN, AE Gostoso and VisitGostoso"}}]}$vgfaq$
),
(
  'eita-camarao-gostoso-2026-programa-arena-y-conciertos',
  '6.º Eita Camarão Gostoso 2026: programa, Arena y conciertos',
  'El 6.º Eita Camarão Gostoso es del 4 al 12/12/2026 en São Miguel do Gostoso: circuito en restaurantes, Arena Sabores Potiguares, conciertos y organizadores.',
  $vgpost$<p>El 6.º Eita Camarão Gostoso se celebra del 4 al 12 de diciembre de 2026, en São Miguel do Gostoso (RN). Durante nueve días, los restaurantes de la ciudad sirven platos especiales con camarón en el circuito del festival; el 11 y el 12 de diciembre abre la Arena Sabores Potiguares en la Avenida dos Arrecifes, con comida, feria y música en vivo. El tema de esta edición es "Do Mar ao Ar" (Del mar al aire).</p>
<p>Última comprobación: 27/11/2026, en el perfil oficial <a href="https://www.instagram.com/eitacamaraogostoso/" rel="noopener">@eitacamaraogostoso</a>, en la publicación de la <a href="https://www.instagram.com/descubragostoso/p/DgOFYUEHcKN/" rel="noopener">Guia Descubra Gostoso</a> y en las publicaciones de <a href="https://www.instagram.com/abraselnorn/" rel="noopener">Abrasel RN</a>. Horarios, lugares y precios pueden cambiar, así que la última palabra es siempre de la organización. El material del festival está en portugués.</p>

<h2 id="resumo">El festival en una tabla</h2>
<table class="comparison-table">
<thead><tr><th>Dato</th><th>Lo que ya está confirmado</th></tr></thead>
<tbody>
<tr><td>Fechas</td><td>Del 4 al 12 de diciembre de 2026</td></tr>
<tr><td>Dónde</td><td>São Miguel do Gostoso (RN): restaurantes del circuito y Arena Sabores Potiguares</td></tr>
<tr><td>Arena Sabores Potiguares</td><td>Viernes 11 y sábado 12/12, de 16:00 a 23:00, en la Avenida dos Arrecifes, junto al Posto Ale</td></tr>
<tr><td>Música</td><td>DJ Galix, Diogo das Virgens, Segunda do Vagabundo, Sueldo Soares y Dani Cruz</td></tr>
<tr><td>Organización</td><td>Abrasel RN, AE Gostoso y VisitGostoso</td></tr>
<tr><td>Patrocinio</td><td>Bradesco, Camarão Potiporã y la Alcaldía de São Miguel do Gostoso</td></tr>
</tbody>
</table>

<h2 id="circuito">El circuito en los restaurantes</h2>
<p>Desde su primera edición, el Eita Camarão Gostoso es un circuito: cada restaurante participante crea un plato con camarón y lo sirve durante el festival. En 2026 el circuito va junto con Sabores Potiguares, un proyecto de Abrasel RN que debuta en Gostoso, del 4 al 12 de diciembre. Las inscripciones de los restaurantes cerraron el 20/11, y el festival publica la lista de participantes en su perfil, <strong>@eitacamaraogostoso</strong>. Conviene consultarla antes de reservar mesa.</p>
<p>Ya se anunciaron dos platos:</p>
<ul>
<li><strong>Taco Arretado, en Miguelita</strong> (Avenida dos Arrecifes): R$ 28 en el restaurante. El 11 y el 12 de diciembre, el festival informa que el plato también cuesta R$ 25 en su pabellón.</li>
<li><strong>Tortellini de Camarón, en Mar y Brasa</strong>: pasta artesanal rellena de crema de camarón, con salsa de moqueca de camarón y tomate, por R$ 72.</li>
</ul>

<h2 id="arena">Arena Sabores Potiguares: 11 y 12 de diciembre</h2>
<p>La gran novedad de 2026 es la Arena. Según la Guia Descubra Gostoso, reúne platos a R$ 29,90, feria de economía creativa y agricultura familiar, cocina show, presentaciones culturales y música los dos días, de 16:00 a 23:00, en la Avenida dos Arrecifes, junto al Posto Ale. Abrasel RN también abrió la Arena a bares, restaurantes y cafeterías que quieran exponer.</p>

<h2 id="programacao-musical">Programa musical de la Arena</h2>
<table class="comparison-table">
<thead><tr><th>Día</th><th>Hora</th><th>Artista</th></tr></thead>
<tbody>
<tr><td>Viernes, 11/12</td><td>18:00</td><td>DJ Galix</td></tr>
<tr><td>Viernes, 11/12</td><td>18:30</td><td>Diogo das Virgens</td></tr>
<tr><td>Viernes, 11/12</td><td>20:00</td><td>DJ Galix</td></tr>
<tr><td>Viernes, 11/12</td><td>20:30</td><td>Segunda do Vagabundo</td></tr>
<tr><td>Sábado, 12/12</td><td>18:00</td><td>DJ Galix</td></tr>
<tr><td>Sábado, 12/12</td><td>18:30</td><td>Sueldo Soares, en el Baile do Batucauê</td></tr>
<tr><td>Sábado, 12/12</td><td>20:00</td><td>DJ Galix</td></tr>
<tr><td>Sábado, 12/12</td><td>20:30</td><td>Dani Cruz</td></tr>
</tbody>
</table>
<p>La programación de arriba es la que el festival publicó el 20/11.</p>

<h2 id="quem-faz">Quién hace el festival</h2>
<p>La organización de 2026 es de Abrasel RN, AE Gostoso (la asociación de emprendedores de la ciudad) y VisitGostoso. El patrocinio viene de Bradesco, Camarão Potiporã y la Alcaldía. Según la Guia Descubra Gostoso, el festival nació en 2021, ideado por Emanuel Neri, Wagner Reis y Marisa Sonehara, de Camanor, junto con AE Gostoso. La edición de 2025 fue del 1 al 30 de noviembre; la de 2026 es más corta, del 4 al 12 de diciembre.</p>

<h2 id="planejar">Cómo planear el viaje</h2>
<p>Diciembre es temporada alta, así que conviene reservar con tiempo. La <a href="/blog/como-llegar-a-sao-miguel-do-gostoso">guía para llegar</a> y la página de <a href="/transfer">transfer</a> ayudan con el trayecto desde Natal. Para dormir, mira <a href="/fique">dónde alojarte</a> y la <a href="/blog/donde-alojarse-sao-miguel-do-gostoso">guía de alojamiento en Gostoso</a>. Para comer fuera del festival, la <a href="/come">guía de dónde comer</a> tiene la lista de la ciudad. Y el <a href="/clube">Passaporte Gostoso</a> es gratis y da ventajas en negocios asociados.</p>

<h2 id="perguntas">Preguntas frecuentes</h2>
<h3>¿Cuándo es el Eita Camarão Gostoso 2026?</h3>
<p>Del 4 al 12 de diciembre de 2026, en São Miguel do Gostoso (RN). La Arena Sabores Potiguares funciona el 11 y el 12.</p>
<h3>¿Dónde está la Arena Sabores Potiguares?</h3>
<p>En la Avenida dos Arrecifes, junto al Posto Ale, de 16:00 a 23:00, según la Guia Descubra Gostoso.</p>
<h3>¿Qué restaurantes participan en 2026?</h3>
<p>El festival publica la lista en su perfil, @eitacamaraogostoso. Miguelita (Taco Arretado) y Mar y Brasa (Tortellini de Camarón) ya tienen su plato anunciado.</p>
<h3>¿Quién toca en la Arena?</h3>
<p>Viernes, 11/12: DJ Galix, Diogo das Virgens y Segunda do Vagabundo. Sábado, 12/12: DJ Galix, Sueldo Soares (Baile do Batucauê) y Dani Cruz.</p>

<p>Vive Gostoso no organiza el festival. La información viene de lo que publicaron la organización y las entidades asociadas; su comunicación oficial vale más que este resumen.</p>$vgpost$,
  '/images/blog/eita-camarao-gostoso-2026-programa-arena-y-conciertos.png',
  'Vive Gostoso',
  array['eita camarão gostoso','festival gastronómico','camarón','eventos','diciembre','são miguel do gostoso'],
  false,
  null,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"¿Cuándo es el Eita Camarão Gostoso 2026?","acceptedAnswer":{"@type":"Answer","text":"Del 4 al 12 de diciembre de 2026, en São Miguel do Gostoso (RN). La Arena Sabores Potiguares funciona el 11 y el 12."}},{"@type":"Question","name":"¿Dónde está la Arena Sabores Potiguares?","acceptedAnswer":{"@type":"Answer","text":"En la Avenida dos Arrecifes, junto al Posto Ale, de 16:00 a 23:00, según la Guia Descubra Gostoso."}},{"@type":"Question","name":"¿Qué restaurantes participan en el Eita Camarão Gostoso 2026?","acceptedAnswer":{"@type":"Answer","text":"El festival publica la lista en su perfil, @eitacamaraogostoso. Miguelita (Taco Arretado) y Mar y Brasa (Tortellini de Camarón) ya tienen su plato anunciado."}},{"@type":"Question","name":"¿Quién toca en la Arena Sabores Potiguares?","acceptedAnswer":{"@type":"Answer","text":"Viernes, 11/12: DJ Galix, Diogo das Virgens y Segunda do Vagabundo. Sábado, 12/12: DJ Galix, Sueldo Soares (Baile do Batucauê) y Dani Cruz."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"es","name":"6.º Eita Camarão Gostoso","startDate":"2026-12-04","endDate":"2026-12-12","image":"https://www.vivegostoso.com.br/images/blog/eita-camarao-gostoso-2026-programa-arena-y-conciertos.png","location":{"@type":"Place","name":"São Miguel do Gostoso","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Festival gastronómico con un circuito de platos de camarón en los restaurantes de São Miguel do Gostoso y, el 11 y el 12 de diciembre, la Arena Sabores Potiguares con feria y música en vivo.","url":"https://www.instagram.com/eitacamaraogostoso/","organizer":{"@type":"Organization","name":"Abrasel RN, AE Gostoso y VisitGostoso"}}]}$vgfaq$
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_url = excluded.cover_url,
  tags = excluded.tags,
  faq_jsonld = excluded.faq_jsonld;

-- PARTE 2 (rodar depois do deploy READY e da conferência do mapa de idiomas):
-- update public.gostoso_blog_posts
--   set is_published = true, published_at = now()
--   where slug in ('eita-camarao-gostoso-2026-programacao-arena-e-shows','eita-camarao-gostoso-2026-schedule-arena-and-concerts','eita-camarao-gostoso-2026-programa-arena-y-conciertos')
--     and is_published = false;
--
-- Evento no calendário do site e do app (a linha antiga "Festival Eita Camarão", inativa, tinha data de 1 a 3/11 e descrição genérica):
-- update public.gostoso_events set
--   name = '6º Eita Camarão Gostoso',
--   description = 'Festival gastronômico de São Miguel do Gostoso: circuito de pratos com camarão nos restaurantes de 4 a 12 de dezembro e, nos dias 11 e 12, a Arena Sabores Potiguares, na Avenida dos Arrecifes, com feira, cozinha show e música ao vivo. Tema: Do Mar ao Ar.',
--   starts_at = '2026-12-04 12:00:00+00', ends_at = '2026-12-13 02:00:00+00',
--   location = 'Restaurantes do circuito e Arena Sabores Potiguares (Av. dos Arrecifes), São Miguel do Gostoso',
--   cover_url = '/images/blog/eita-camarao-gostoso-2026-programacao-arena-e-shows.png',
--   source_url = 'https://www.vivegostoso.com.br/blog/eita-camarao-gostoso-2026-programacao-arena-e-shows',
--   event_type = 'gastronomia', is_featured = true, active = true
--   where id = '9d3e1239-f02b-403c-ad16-20ba72c22cac';
