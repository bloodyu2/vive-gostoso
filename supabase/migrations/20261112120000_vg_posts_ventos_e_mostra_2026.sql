-- Dois posts novos do blog, em pt, en e es (12/11/2026):
--  1) Copa dos Ventos (14/11) e Sertões Kitesurf (25 a 28/11);
--  2) 13ª Mostra de Cinema de Gostoso: filmes e programação (20 a 24/11).
-- Dados lidos nas fontes oficiais em 12/11/2026 (fontes no corpo de cada post).
-- Idempotente: pode ser reexecutada sem duplicar nem despublicar. Os seis slugs entram em src/data/blog-traducoes.json.
--
-- Publicação agendada (pg_cron, horário de Brasília = UTC-3). Horas de pico do site no GA4 (28 dias, 270 sessões): 21h, 17h e 9h.
--   Ventos: sexta 13/11 às 09h (antes da Copa dos Ventos de sábado; a série de stories "Maré e vento" sai às 08h e o Reel de 12h fica de fora).
--   Mostra: segunda 16/11 às 17h (sem Reel nem post no feed do @vivegostoso nesse horário; a abertura é 20/11).
-- Cada tarefa se remove sozinha depois de rodar. Para publicar antes: select public.vg_publicar_posts_agendados(array['<slug>', ...]);

insert into public.gostoso_blog_posts
  (slug, title, excerpt, content, cover_url, author, tags, is_published, published_at, faq_jsonld)
values
(
  'copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso',
  'Copa dos Ventos e Sertões Kitesurf em Gostoso: novembro de 2026',
  'Copa dos Ventos em 14/11, no Dr. Wind, e Sertões Kitesurf de 25 a 28/11, com a 2ª etapa saindo de Gostoso: programação, locais e fontes oficiais.',
  $vgpost$<p>Dois eventos de esportes de vento marcam novembro de 2026 em São Miguel do Gostoso: a Copa dos Ventos, no sábado, 14 de novembro, e o Sertões Kitesurf, de 25 a 28 de novembro. A Copa reúne regatas de kitesurf e wingfoil, todas com largada no Dr. Wind, na Praia do Santo Cristo. O Sertões é uma travessia de kitesurf entre Touros (RN) e Fortim (CE), e a segunda etapa sai de Gostoso, do Kauli Seadi Beach Hotel, rumo a Galinhos.</p>
<p>Última conferência: 12/11/2026, nas publicações oficiais da Federação Náutica do RN e no site do Sertões. Horários e locais podem mudar com o vento, então a palavra final é sempre da organização.</p>

<h2 id="resumo">Os dois eventos lado a lado</h2>
<table class="comparison-table">
<thead><tr><th>Evento</th><th>Quando</th><th>Onde</th><th>O que é</th></tr></thead>
<tbody>
<tr><td>Copa dos Ventos</td><td>Sábado, 14/11/2026, das 8h30 às 17h</td><td>Dr. Wind, Praia do Santo Cristo, São Miguel do Gostoso</td><td>Campeonato Potiguar de Kitesurf TT Race e Circuito Potiguar de Wingfoil Race, com disputa por equipes</td></tr>
<tr><td>Sertões Kitesurf</td><td>25 a 28/11/2026</td><td>De Touros (RN) a Fortim (CE); a 2ª etapa parte de Gostoso</td><td>Travessia de kitesurf em etapas, que a organização chama de maior corrida de downwind do planeta</td></tr>
</tbody>
</table>

<h2 id="copa-dos-ventos">Copa dos Ventos 2026: kitesurf e wingfoil no Santo Cristo</h2>
<p>A Copa dos Ventos é realizada pela RN dos Ventos e pela Federação Náutica do RN, com apoio da Prefeitura de São Miguel do Gostoso e da ABK. No sábado, 14 de novembro, a Praia do Santo Cristo recebe o Campeonato Potiguar de Kitesurf TT Race e o Circuito Potiguar de Wingfoil Race. Todas as regatas largam do <a href="/negocio/dr-wind">Dr. Wind</a>, na Ponta do Santo Cristo.</p>
<p>A programação oficial, divulgada pela federação em 11 de novembro:</p>
<ul>
<li><strong>8h30 às 11h30:</strong> credenciamento e entrega do kit atleta.</li>
<li><strong>9h30:</strong> baterias de freestyle.</li>
<li><strong>12h30:</strong> briefing com os velejadores.</li>
<li><strong>13h15:</strong> regatas de percurso (Race 1 e Race 2).</li>
<li><strong>14h30:</strong> DW Race (Race 3, o Desafio Sertões), na Ponta do Santo Cristo/Nauan.</li>
<li><strong>14h40:</strong> regatas de estreantes e iniciantes.</li>
<li><strong>17h:</strong> premiação e sunset no Bar da Praia.</li>
</ul>
<p>Neste ano há uma novidade: a disputa por equipes. Inspirada no campeonato de construtores da Fórmula 1, ela permite que escolas, clubes e equipes esportivas somem pontos dos seus atletas. Contam os três melhores resultados de cada equipe em cada modalidade (kitesurf TT Race, wingfoil race e wingfoil freestyle), e o primeiro lugar vale 25 pontos, o segundo 18 e o terceiro 15, com pontuação até o 10º colocado. A equipe campeã leva um troféu especial. Quem está começando tem disputas e premiação próprias.</p>
<p>As inscrições de atletas e equipes foram abertas pelo link do perfil <a href="https://www.instagram.com/federacaonautica.rn/" rel="noopener">@federacaonautica.rn</a>. Se você lê este texto depois de 14/11, a programação acima é a que a organização divulgou antes da data; os resultados saem nos perfis da federação e do Dr. Wind.</p>

<h2 id="sertoes-kitesurf">Sertões Kitesurf 2026: a corrida de downwind passa por Gostoso</h2>
<p>O Sertões Kitesurf acontece de 25 a 28 de novembro de 2026 e liga Touros (RN) a Fortim (CE). Segundo o site oficial, o evento existe desde 2021, foi a primeira travessia de longa distância do kitesurf e somou mais de 2.000 km percorridos em cinco edições. Esta é a sexta. As inscrições dos velejadores estão abertas pelo site do Sertões.</p>
<p>Gostoso tem lugar de honra no roteiro. Foi do Kauli Seadi Beach Hotel que saiu, em 2021, a primeira edição, e é de lá que parte a segunda etapa de 2026, rumo a Galinhos. As paradas, que a organização chama de Vilas Sertões Kitesurf, são estas:</p>
<ul>
<li><strong>Touros (RN):</strong> Hotel Vila Galé, com retirada de kits, briefing e a largada do dia 25.</li>
<li><strong>São Miguel do Gostoso (RN):</strong> <a href="/negocio/kauli-seadi-beach-hotel">Kauli Seadi Beach Hotel</a>, ponto de partida da segunda etapa.</li>
<li><strong>Galinhos (RN):</strong> Praça dos Pescadores.</li>
<li><strong>Grossos (RN):</strong> Igrejinha dos Barcos, penúltima parada.</li>
<li><strong>Fortim (CE):</strong> Jaguaribe Kite Lodge, onde a prova termina e os vencedores são consagrados.</li>
</ul>
<p>O horário de largada da etapa de Gostoso não estava divulgado em 12/11. Quem quer acompanhar de perto deve conferir o perfil e o site do Sertões nos dias anteriores. Para quem não compete, a organização também vende a Expedição Kitesurf, que acompanha a corrida a bordo de um UTV pela Rota das Falésias; datas e vagas estão no site.</p>

<h2 id="viagem">Como encaixar os dois eventos na viagem</h2>
<p>As duas datas caem na temporada de vento da região, e a cidade costuma encher quando há evento, então reserve cedo. Veja as opções em <a href="/fique">onde ficar em Gostoso</a> e o <a href="/blog/pousadas-sao-miguel-do-gostoso">guia de pousadas</a>. Para chegar, o <a href="/transfer">transfer</a> e o guia <a href="/blog/como-chegar-sao-miguel-do-gostoso">como chegar a São Miguel do Gostoso</a> cobrem o caminho desde o aeroporto de Natal.</p>
<p>Quem vai aproveitar a semana para aprender, comece pelo <a href="/blog/guia-iniciante-kitesurf-sao-miguel-do-gostoso">guia para quem nunca fez kitesurf</a> e pelo panorama do <a href="/blog/kitesurf-sao-miguel-do-gostoso">kitesurf em Gostoso</a>. Nos dias sem prova, o <a href="/passeie">passeios e esportes</a> e o <a href="/explore">mapa</a> ajudam a montar o roteiro, e a página de <a href="/come">onde comer</a> resolve o jantar depois da regata.</p>

<div class="callout callout--info">
<p><strong>Quer ver de perto:</strong> a Copa tem tudo na mesma praia, com largada no Dr. Wind e premiação às 17h no Bar da Praia.</p>
<p><strong>Quer pegar a corrida:</strong> acompanhe a etapa que sai do Kauli Seadi Beach Hotel e confirme o horário com a organização.</p>
</div>

<h2 id="perguntas-frequentes">Perguntas frequentes</h2>
<h3>Quando é a Copa dos Ventos 2026 em São Miguel do Gostoso?</h3>
<p>No sábado, 14 de novembro de 2026, com credenciamento a partir das 8h30 e premiação às 17h, no Dr. Wind, Praia do Santo Cristo.</p>
<h3>Quais modalidades têm na Copa dos Ventos?</h3>
<p>Kitesurf TT Race, wingfoil race e wingfoil freestyle, mais regatas para estreantes e iniciantes. Neste ano também há disputa por equipes.</p>
<h3>Quando é o Sertões Kitesurf 2026?</h3>
<p>De 25 a 28 de novembro de 2026, entre Touros (RN) e Fortim (CE).</p>
<h3>O Sertões Kitesurf passa por São Miguel do Gostoso?</h3>
<p>Sim. O Kauli Seadi Beach Hotel, em Gostoso, é o ponto de partida da segunda etapa, rumo a Galinhos.</p>
<h3>Preciso pagar para assistir?</h3>
<p>A organização não divulgou ingresso para o público até 12/11. Confirme com ela antes de ir.</p>

<h2 id="fontes">Fontes e referências</h2>
<ul>
<li>Copa dos Ventos: <a href="https://www.instagram.com/p/Dfk_5BrBXBb/" rel="noopener">programação oficial</a> e <a href="https://www.instagram.com/p/DfiYNEpRLvW/" rel="noopener">regras da disputa por equipes</a>, publicadas pela Federação Náutica do RN (<a href="https://www.instagram.com/federacaonautica.rn/" rel="noopener">@federacaonautica.rn</a>).</li>
<li>Sertões Kitesurf: <a href="https://sertoes.com.br/kite/" rel="noopener">site oficial</a> e a notícia <a href="https://sertoes.com.br/blog/noticias/conheca-os-locais-que-receberao-as-vilas-sertoes-kitesurf/" rel="noopener">Conheça os locais que receberão as Vilas Sertões Kitesurf</a>, de 7 de outubro de 2026.</li>
</ul>
<p>O Vive Gostoso não organiza nenhum dos dois eventos. Sabe de outro evento de esporte de vento em Gostoso? Fale com a gente pelo <a href="https://wa.me/558488182779?text=Ol%C3%A1%21%20Quero%20indicar%20um%20evento%20em%20Gostoso." rel="noopener">WhatsApp do Vive Gostoso</a> e mande o link oficial.</p>$vgpost$,
  '/images/blog/copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso.png',
  'Vive Gostoso',
  ARRAY['kitesurf','wingfoil','eventos','novembro','são miguel do gostoso'],
  false,
  '2026-11-13 09:00:00-03'::timestamptz,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Quando é a Copa dos Ventos 2026 em São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"No sábado, 14 de novembro de 2026, com credenciamento a partir das 8h30 e premiação às 17h, no Dr. Wind, Praia do Santo Cristo."}},{"@type":"Question","name":"Quais modalidades têm na Copa dos Ventos?","acceptedAnswer":{"@type":"Answer","text":"Kitesurf TT Race, wingfoil race e wingfoil freestyle, mais regatas para estreantes e iniciantes. Neste ano também há disputa por equipes."}},{"@type":"Question","name":"Quando é o Sertões Kitesurf 2026?","acceptedAnswer":{"@type":"Answer","text":"De 25 a 28 de novembro de 2026, entre Touros (RN) e Fortim (CE)."}},{"@type":"Question","name":"O Sertões Kitesurf passa por São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Sim. O Kauli Seadi Beach Hotel, em Gostoso, é o ponto de partida da segunda etapa, rumo a Galinhos."}},{"@type":"Question","name":"Preciso pagar para assistir?","acceptedAnswer":{"@type":"Answer","text":"A organização não divulgou ingresso para o público até 12/11. Confirme com ela antes de ir."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"pt-BR","image":"https://www.vivegostoso.com.br/images/blog/copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso.png","name":"Copa dos Ventos 2026","startDate":"2026-11-14T08:30:00-03:00","location":{"@type":"Place","name":"Dr. Wind, Praia do Santo Cristo","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR","streetAddress":"R. Ponta do Santo Cristo, 1"}},"description":"Campeonato Potiguar de Kitesurf TT Race e Circuito Potiguar de Wingfoil Race, com largada de todas as regatas no Dr. Wind e disputa por equipes.","url":"https://www.instagram.com/p/Dfk_5BrBXBb/","organizer":{"@type":"Organization","name":"Federação Náutica do RN","url":"https://www.instagram.com/federacaonautica.rn/"},"endDate":"2026-11-14T17:00:00-03:00"},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"pt-BR","image":"https://www.vivegostoso.com.br/images/blog/copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso.png","name":"Sertões Kitesurf 2026","startDate":"2026-11-25","location":{"@type":"Place","name":"Touros (RN) a Fortim (CE), com a segunda etapa saindo de São Miguel do Gostoso","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Travessia de kitesurf em etapas entre Touros (RN) e Fortim (CE); a segunda etapa parte do Kauli Seadi Beach Hotel, em Gostoso, rumo a Galinhos.","url":"https://sertoes.com.br/kite/","organizer":{"@type":"Organization","name":"Sertões","url":"https://sertoes.com.br/kite/"},"endDate":"2026-11-28"}]}$vgfaq$
),
(
  'copa-dos-ventos-and-sertoes-kitesurf-november-2026-gostoso',
  'Copa dos Ventos and Sertões Kitesurf in Gostoso: November 2026',
  'Copa dos Ventos on Nov 14 at Dr. Wind and Sertões Kitesurf Nov 25 to 28, with stage 2 leaving from Gostoso: schedule, venues and official sources.',
  $vgpost$<p>Two wind sports events mark November 2026 in São Miguel do Gostoso: the Copa dos Ventos on Saturday, November 14, and the Sertões Kitesurf from November 25 to 28. The Copa brings kitesurf and wingfoil races, all starting at Dr. Wind on Santo Cristo Beach. The Sertões is a kitesurf crossing between Touros (RN) and Fortim (CE), and its second stage leaves from Gostoso, from the Kauli Seadi Beach Hotel, heading to Galinhos.</p>
<p>Last checked: 11/12/2026, on the official posts of the Rio Grande do Norte Nautical Federation and on the Sertões website. Times and venues can change with the wind, so the organizers always have the final word.</p>

<h2 id="resumo">The two events side by side</h2>
<table class="comparison-table">
<thead><tr><th>Event</th><th>When</th><th>Where</th><th>What it is</th></tr></thead>
<tbody>
<tr><td>Copa dos Ventos</td><td>Saturday, 11/14/2026, 8:30 am to 5 pm</td><td>Dr. Wind, Santo Cristo Beach, São Miguel do Gostoso</td><td>Potiguar Kitesurf TT Race Championship and Potiguar Wingfoil Race Circuit, with a team competition</td></tr>
<tr><td>Sertões Kitesurf</td><td>11/25 to 11/28/2026</td><td>From Touros (RN) to Fortim (CE); stage 2 leaves from Gostoso</td><td>A staged kitesurf crossing that the organizers call the biggest downwind race on the planet</td></tr>
</tbody>
</table>

<h2 id="copa-dos-ventos">Copa dos Ventos 2026: kitesurf and wingfoil at Santo Cristo</h2>
<p>The Copa dos Ventos is run by RN dos Ventos and the Rio Grande do Norte Nautical Federation, with support from the São Miguel do Gostoso city hall and the ABK. On Saturday, November 14, Santo Cristo Beach hosts the Potiguar Kitesurf TT Race Championship and the Potiguar Wingfoil Race Circuit. Every race starts from <a href="/negocio/dr-wind">Dr. Wind</a>, at Ponta do Santo Cristo.</p>
<p>The official schedule, published by the federation on November 11:</p>
<ul>
<li><strong>8:30 to 11:30 am:</strong> check-in and athlete kit pickup.</li>
<li><strong>9:30 am:</strong> freestyle heats.</li>
<li><strong>12:30 pm:</strong> riders' briefing.</li>
<li><strong>1:15 pm:</strong> course races (Race 1 and Race 2).</li>
<li><strong>2:30 pm:</strong> DW Race (Race 3, the Sertões Challenge), at Ponta do Santo Cristo/Nauan.</li>
<li><strong>2:40 pm:</strong> races for rookies and beginners.</li>
<li><strong>5 pm:</strong> awards and sunset at Bar da Praia.</li>
</ul>
<p>This year brings something new: a team competition. Inspired by the Formula 1 constructors' championship, it lets schools, clubs and sports teams add up their athletes' points. The three best results of each team in each discipline count (kitesurf TT Race, wingfoil race and wingfoil freestyle), with 25 points for first place, 18 for second and 15 for third, scoring down to tenth. The winning team takes home a special trophy. Beginners have their own heats and prizes.</p>
<p>Athlete and team registration opened through the link on the <a href="https://www.instagram.com/federacaonautica.rn/" rel="noopener">@federacaonautica.rn</a> profile. If you are reading this after 11/14, the schedule above is the one the organizers published before the date; results come out on the federation's and Dr. Wind's profiles.</p>

<h2 id="sertoes-kitesurf">Sertões Kitesurf 2026: the downwind race passes through Gostoso</h2>
<p>The Sertões Kitesurf runs from November 25 to 28, 2026 and links Touros (RN) to Fortim (CE). According to its official site, the event started in 2021, was the first long-distance kitesurf crossing and has covered more than 2,000 km over five editions. This is the sixth. Rider registration is open on the Sertões website.</p>
<p>Gostoso has a place of honor on the route. The very first edition left from the Kauli Seadi Beach Hotel in 2021, and the 2026 second stage leaves from there too, heading to Galinhos. The stops, which the organizers call Vilas Sertões Kitesurf, are:</p>
<ul>
<li><strong>Touros (RN):</strong> Hotel Vila Galé, with kit pickup, briefing and the November 25 start.</li>
<li><strong>São Miguel do Gostoso (RN):</strong> <a href="/negocio/kauli-seadi-beach-hotel">Kauli Seadi Beach Hotel</a>, starting point of the second stage.</li>
<li><strong>Galinhos (RN):</strong> Praça dos Pescadores.</li>
<li><strong>Grossos (RN):</strong> Igrejinha dos Barcos, the next-to-last stop.</li>
<li><strong>Fortim (CE):</strong> Jaguaribe Kite Lodge, where the race ends and the winners are crowned.</li>
</ul>
<p>The start time of the Gostoso stage had not been announced as of 11/12. If you want to follow it up close, check the Sertões profile and website in the days before. For those who are not racing, the organizers also sell the Kitesurf Expedition, which follows the race aboard a UTV along the Cliffs Route; dates and spots are on the site.</p>

<h2 id="viagem">Fitting both events into your trip</h2>
<p>Both dates fall in the region's wind season, and the town tends to fill up when there is an event, so book early. See the options in <a href="/fique">where to stay in Gostoso</a> and the <a href="/blog/where-to-stay-sao-miguel-do-gostoso">lodging guide</a>. To get here, the <a href="/transfer">transfer</a> page and the guide <a href="/blog/how-to-get-to-sao-miguel-do-gostoso">how to get to São Miguel do Gostoso</a> cover the way from Natal airport.</p>
<p>If you plan to learn during the week, start with the <a href="/blog/beginner-kitesurf-guide-sao-miguel-do-gostoso">guide for people who have never kitesurfed</a> and the overview of <a href="/blog/kitesurf-in-sao-miguel-do-gostoso">kitesurfing in Gostoso</a>. On days without a race, <a href="/passeie">tours and sports</a> and the <a href="/explore">map</a> help build the plan, and the <a href="/come">where to eat</a> page sorts out dinner after the race.</p>

<div class="callout callout--info">
<p><strong>Want to watch up close:</strong> the Copa keeps everything on the same beach, with the start at Dr. Wind and awards at 5 pm at Bar da Praia.</p>
<p><strong>Want to catch the race:</strong> follow the stage leaving from the Kauli Seadi Beach Hotel and confirm the time with the organizers.</p>
</div>

<h2 id="perguntas-frequentes">Frequently asked questions</h2>
<h3>When is the Copa dos Ventos 2026 in São Miguel do Gostoso?</h3>
<p>On Saturday, November 14, 2026, with check-in from 8:30 am and awards at 5 pm, at Dr. Wind, Santo Cristo Beach.</p>
<h3>Which disciplines are in the Copa dos Ventos?</h3>
<p>Kitesurf TT Race, wingfoil race and wingfoil freestyle, plus races for rookies and beginners. This year there is also a team competition.</p>
<h3>When is the Sertões Kitesurf 2026?</h3>
<p>From November 25 to 28, 2026, between Touros (RN) and Fortim (CE).</p>
<h3>Does the Sertões Kitesurf pass through São Miguel do Gostoso?</h3>
<p>Yes. The Kauli Seadi Beach Hotel, in Gostoso, is the starting point of the second stage, heading to Galinhos.</p>
<h3>Do I have to pay to watch?</h3>
<p>The organizers had not announced a ticket for spectators as of 11/12. Confirm with them before you go.</p>

<h2 id="fontes">Sources and references</h2>
<ul>
<li>Copa dos Ventos: <a href="https://www.instagram.com/p/Dfk_5BrBXBb/" rel="noopener">official schedule</a> and <a href="https://www.instagram.com/p/DfiYNEpRLvW/" rel="noopener">team competition rules</a>, published by the Rio Grande do Norte Nautical Federation (<a href="https://www.instagram.com/federacaonautica.rn/" rel="noopener">@federacaonautica.rn</a>). In Portuguese.</li>
<li>Sertões Kitesurf: the <a href="https://sertoes.com.br/kite/" rel="noopener">official site</a> and the news item <a href="https://sertoes.com.br/blog/noticias/conheca-os-locais-que-receberao-as-vilas-sertoes-kitesurf/" rel="noopener">Conheça os locais que receberão as Vilas Sertões Kitesurf</a>, from October 7, 2026. In Portuguese.</li>
</ul>
<p>Vive Gostoso does not organize either event. Know of another wind sports event in Gostoso? Message us on <a href="https://wa.me/558488182779?text=Hello%21%20I%20want%20to%20suggest%20an%20event%20in%20Gostoso." rel="noopener">Vive Gostoso's WhatsApp</a> and send the official link.</p>$vgpost$,
  '/images/blog/copa-dos-ventos-and-sertoes-kitesurf-november-2026-gostoso.png',
  'Vive Gostoso',
  ARRAY['kitesurf','wingfoil','events','november','são miguel do gostoso'],
  false,
  '2026-11-13 09:00:00-03'::timestamptz,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"When is the Copa dos Ventos 2026 in São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"On Saturday, November 14, 2026, with check-in from 8:30 am and awards at 5 pm, at Dr. Wind, Santo Cristo Beach."}},{"@type":"Question","name":"Which disciplines are in the Copa dos Ventos?","acceptedAnswer":{"@type":"Answer","text":"Kitesurf TT Race, wingfoil race and wingfoil freestyle, plus races for rookies and beginners. This year there is also a team competition."}},{"@type":"Question","name":"When is the Sertões Kitesurf 2026?","acceptedAnswer":{"@type":"Answer","text":"From November 25 to 28, 2026, between Touros (RN) and Fortim (CE)."}},{"@type":"Question","name":"Does the Sertões Kitesurf pass through São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Yes. The Kauli Seadi Beach Hotel, in Gostoso, is the starting point of the second stage, heading to Galinhos."}},{"@type":"Question","name":"Do I have to pay to watch?","acceptedAnswer":{"@type":"Answer","text":"The organizers had not announced a ticket for spectators as of 11/12. Confirm with them before you go."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"en","image":"https://www.vivegostoso.com.br/images/blog/copa-dos-ventos-and-sertoes-kitesurf-november-2026-gostoso.png","name":"Copa dos Ventos 2026","startDate":"2026-11-14T08:30:00-03:00","location":{"@type":"Place","name":"Dr. Wind, Santo Cristo Beach","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR","streetAddress":"R. Ponta do Santo Cristo, 1"}},"description":"Potiguar Kitesurf TT Race Championship and Potiguar Wingfoil Race Circuit, with every race starting at Dr. Wind and a team competition.","url":"https://www.instagram.com/p/Dfk_5BrBXBb/","organizer":{"@type":"Organization","name":"Rio Grande do Norte Nautical Federation","url":"https://www.instagram.com/federacaonautica.rn/"},"endDate":"2026-11-14T17:00:00-03:00"},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"en","image":"https://www.vivegostoso.com.br/images/blog/copa-dos-ventos-and-sertoes-kitesurf-november-2026-gostoso.png","name":"Sertões Kitesurf 2026","startDate":"2026-11-25","location":{"@type":"Place","name":"Touros (RN) to Fortim (CE), with the second stage leaving from São Miguel do Gostoso","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"A staged kitesurf crossing between Touros (RN) and Fortim (CE); the second stage leaves from the Kauli Seadi Beach Hotel in Gostoso, heading to Galinhos.","url":"https://sertoes.com.br/kite/","organizer":{"@type":"Organization","name":"Sertões","url":"https://sertoes.com.br/kite/"},"endDate":"2026-11-28"}]}$vgfaq$
),
(
  'copa-dos-ventos-y-sertoes-kitesurf-noviembre-2026-gostoso',
  'Copa dos Ventos y Sertões Kitesurf en Gostoso: noviembre de 2026',
  'Copa dos Ventos el 14/11 en Dr. Wind y Sertões Kitesurf del 25 al 28/11, con la 2.ª etapa saliendo de Gostoso: programa, lugares y fuentes oficiales.',
  $vgpost$<p>Dos eventos de deportes de viento marcan noviembre de 2026 en São Miguel do Gostoso: la Copa dos Ventos, el sábado 14 de noviembre, y el Sertões Kitesurf, del 25 al 28 de noviembre. La Copa reúne regatas de kitesurf y wingfoil, todas con salida en Dr. Wind, en la Playa de Santo Cristo. El Sertões es una travesía de kitesurf entre Touros (RN) y Fortim (CE), y su segunda etapa sale de Gostoso, del Kauli Seadi Beach Hotel, rumbo a Galinhos.</p>
<p>Última revisión: 12/11/2026, en las publicaciones oficiales de la Federación Náutica de Rio Grande do Norte y en el sitio del Sertões. Los horarios y los lugares pueden cambiar con el viento, así que la última palabra es siempre de la organización.</p>

<h2 id="resumo">Los dos eventos lado a lado</h2>
<table class="comparison-table">
<thead><tr><th>Evento</th><th>Cuándo</th><th>Dónde</th><th>Qué es</th></tr></thead>
<tbody>
<tr><td>Copa dos Ventos</td><td>Sábado 14/11/2026, de 8:30 a 17:00</td><td>Dr. Wind, Playa de Santo Cristo, São Miguel do Gostoso</td><td>Campeonato Potiguar de Kitesurf TT Race y Circuito Potiguar de Wingfoil Race, con competencia por equipos</td></tr>
<tr><td>Sertões Kitesurf</td><td>25 al 28/11/2026</td><td>De Touros (RN) a Fortim (CE); la 2.ª etapa sale de Gostoso</td><td>Travesía de kitesurf por etapas que la organización llama la mayor carrera de downwind del planeta</td></tr>
</tbody>
</table>

<h2 id="copa-dos-ventos">Copa dos Ventos 2026: kitesurf y wingfoil en Santo Cristo</h2>
<p>La Copa dos Ventos la realizan RN dos Ventos y la Federación Náutica de Rio Grande do Norte, con apoyo de la Prefeitura de São Miguel do Gostoso y de la ABK. El sábado 14 de noviembre, la Playa de Santo Cristo recibe el Campeonato Potiguar de Kitesurf TT Race y el Circuito Potiguar de Wingfoil Race. Todas las regatas salen de <a href="/negocio/dr-wind">Dr. Wind</a>, en Ponta do Santo Cristo.</p>
<p>El programa oficial, publicado por la federación el 11 de noviembre:</p>
<ul>
<li><strong>8:30 a 11:30:</strong> acreditación y entrega del kit del atleta.</li>
<li><strong>9:30:</strong> mangas de freestyle.</li>
<li><strong>12:30:</strong> briefing con los regatistas.</li>
<li><strong>13:15:</strong> regatas de recorrido (Race 1 y Race 2).</li>
<li><strong>14:30:</strong> DW Race (Race 3, el Desafío Sertões), en Ponta do Santo Cristo/Nauan.</li>
<li><strong>14:40:</strong> regatas para debutantes y principiantes.</li>
<li><strong>17:00:</strong> premiación y sunset en el Bar da Praia.</li>
</ul>
<p>Este año hay una novedad: la competencia por equipos. Inspirada en el campeonato de constructores de la Fórmula 1, permite que escuelas, clubes y equipos deportivos sumen los puntos de sus atletas. Cuentan los tres mejores resultados de cada equipo en cada modalidad (kitesurf TT Race, wingfoil race y wingfoil freestyle), con 25 puntos para el primer lugar, 18 para el segundo y 15 para el tercero, con puntuación hasta el décimo puesto. El equipo campeón se lleva un trofeo especial. Quienes están empezando tienen competencias y premios propios.</p>
<p>La inscripción de atletas y equipos se abrió por el enlace del perfil <a href="https://www.instagram.com/federacaonautica.rn/" rel="noopener">@federacaonautica.rn</a>. Si lees este texto después del 14/11, el programa de arriba es el que la organización divulgó antes de la fecha; los resultados salen en los perfiles de la federación y de Dr. Wind.</p>

<h2 id="sertoes-kitesurf">Sertões Kitesurf 2026: la carrera de downwind pasa por Gostoso</h2>
<p>El Sertões Kitesurf se celebra del 25 al 28 de noviembre de 2026 y une Touros (RN) con Fortim (CE). Según su sitio oficial, el evento existe desde 2021, fue la primera travesía de larga distancia del kitesurf y suma más de 2.000 km recorridos en cinco ediciones. Esta es la sexta. La inscripción de los regatistas está abierta en el sitio del Sertões.</p>
<p>Gostoso tiene un lugar de honor en el recorrido. La primera edición salió en 2021 del Kauli Seadi Beach Hotel, y de allí sale también la segunda etapa de 2026, rumbo a Galinhos. Las paradas, que la organización llama Vilas Sertões Kitesurf, son estas:</p>
<ul>
<li><strong>Touros (RN):</strong> Hotel Vila Galé, con retiro de kits, briefing y la salida del día 25.</li>
<li><strong>São Miguel do Gostoso (RN):</strong> <a href="/negocio/kauli-seadi-beach-hotel">Kauli Seadi Beach Hotel</a>, punto de partida de la segunda etapa.</li>
<li><strong>Galinhos (RN):</strong> Praça dos Pescadores.</li>
<li><strong>Grossos (RN):</strong> Igrejinha dos Barcos, la penúltima parada.</li>
<li><strong>Fortim (CE):</strong> Jaguaribe Kite Lodge, donde termina la prueba y se corona a los ganadores.</li>
</ul>
<p>El horario de salida de la etapa de Gostoso no estaba divulgado al 12/11. Quien quiera seguirla de cerca debe revisar el perfil y el sitio del Sertões en los días previos. Para quienes no compiten, la organización también vende la Expedición Kitesurf, que acompaña la carrera a bordo de un UTV por la Ruta de los Acantilados; las fechas y los cupos están en el sitio.</p>

<h2 id="viagem">Cómo encajar los dos eventos en tu viaje</h2>
<p>Las dos fechas caen en la temporada de viento de la región, y el pueblo suele llenarse cuando hay evento, así que reserva con tiempo. Mira las opciones en <a href="/fique">dónde alojarse en Gostoso</a> y la <a href="/blog/donde-alojarse-sao-miguel-do-gostoso">guía de alojamiento</a>. Para llegar, la página de <a href="/transfer">transfer</a> y la guía <a href="/blog/como-llegar-a-sao-miguel-do-gostoso">cómo llegar a São Miguel do Gostoso</a> cubren el camino desde el aeropuerto de Natal.</p>
<p>Si vas a aprovechar la semana para aprender, empieza por la <a href="/blog/guia-principiantes-kitesurf-sao-miguel-do-gostoso">guía para quien nunca ha hecho kitesurf</a> y por el panorama del <a href="/blog/kitesurf-en-sao-miguel-do-gostoso">kitesurf en Gostoso</a>. En los días sin prueba, <a href="/passeie">paseos y deportes</a> y el <a href="/explore">mapa</a> ayudan a armar el plan, y la página de <a href="/come">dónde comer</a> resuelve la cena después de la regata.</p>

<div class="callout callout--info">
<p><strong>Quieres verlo de cerca:</strong> la Copa lo tiene todo en la misma playa, con salida en Dr. Wind y premiación a las 17:00 en el Bar da Praia.</p>
<p><strong>Quieres ver la carrera:</strong> sigue la etapa que sale del Kauli Seadi Beach Hotel y confirma el horario con la organización.</p>
</div>

<h2 id="perguntas-frequentes">Preguntas frecuentes</h2>
<h3>¿Cuándo es la Copa dos Ventos 2026 en São Miguel do Gostoso?</h3>
<p>El sábado 14 de noviembre de 2026, con acreditación desde las 8:30 y premiación a las 17:00, en Dr. Wind, Playa de Santo Cristo.</p>
<h3>¿Qué modalidades tiene la Copa dos Ventos?</h3>
<p>Kitesurf TT Race, wingfoil race y wingfoil freestyle, además de regatas para debutantes y principiantes. Este año también hay competencia por equipos.</p>
<h3>¿Cuándo es el Sertões Kitesurf 2026?</h3>
<p>Del 25 al 28 de noviembre de 2026, entre Touros (RN) y Fortim (CE).</p>
<h3>¿El Sertões Kitesurf pasa por São Miguel do Gostoso?</h3>
<p>Sí. El Kauli Seadi Beach Hotel, en Gostoso, es el punto de partida de la segunda etapa, rumbo a Galinhos.</p>
<h3>¿Hay que pagar para ver las pruebas?</h3>
<p>La organización no divulgó entrada para el público al 12/11. Confirma con ella antes de ir.</p>

<h2 id="fontes">Fuentes y referencias</h2>
<ul>
<li>Copa dos Ventos: <a href="https://www.instagram.com/p/Dfk_5BrBXBb/" rel="noopener">programa oficial</a> y <a href="https://www.instagram.com/p/DfiYNEpRLvW/" rel="noopener">reglas de la competencia por equipos</a>, publicados por la Federación Náutica de Rio Grande do Norte (<a href="https://www.instagram.com/federacaonautica.rn/" rel="noopener">@federacaonautica.rn</a>). En portugués.</li>
<li>Sertões Kitesurf: el <a href="https://sertoes.com.br/kite/" rel="noopener">sitio oficial</a> y la noticia <a href="https://sertoes.com.br/blog/noticias/conheca-os-locais-que-receberao-as-vilas-sertoes-kitesurf/" rel="noopener">Conheça os locais que receberão as Vilas Sertões Kitesurf</a>, del 7 de octubre de 2026. En portugués.</li>
</ul>
<p>Vive Gostoso no organiza ninguno de los dos eventos. ¿Conoces otro evento de deportes de viento en Gostoso? Escríbenos al <a href="https://wa.me/558488182779?text=Hola%21%20Quiero%20sugerir%20un%20evento%20en%20Gostoso." rel="noopener">WhatsApp de Vive Gostoso</a> y envía el enlace oficial.</p>$vgpost$,
  '/images/blog/copa-dos-ventos-y-sertoes-kitesurf-noviembre-2026-gostoso.png',
  'Vive Gostoso',
  ARRAY['kitesurf','wingfoil','eventos','noviembre','são miguel do gostoso'],
  false,
  '2026-11-13 09:00:00-03'::timestamptz,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"¿Cuándo es la Copa dos Ventos 2026 en São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"El sábado 14 de noviembre de 2026, con acreditación desde las 8:30 y premiación a las 17:00, en Dr. Wind, Playa de Santo Cristo."}},{"@type":"Question","name":"¿Qué modalidades tiene la Copa dos Ventos?","acceptedAnswer":{"@type":"Answer","text":"Kitesurf TT Race, wingfoil race y wingfoil freestyle, además de regatas para debutantes y principiantes. Este año también hay competencia por equipos."}},{"@type":"Question","name":"¿Cuándo es el Sertões Kitesurf 2026?","acceptedAnswer":{"@type":"Answer","text":"Del 25 al 28 de noviembre de 2026, entre Touros (RN) y Fortim (CE)."}},{"@type":"Question","name":"¿El Sertões Kitesurf pasa por São Miguel do Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Sí. El Kauli Seadi Beach Hotel, en Gostoso, es el punto de partida de la segunda etapa, rumbo a Galinhos."}},{"@type":"Question","name":"¿Hay que pagar para ver las pruebas?","acceptedAnswer":{"@type":"Answer","text":"La organización no divulgó entrada para el público al 12/11. Confirma con ella antes de ir."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"es","image":"https://www.vivegostoso.com.br/images/blog/copa-dos-ventos-y-sertoes-kitesurf-noviembre-2026-gostoso.png","name":"Copa dos Ventos 2026","startDate":"2026-11-14T08:30:00-03:00","location":{"@type":"Place","name":"Dr. Wind, Playa de Santo Cristo","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR","streetAddress":"R. Ponta do Santo Cristo, 1"}},"description":"Campeonato Potiguar de Kitesurf TT Race y Circuito Potiguar de Wingfoil Race, con salida de todas las regatas en Dr. Wind y competencia por equipos.","url":"https://www.instagram.com/p/Dfk_5BrBXBb/","organizer":{"@type":"Organization","name":"Federación Náutica de Rio Grande do Norte","url":"https://www.instagram.com/federacaonautica.rn/"},"endDate":"2026-11-14T17:00:00-03:00"},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"es","image":"https://www.vivegostoso.com.br/images/blog/copa-dos-ventos-y-sertoes-kitesurf-noviembre-2026-gostoso.png","name":"Sertões Kitesurf 2026","startDate":"2026-11-25","location":{"@type":"Place","name":"Touros (RN) a Fortim (CE), con la segunda etapa saliendo de São Miguel do Gostoso","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Travesía de kitesurf por etapas entre Touros (RN) y Fortim (CE); la segunda etapa sale del Kauli Seadi Beach Hotel, en Gostoso, rumbo a Galinhos.","url":"https://sertoes.com.br/kite/","organizer":{"@type":"Organization","name":"Sertões","url":"https://sertoes.com.br/kite/"},"endDate":"2026-11-28"}]}$vgfaq$
),
(
  'mostra-de-cinema-de-gostoso-2026-filmes-e-programacao',
  '13ª Mostra de Cinema de Gostoso 2026: filmes e programação',
  'A 13ª Mostra de Cinema de Gostoso é de 20 a 24/11, grátis, na Praia do Maceió. Veja a sessão de abertura, os filmes já selecionados e a grade que falta sair.',
  $vgpost$<p>A 13ª Mostra de Cinema de Gostoso acontece de 20 a 24 de novembro de 2026, na Praia do Maceió, em São Miguel do Gostoso, com programação totalmente gratuita. A abertura é na sexta, 20 de novembro: a cerimônia começa às 20h, na sala ao ar livre, seguida de <em>Vicentina Pede Desculpas</em>, novo longa de Gabriel Martins. Já foram divulgados os filmes da Mostra Panorama, da Mostra Potiguar e da Mostra Infantil. Até 12/11, a grade por dia e horário e a lista da Mostra Competitiva ainda não tinham saído no perfil oficial.</p>
<p>Última conferência: 12/11/2026, no site e no Instagram oficiais da Mostra. Este guia complementa o texto sobre <a href="/blog/mostra-de-cinema-de-gostoso-2026">datas, estrutura e hospedagem do festival</a>.</p>

<h2 id="resumo">O que já está definido</h2>
<table class="comparison-table">
<thead><tr><th>Bloco</th><th>Onde e quando</th><th>O que já foi divulgado</th></tr></thead>
<tbody>
<tr><td>Sessão de abertura</td><td>Sexta, 20/11, cerimônia às 20h, sala ao ar livre</td><td><em>Vicentina Pede Desculpas</em>, de Gabriel Martins</td></tr>
<tr><td>Mostra Panorama</td><td>À tarde, na tenda geodésica (Sala Petrobras)</td><td>4 longas e 7 curtas</td></tr>
<tr><td>Mostra Potiguar</td><td>Datas e horários a divulgar</td><td>1 longa e 8 curtas do Rio Grande do Norte</td></tr>
<tr><td>Mostra Infantil</td><td>Duas sessões para alunos da rede pública de Gostoso</td><td>8 curtas das cinco regiões do Brasil</td></tr>
<tr><td>Mostra Competitiva</td><td>Datas e horários a divulgar</td><td>Lista ainda não divulgada em 12/11</td></tr>
</tbody>
</table>

<h2 id="abertura">Abertura: Vicentina Pede Desculpas</h2>
<p>O filme de abertura é <em>Vicentina Pede Desculpas</em>, do cineasta mineiro Gabriel Martins, com Rejane Faria no papel principal. Na história, Vicentina é uma mãe cuja vida muda quando um ônibus dirigido pelo filho dela cai de um viaduto e causa dezenas de mortes. Ela vai atrás das famílias das vítimas para pedir desculpas e descobre os limites do perdão.</p>
<p>Gabriel Martins volta à Mostra nove anos depois do curta <em>Nada</em>, exibido na Mostra Competitiva da 4ª edição. Em 2022, a Mostra também exibiu o longa dele <em>Marte Um</em>. Segundo o anúncio oficial, <em>Vicentina Pede Desculpas</em> está em cartaz nos cinemas do país e estreia na Netflix no mesmo dia da exibição em Gostoso.</p>

<h2 id="panorama">Mostra Panorama: 4 longas e 7 curtas</h2>
<p>A Mostra Panorama é exibida no período da tarde, na tenda geodésica climatizada da Praia do Maceió, com projeção 4K e som 7.1. Os filmes selecionados:</p>
<p><strong>Longas-metragens</strong></p>
<ul>
<li><em>A Fabulosa Máquina do Tempo</em> (RJ), de Eliza Capai.</li>
<li><em>Não Estamos Sonhando</em> (AL), de Ulisses Arthur.</li>
<li><em>Pequenas Tragédias</em> (GO), de Daniel Nolasco.</li>
<li><em>A Vez de Espera</em> (SP), de Chico Bahia, com estreia mundial na Mostra.</li>
</ul>
<p><strong>Curtas-metragens</strong></p>
<ul>
<li><em>Os Meus Ancestrais</em> (MT), de Piratá Waurá.</li>
<li><em>Marimbã Está Acontecendo</em> (CE), de Maryn Marynho.</li>
<li><em>O Grande Artista</em> (PB), de Allison Linhares.</li>
<li><em>Tião Personal Dancer</em> (GO), de Aristótelis Tothi.</li>
<li><em>Floresta do Fim do Mundo</em> (RJ), de Denilson Baniwa e Felipe M. Bragança.</li>
<li><em>Tanaru</em> (RO), de Júlia Mariano.</li>
<li><em>Futuro Decadance</em> (AL), de Leviathan.</li>
</ul>

<h2 id="potiguar">Mostra Potiguar: o cinema feito no Rio Grande do Norte</h2>
<p>A Mostra Potiguar exibe um longa e oito curtas, entre ficção, animação e documentário, sobre memória, identidade, cultura popular, juventude, espiritualidade e território. O longa é <em>Leite em Pó</em>, dirigido por Carlos Segundo. Os curtas são <em>À Primeira Vista</em>, <em>Cena Viva</em>, <em>Duna</em>, <em>Filha da Ilha</em>, <em>Ginga com Tapioca</em>, <em>Meu Amigo Satanás</em>, <em>O Reduto</em> e <em>Pemba</em>.</p>
<p>A curadoria teve a participação especial de Sofia Carlos, ao lado de Carine Fiúza, Eugenio Puppo, Janaína Oliveira, Mariana Souza e Matheus Sundfeld. Depois do festival, a plataforma Itaú Cultural Play vai disponibilizar uma seleção de dez produções potiguares e conceder um prêmio de licenciamento a um filme do estado.</p>

<h2 id="infantil">Mostra Infantil: de volta em 2026</h2>
<p>A Mostra Infantil retorna com oito curtas de todas as regiões do Brasil, em duas sessões voltadas a alunos da rede pública de São Miguel do Gostoso. A curadoria é de Melina Bomfim, em parceria com professoras e professores da rede municipal.</p>

<h2 id="competitiva">Mostra Competitiva, debates e sessões especiais</h2>
<p>Segundo o site oficial, a Mostra Competitiva reúne longas e curtas que concorrem ao Troféu do Júri Popular, por voto do público, e ao Troféu da Imprensa, por voto de jornalistas e críticos presentes. Os debates acontecem todos os dias, num auditório na Pousada dos Ponteiros, ao lado das salas, e as sessões especiais passam depois da Competitiva. Os títulos e os horários de cada bloco ainda dependem do anúncio da grade.</p>
<p>A Mostra também mantém cursos de formação técnica e audiovisual para jovens de Gostoso. Desde 2013, segundo o site, foram 52 oficinas e 28 curtas produzidos. O festival é reconhecido desde 2025 como Patrimônio Cultural, Turístico e Imaterial do Rio Grande do Norte.</p>

<h2 id="viagem">Como ir e onde ficar</h2>
<p>As sessões são gratuitas e a cidade enche na semana do festival, então reserve cedo: veja <a href="/fique">onde ficar em Gostoso</a>, o <a href="/blog/pousadas-sao-miguel-do-gostoso">guia de pousadas</a> e o <a href="/transfer">transfer</a> desde Natal. A <a href="/negocio/pousada-dos-ponteiros">Pousada dos Ponteiros</a> fica ao lado das salas e abriga o auditório dos debates. Nos intervalos, o <a href="/explore">mapa</a> e as <a href="/blog/praias-sao-miguel-do-gostoso">praias de Gostoso</a> ajudam a montar o dia, e <a href="/come">onde comer</a> resolve o jantar antes da sessão. Para chegar, veja <a href="/blog/como-chegar-sao-miguel-do-gostoso">como chegar a São Miguel do Gostoso</a>.</p>

<h2 id="perguntas-frequentes">Perguntas frequentes</h2>
<h3>A Mostra de Cinema de Gostoso é gratuita?</h3>
<p>Sim. A organização informa que toda a programação é gratuita.</p>
<h3>Quando começa a 13ª Mostra de Cinema de Gostoso?</h3>
<p>Na sexta, 20 de novembro de 2026, com cerimônia às 20h na sala ao ar livre, seguida de <em>Vicentina Pede Desculpas</em>. O festival vai até 24 de novembro.</p>
<h3>Onde é a Mostra?</h3>
<p>Na Praia do Maceió, em São Miguel do Gostoso (RN), em duas salas: a de cinema ao ar livre e a tenda climatizada da Mostra Panorama.</p>
<h3>Quais filmes já foram anunciados?</h3>
<p>Até 12/11: a abertura, 4 longas e 7 curtas da Mostra Panorama, 1 longa e 8 curtas da Mostra Potiguar e 8 curtas da Mostra Infantil. A Mostra Competitiva ainda não tinha sido divulgada.</p>
<h3>Onde vejo a grade por dia e horário?</h3>
<p>No perfil <a href="https://www.instagram.com/mostradecinemadegostoso/" rel="noopener">@mostradecinemadegostoso</a> e no <a href="https://www.mostradecinemadegostoso.com.br/" rel="noopener">site oficial</a>, onde a programação completa será divulgada.</p>

<h2 id="fontes">Fontes e referências</h2>
<ul>
<li><a href="https://www.mostradecinemadegostoso.com.br/" rel="noopener">Site oficial da Mostra de Cinema de Gostoso</a> e perfil <a href="https://www.instagram.com/mostradecinemadegostoso/" rel="noopener">@mostradecinemadegostoso</a>.</li>
<li>Posts oficiais: <a href="https://www.instagram.com/p/DfnicqUFNQR/" rel="noopener">sessão de abertura</a>, <a href="https://www.instagram.com/p/DfiIUknFFrt/" rel="noopener">longas da Mostra Panorama</a>, <a href="https://www.instagram.com/p/DfiKGDblIVF/" rel="noopener">curtas da Mostra Panorama</a>, <a href="https://www.instagram.com/p/DfaKeUzFFW_/" rel="noopener">Mostra Potiguar</a> e <a href="https://www.instagram.com/p/DfVX4QnlPns/" rel="noopener">Mostra Infantil</a>.</li>
</ul>
<p>O Vive Gostoso não organiza a Mostra. As informações vêm do que a organização publicou; a grade completa, quando sair, vale mais do que este resumo.</p>$vgpost$,
  '/images/blog/mostra-de-cinema-de-gostoso-2026-filmes-e-programacao.png',
  'Vive Gostoso',
  ARRAY['cinema','mostra de cinema','eventos','praia do maceió','novembro'],
  false,
  '2026-11-16 17:00:00-03'::timestamptz,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"A Mostra de Cinema de Gostoso é gratuita?","acceptedAnswer":{"@type":"Answer","text":"Sim. A organização informa que toda a programação é gratuita."}},{"@type":"Question","name":"Quando começa a 13ª Mostra de Cinema de Gostoso?","acceptedAnswer":{"@type":"Answer","text":"Na sexta, 20 de novembro de 2026, com cerimônia às 20h na sala ao ar livre, seguida de Vicentina Pede Desculpas. O festival vai até 24 de novembro."}},{"@type":"Question","name":"Onde é a Mostra?","acceptedAnswer":{"@type":"Answer","text":"Na Praia do Maceió, em São Miguel do Gostoso (RN), em duas salas: a de cinema ao ar livre e a tenda climatizada da Mostra Panorama."}},{"@type":"Question","name":"Quais filmes já foram anunciados?","acceptedAnswer":{"@type":"Answer","text":"Até 12/11: a abertura, 4 longas e 7 curtas da Mostra Panorama, 1 longa e 8 curtas da Mostra Potiguar e 8 curtas da Mostra Infantil. A Mostra Competitiva ainda não tinha sido divulgada."}},{"@type":"Question","name":"Onde vejo a grade por dia e horário?","acceptedAnswer":{"@type":"Answer","text":"No perfil @mostradecinemadegostoso e no site oficial, onde a programação completa será divulgada."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"pt-BR","image":"https://www.vivegostoso.com.br/images/blog/mostra-de-cinema-de-gostoso-2026-filmes-e-programacao.png","name":"13ª Mostra de Cinema de Gostoso","startDate":"2026-11-20","location":{"@type":"Place","name":"Praia do Maceió","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Festival de cinema brasileiro com programação gratuita, em duas salas na Praia do Maceió: sessão de abertura com Vicentina Pede Desculpas, Mostra Competitiva, Mostra Panorama, Mostra Potiguar e Mostra Infantil.","url":"https://www.mostradecinemadegostoso.com.br/","organizer":{"@type":"Organization","name":"Mostra de Cinema de Gostoso","url":"https://www.mostradecinemadegostoso.com.br/"},"endDate":"2026-11-24"}]}$vgfaq$
),
(
  'gostoso-film-festival-2026-films-and-schedule',
  '13th Mostra de Cinema de Gostoso 2026: films and schedule',
  'The 13th Mostra de Cinema de Gostoso runs Nov 20 to 24, free, at Maceió Beach. See the opening film, the lineups announced so far and what is still missing.',
  $vgpost$<p>The 13th Mostra de Cinema de Gostoso takes place from November 20 to 24, 2026, at Maceió Beach in São Miguel do Gostoso, with a fully free program. Opening night is Friday, November 20: the ceremony starts at 8 pm in the open-air cinema, followed by <em>Vicentina Pede Desculpas</em>, the new feature by Gabriel Martins. The lineups for the Panorama, Potiguar and Children's programs have been announced. As of 11/12, the day-by-day, time-by-time schedule and the list for the Competitive program had not yet appeared on the official profile.</p>
<p>Last checked: 11/12/2026, on the festival's official website and Instagram. This guide complements the post on the <a href="/blog/mostra-de-cinema-de-gostoso-2026">festival's dates, venues and lodging</a>. The festival's own material is in Portuguese, and the films are Brazilian.</p>

<h2 id="resumo">What is already set</h2>
<table class="comparison-table">
<thead><tr><th>Program</th><th>Where and when</th><th>What has been announced</th></tr></thead>
<tbody>
<tr><td>Opening session</td><td>Friday, 11/20, ceremony at 8 pm, open-air cinema</td><td><em>Vicentina Pede Desculpas</em>, by Gabriel Martins</td></tr>
<tr><td>Panorama program</td><td>Afternoons, in the geodesic tent (Sala Petrobras)</td><td>4 features and 7 shorts</td></tr>
<tr><td>Potiguar program</td><td>Dates and times to be announced</td><td>1 feature and 8 shorts from Rio Grande do Norte</td></tr>
<tr><td>Children's program</td><td>Two sessions for public school students in Gostoso</td><td>8 shorts from the five regions of Brazil</td></tr>
<tr><td>Competitive program</td><td>Dates and times to be announced</td><td>List not yet announced on 11/12</td></tr>
</tbody>
</table>

<h2 id="abertura">Opening film: Vicentina Pede Desculpas</h2>
<p>The opening film is <em>Vicentina Pede Desculpas</em> (Vicentina Apologizes), by Minas Gerais filmmaker Gabriel Martins, starring Rejane Faria. Vicentina is a mother whose life changes when a bus driven by her son falls off a viaduct and dozens of people die. She seeks out the victims' families to apologize and discovers the limits of forgiveness.</p>
<p>Gabriel Martins returns to the festival nine years after his short <em>Nada</em>, shown in the Competitive program of the 4th edition. In 2022 the festival also screened his feature <em>Marte Um</em>. According to the official announcement, <em>Vicentina Pede Desculpas</em> is in theaters across Brazil and premieres on Netflix on the same day as the Gostoso screening.</p>

<h2 id="panorama">Panorama program: 4 features and 7 shorts</h2>
<p>The Panorama program is shown in the afternoon, in the air-conditioned geodesic tent at Maceió Beach, with 4K projection and 7.1 sound. The selected films:</p>
<p><strong>Features</strong></p>
<ul>
<li><em>A Fabulosa Máquina do Tempo</em> (RJ), by Eliza Capai.</li>
<li><em>Não Estamos Sonhando</em> (AL), by Ulisses Arthur.</li>
<li><em>Pequenas Tragédias</em> (GO), by Daniel Nolasco.</li>
<li><em>A Vez de Espera</em> (SP), by Chico Bahia, with its world premiere at the festival.</li>
</ul>
<p><strong>Shorts</strong></p>
<ul>
<li><em>Os Meus Ancestrais</em> (MT), by Piratá Waurá.</li>
<li><em>Marimbã Está Acontecendo</em> (CE), by Maryn Marynho.</li>
<li><em>O Grande Artista</em> (PB), by Allison Linhares.</li>
<li><em>Tião Personal Dancer</em> (GO), by Aristótelis Tothi.</li>
<li><em>Floresta do Fim do Mundo</em> (RJ), by Denilson Baniwa and Felipe M. Bragança.</li>
<li><em>Tanaru</em> (RO), by Júlia Mariano.</li>
<li><em>Futuro Decadance</em> (AL), by Leviathan.</li>
</ul>

<h2 id="potiguar">Potiguar program: cinema made in Rio Grande do Norte</h2>
<p>The Potiguar program shows one feature and eight shorts, across fiction, animation and documentary, about memory, identity, popular culture, youth, spirituality and territory. The feature is <em>Leite em Pó</em>, directed by Carlos Segundo. The shorts are <em>À Primeira Vista</em>, <em>Cena Viva</em>, <em>Duna</em>, <em>Filha da Ilha</em>, <em>Ginga com Tapioca</em>, <em>Meu Amigo Satanás</em>, <em>O Reduto</em> and <em>Pemba</em>.</p>
<p>The curation had special participation from Sofia Carlos, alongside Carine Fiúza, Eugenio Puppo, Janaína Oliveira, Mariana Souza and Matheus Sundfeld. After the festival, the Itaú Cultural Play platform will make a selection of ten Potiguar productions available and award a licensing prize to one film from the state.</p>

<h2 id="infantil">Children's program: back in 2026</h2>
<p>The Children's program returns with eight shorts from every region of Brazil, in two sessions for public school students in São Miguel do Gostoso. It is curated by Melina Bomfim, together with teachers from the municipal school system.</p>

<h2 id="competitiva">Competitive program, debates and special sessions</h2>
<p>According to the official site, the Competitive program brings together features and shorts competing for the Popular Jury Trophy, by audience vote, and the Press Trophy, by vote of the journalists and critics present. Debates happen every day in an auditorium at Pousada dos Ponteiros, next to the screening rooms, and special sessions run after the Competitive program. Titles and times for each block still depend on the schedule announcement.</p>
<p>The festival also runs technical and audiovisual training courses for young people in Gostoso. Since 2013, per the site, 52 workshops and 28 shorts have been produced. The festival has been recognized since 2025 as Cultural, Tourist and Intangible Heritage of Rio Grande do Norte.</p>

<h2 id="viagem">Getting here and where to stay</h2>
<p>Screenings are free and the town fills up during festival week, so book early: see <a href="/fique">where to stay in Gostoso</a>, the <a href="/blog/where-to-stay-sao-miguel-do-gostoso">lodging guide</a> and the <a href="/transfer">transfer</a> from Natal. <a href="/negocio/pousada-dos-ponteiros">Pousada dos Ponteiros</a> sits next to the screening rooms and hosts the debate auditorium. Between sessions, the <a href="/explore">map</a> and the <a href="/blog/beaches-sao-miguel-do-gostoso">beaches of Gostoso</a> help plan the day, and <a href="/come">where to eat</a> sorts out dinner before the screening. To get here, see <a href="/blog/how-to-get-to-sao-miguel-do-gostoso">how to get to São Miguel do Gostoso</a>.</p>

<h2 id="perguntas-frequentes">Frequently asked questions</h2>
<h3>Is the Mostra de Cinema de Gostoso free?</h3>
<p>Yes. The organizers state that the entire program is free.</p>
<h3>When does the 13th Mostra de Cinema de Gostoso start?</h3>
<p>On Friday, November 20, 2026, with a ceremony at 8 pm in the open-air cinema, followed by <em>Vicentina Pede Desculpas</em>. The festival runs through November 24.</p>
<h3>Where is the festival?</h3>
<p>At Maceió Beach in São Miguel do Gostoso (RN), in two venues: the open-air cinema and the air-conditioned tent of the Panorama program.</p>
<h3>Which films have been announced so far?</h3>
<p>As of 11/12: the opening film, 4 features and 7 shorts in the Panorama program, 1 feature and 8 shorts in the Potiguar program and 8 shorts in the Children's program. The Competitive program had not been announced yet.</p>
<h3>Where can I see the day-by-day schedule?</h3>
<p>On the <a href="https://www.instagram.com/mostradecinemadegostoso/" rel="noopener">@mostradecinemadegostoso</a> profile and on the <a href="https://www.mostradecinemadegostoso.com.br/" rel="noopener">official website</a>, where the full program will be published.</p>

<h2 id="fontes">Sources and references</h2>
<ul>
<li><a href="https://www.mostradecinemadegostoso.com.br/" rel="noopener">Official website of the Mostra de Cinema de Gostoso</a> and the <a href="https://www.instagram.com/mostradecinemadegostoso/" rel="noopener">@mostradecinemadegostoso</a> profile. In Portuguese.</li>
<li>Official posts: <a href="https://www.instagram.com/p/DfnicqUFNQR/" rel="noopener">opening session</a>, <a href="https://www.instagram.com/p/DfiIUknFFrt/" rel="noopener">Panorama features</a>, <a href="https://www.instagram.com/p/DfiKGDblIVF/" rel="noopener">Panorama shorts</a>, <a href="https://www.instagram.com/p/DfaKeUzFFW_/" rel="noopener">Potiguar program</a> and <a href="https://www.instagram.com/p/DfVX4QnlPns/" rel="noopener">Children's program</a>. In Portuguese.</li>
</ul>
<p>Vive Gostoso does not organize the festival. The information comes from what the organizers published; the full schedule, once it is out, beats this summary.</p>$vgpost$,
  '/images/blog/gostoso-film-festival-2026-films-and-schedule.png',
  'Vive Gostoso',
  ARRAY['film festival','cinema','events','maceió beach','november'],
  false,
  '2026-11-16 17:00:00-03'::timestamptz,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Is the Mostra de Cinema de Gostoso free?","acceptedAnswer":{"@type":"Answer","text":"Yes. The organizers state that the entire program is free."}},{"@type":"Question","name":"When does the 13th Mostra de Cinema de Gostoso start?","acceptedAnswer":{"@type":"Answer","text":"On Friday, November 20, 2026, with a ceremony at 8 pm in the open-air cinema, followed by Vicentina Pede Desculpas. The festival runs through November 24."}},{"@type":"Question","name":"Where is the festival?","acceptedAnswer":{"@type":"Answer","text":"At Maceió Beach in São Miguel do Gostoso (RN), in two venues: the open-air cinema and the air-conditioned tent of the Panorama program."}},{"@type":"Question","name":"Which films have been announced so far?","acceptedAnswer":{"@type":"Answer","text":"As of 11/12: the opening film, 4 features and 7 shorts in the Panorama program, 1 feature and 8 shorts in the Potiguar program and 8 shorts in the Children's program. The Competitive program had not been announced yet."}},{"@type":"Question","name":"Where can I see the day-by-day schedule?","acceptedAnswer":{"@type":"Answer","text":"On the @mostradecinemadegostoso profile and on the official website, where the full program will be published."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"en","image":"https://www.vivegostoso.com.br/images/blog/gostoso-film-festival-2026-films-and-schedule.png","name":"13th Mostra de Cinema de Gostoso","startDate":"2026-11-20","location":{"@type":"Place","name":"Maceió Beach","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Brazilian film festival with a free program in two venues at Maceió Beach: opening session with Vicentina Pede Desculpas, Competitive, Panorama, Potiguar and Children's programs.","url":"https://www.mostradecinemadegostoso.com.br/","organizer":{"@type":"Organization","name":"Mostra de Cinema de Gostoso","url":"https://www.mostradecinemadegostoso.com.br/"},"endDate":"2026-11-24"}]}$vgfaq$
),
(
  'mostra-de-cine-de-gostoso-2026-peliculas-y-programacion',
  '13.ª Mostra de Cinema de Gostoso 2026: películas y programa',
  'La 13.ª Mostra de Cinema de Gostoso es del 20 al 24/11, gratis, en la Playa de Maceió. Mira la película de apertura, las selecciones ya anunciadas y lo que falta.',
  $vgpost$<p>La 13.ª Mostra de Cinema de Gostoso se celebra del 20 al 24 de noviembre de 2026, en la Playa de Maceió, en São Miguel do Gostoso, con programa totalmente gratuito. La apertura es el viernes 20 de noviembre: la ceremonia empieza a las 20:00 en la sala al aire libre, seguida de <em>Vicentina Pede Desculpas</em>, el nuevo largometraje de Gabriel Martins. Ya se anunciaron las películas de la Mostra Panorama, la Mostra Potiguar y la Mostra Infantil. Al 12/11, la grilla por día y hora y la lista de la Mostra Competitiva aún no habían salido en el perfil oficial.</p>
<p>Última revisión: 12/11/2026, en el sitio y el Instagram oficiales de la Mostra. Esta guía complementa el texto sobre <a href="/blog/mostra-de-cinema-de-gostoso-2026">fechas, estructura y alojamiento del festival</a>. El material del festival está en portugués y las películas son brasileñas.</p>

<h2 id="resumo">Lo que ya está definido</h2>
<table class="comparison-table">
<thead><tr><th>Bloque</th><th>Dónde y cuándo</th><th>Lo que ya se anunció</th></tr></thead>
<tbody>
<tr><td>Sesión de apertura</td><td>Viernes 20/11, ceremonia a las 20:00, sala al aire libre</td><td><em>Vicentina Pede Desculpas</em>, de Gabriel Martins</td></tr>
<tr><td>Mostra Panorama</td><td>Por la tarde, en la carpa geodésica (Sala Petrobras)</td><td>4 largometrajes y 7 cortos</td></tr>
<tr><td>Mostra Potiguar</td><td>Fechas y horarios por anunciar</td><td>1 largometraje y 8 cortos de Rio Grande do Norte</td></tr>
<tr><td>Mostra Infantil</td><td>Dos sesiones para alumnos de la red pública de Gostoso</td><td>8 cortos de las cinco regiones de Brasil</td></tr>
<tr><td>Mostra Competitiva</td><td>Fechas y horarios por anunciar</td><td>Lista aún no divulgada el 12/11</td></tr>
</tbody>
</table>

<h2 id="abertura">Apertura: Vicentina Pede Desculpas</h2>
<p>La película de apertura es <em>Vicentina Pede Desculpas</em> (Vicentina pide perdón), del cineasta de Minas Gerais Gabriel Martins, protagonizada por Rejane Faria. Vicentina es una madre cuya vida cambia cuando un autobús conducido por su hijo cae de un viaducto y mueren decenas de personas. Ella busca a las familias de las víctimas para pedir perdón y descubre los límites del perdón.</p>
<p>Gabriel Martins vuelve a la Mostra nueve años después del corto <em>Nada</em>, exhibido en la Mostra Competitiva de la 4.ª edición. En 2022 la Mostra también exhibió su largometraje <em>Marte Um</em>. Según el anuncio oficial, <em>Vicentina Pede Desculpas</em> está en cartelera en las salas del país y se estrena en Netflix el mismo día de la exhibición en Gostoso.</p>

<h2 id="panorama">Mostra Panorama: 4 largometrajes y 7 cortos</h2>
<p>La Mostra Panorama se exhibe por la tarde, en la carpa geodésica climatizada de la Playa de Maceió, con proyección 4K y sonido 7.1. Las películas seleccionadas:</p>
<p><strong>Largometrajes</strong></p>
<ul>
<li><em>A Fabulosa Máquina do Tempo</em> (RJ), de Eliza Capai.</li>
<li><em>Não Estamos Sonhando</em> (AL), de Ulisses Arthur.</li>
<li><em>Pequenas Tragédias</em> (GO), de Daniel Nolasco.</li>
<li><em>A Vez de Espera</em> (SP), de Chico Bahia, con estreno mundial en la Mostra.</li>
</ul>
<p><strong>Cortometrajes</strong></p>
<ul>
<li><em>Os Meus Ancestrais</em> (MT), de Piratá Waurá.</li>
<li><em>Marimbã Está Acontecendo</em> (CE), de Maryn Marynho.</li>
<li><em>O Grande Artista</em> (PB), de Allison Linhares.</li>
<li><em>Tião Personal Dancer</em> (GO), de Aristótelis Tothi.</li>
<li><em>Floresta do Fim do Mundo</em> (RJ), de Denilson Baniwa y Felipe M. Bragança.</li>
<li><em>Tanaru</em> (RO), de Júlia Mariano.</li>
<li><em>Futuro Decadance</em> (AL), de Leviathan.</li>
</ul>

<h2 id="potiguar">Mostra Potiguar: el cine hecho en Rio Grande do Norte</h2>
<p>La Mostra Potiguar exhibe un largometraje y ocho cortos, entre ficción, animación y documental, sobre memoria, identidad, cultura popular, juventud, espiritualidad y territorio. El largometraje es <em>Leite em Pó</em>, dirigido por Carlos Segundo. Los cortos son <em>À Primeira Vista</em>, <em>Cena Viva</em>, <em>Duna</em>, <em>Filha da Ilha</em>, <em>Ginga com Tapioca</em>, <em>Meu Amigo Satanás</em>, <em>O Reduto</em> y <em>Pemba</em>.</p>
<p>La curaduría contó con la participación especial de Sofia Carlos, junto a Carine Fiúza, Eugenio Puppo, Janaína Oliveira, Mariana Souza y Matheus Sundfeld. Después del festival, la plataforma Itaú Cultural Play pondrá a disposición una selección de diez producciones potiguares y entregará un premio de licenciamiento a una película del estado.</p>

<h2 id="infantil">Mostra Infantil: de vuelta en 2026</h2>
<p>La Mostra Infantil regresa con ocho cortos de todas las regiones de Brasil, en dos sesiones dirigidas a alumnos de la red pública de São Miguel do Gostoso. La curaduría es de Melina Bomfim, junto con profesoras y profesores de la red municipal.</p>

<h2 id="competitiva">Mostra Competitiva, debates y sesiones especiales</h2>
<p>Según el sitio oficial, la Mostra Competitiva reúne largometrajes y cortos que compiten por el Trofeo del Jurado Popular, por voto del público, y el Trofeo de la Prensa, por voto de periodistas y críticos presentes. Los debates se realizan todos los días, en un auditorio de la Pousada dos Ponteiros, junto a las salas, y las sesiones especiales pasan después de la Competitiva. Los títulos y horarios de cada bloque aún dependen del anuncio de la grilla.</p>
<p>La Mostra también mantiene cursos de formación técnica y audiovisual para jóvenes de Gostoso. Desde 2013, según el sitio, se hicieron 52 talleres y 28 cortos. El festival está reconocido desde 2025 como Patrimonio Cultural, Turístico e Inmaterial de Rio Grande do Norte.</p>

<h2 id="viagem">Cómo llegar y dónde alojarse</h2>
<p>Las sesiones son gratuitas y el pueblo se llena en la semana del festival, así que reserva con tiempo: mira <a href="/fique">dónde alojarse en Gostoso</a>, la <a href="/blog/donde-alojarse-sao-miguel-do-gostoso">guía de alojamiento</a> y el <a href="/transfer">transfer</a> desde Natal. La <a href="/negocio/pousada-dos-ponteiros">Pousada dos Ponteiros</a> queda junto a las salas y alberga el auditorio de los debates. Entre sesiones, el <a href="/explore">mapa</a> y las <a href="/blog/playas-sao-miguel-do-gostoso">playas de Gostoso</a> ayudan a armar el día, y <a href="/come">dónde comer</a> resuelve la cena antes de la sesión. Para llegar, mira <a href="/blog/como-llegar-a-sao-miguel-do-gostoso">cómo llegar a São Miguel do Gostoso</a>.</p>

<h2 id="perguntas-frequentes">Preguntas frecuentes</h2>
<h3>¿La Mostra de Cinema de Gostoso es gratuita?</h3>
<p>Sí. La organización informa que todo el programa es gratuito.</p>
<h3>¿Cuándo empieza la 13.ª Mostra de Cinema de Gostoso?</h3>
<p>El viernes 20 de noviembre de 2026, con ceremonia a las 20:00 en la sala al aire libre, seguida de <em>Vicentina Pede Desculpas</em>. El festival va hasta el 24 de noviembre.</p>
<h3>¿Dónde es la Mostra?</h3>
<p>En la Playa de Maceió, en São Miguel do Gostoso (RN), en dos salas: la de cine al aire libre y la carpa climatizada de la Mostra Panorama.</p>
<h3>¿Qué películas ya se anunciaron?</h3>
<p>Al 12/11: la apertura, 4 largometrajes y 7 cortos de la Mostra Panorama, 1 largometraje y 8 cortos de la Mostra Potiguar y 8 cortos de la Mostra Infantil. La Mostra Competitiva aún no se había divulgado.</p>
<h3>¿Dónde veo la grilla por día y hora?</h3>
<p>En el perfil <a href="https://www.instagram.com/mostradecinemadegostoso/" rel="noopener">@mostradecinemadegostoso</a> y en el <a href="https://www.mostradecinemadegostoso.com.br/" rel="noopener">sitio oficial</a>, donde se divulgará el programa completo.</p>

<h2 id="fontes">Fuentes y referencias</h2>
<ul>
<li><a href="https://www.mostradecinemadegostoso.com.br/" rel="noopener">Sitio oficial de la Mostra de Cinema de Gostoso</a> y perfil <a href="https://www.instagram.com/mostradecinemadegostoso/" rel="noopener">@mostradecinemadegostoso</a>. En portugués.</li>
<li>Publicaciones oficiales: <a href="https://www.instagram.com/p/DfnicqUFNQR/" rel="noopener">sesión de apertura</a>, <a href="https://www.instagram.com/p/DfiIUknFFrt/" rel="noopener">largometrajes de la Mostra Panorama</a>, <a href="https://www.instagram.com/p/DfiKGDblIVF/" rel="noopener">cortos de la Mostra Panorama</a>, <a href="https://www.instagram.com/p/DfaKeUzFFW_/" rel="noopener">Mostra Potiguar</a> y <a href="https://www.instagram.com/p/DfVX4QnlPns/" rel="noopener">Mostra Infantil</a>. En portugués.</li>
</ul>
<p>Vive Gostoso no organiza la Mostra. La información viene de lo que publicó la organización; la grilla completa, cuando salga, vale más que este resumen.</p>$vgpost$,
  '/images/blog/mostra-de-cine-de-gostoso-2026-peliculas-y-programacion.png',
  'Vive Gostoso',
  ARRAY['festival de cine','cine','eventos','playa de maceió','noviembre'],
  false,
  '2026-11-16 17:00:00-03'::timestamptz,
  $vgfaq${"@context":"https://schema.org","@graph":[{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"¿La Mostra de Cinema de Gostoso es gratuita?","acceptedAnswer":{"@type":"Answer","text":"Sí. La organización informa que todo el programa es gratuito."}},{"@type":"Question","name":"¿Cuándo empieza la 13.ª Mostra de Cinema de Gostoso?","acceptedAnswer":{"@type":"Answer","text":"El viernes 20 de noviembre de 2026, con ceremonia a las 20:00 en la sala al aire libre, seguida de Vicentina Pede Desculpas. El festival va hasta el 24 de noviembre."}},{"@type":"Question","name":"¿Dónde es la Mostra?","acceptedAnswer":{"@type":"Answer","text":"En la Playa de Maceió, en São Miguel do Gostoso (RN), en dos salas: la de cine al aire libre y la carpa climatizada de la Mostra Panorama."}},{"@type":"Question","name":"¿Qué películas ya se anunciaron?","acceptedAnswer":{"@type":"Answer","text":"Al 12/11: la apertura, 4 largometrajes y 7 cortos de la Mostra Panorama, 1 largometraje y 8 cortos de la Mostra Potiguar y 8 cortos de la Mostra Infantil. La Mostra Competitiva aún no se había divulgado."}},{"@type":"Question","name":"¿Dónde veo la grilla por día y hora?","acceptedAnswer":{"@type":"Answer","text":"En el perfil @mostradecinemadegostoso y en el sitio oficial, donde se divulgará el programa completo."}}]},{"@type":"Event","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","inLanguage":"es","image":"https://www.vivegostoso.com.br/images/blog/mostra-de-cine-de-gostoso-2026-peliculas-y-programacion.png","name":"13.ª Mostra de Cinema de Gostoso","startDate":"2026-11-20","location":{"@type":"Place","name":"Playa de Maceió","address":{"@type":"PostalAddress","addressLocality":"São Miguel do Gostoso","addressRegion":"RN","addressCountry":"BR"}},"description":"Festival de cine brasileño con programa gratuito en dos salas de la Playa de Maceió: sesión de apertura con Vicentina Pede Desculpas, Mostra Competitiva, Mostra Panorama, Mostra Potiguar y Mostra Infantil.","url":"https://www.mostradecinemadegostoso.com.br/","organizer":{"@type":"Organization","name":"Mostra de Cinema de Gostoso","url":"https://www.mostradecinemadegostoso.com.br/"},"endDate":"2026-11-24"}]}$vgfaq$
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_url = excluded.cover_url,
  tags = excluded.tags,
  faq_jsonld = excluded.faq_jsonld;

create extension if not exists pg_cron;

create or replace function public.vg_publicar_posts_agendados(p_slugs text[])
returns void
language sql
security definer
set search_path = public
as $fn$
  update public.gostoso_blog_posts
  set is_published = true
  where slug = any(p_slugs) and is_published = false;
$fn$;

revoke all on function public.vg_publicar_posts_agendados(text[]) from public, anon, authenticated;

-- Reexecução: remove as tarefas antigas antes de recriar.
select cron.unschedule(jobid) from cron.job
where jobname in ('vg-blog-ventos-2026-11-13', 'vg-blog-mostra-2026-11-16');

-- Sexta 13/11, 09h de Brasília = 12h UTC.
select cron.schedule(
  'vg-blog-ventos-2026-11-13',
  '0 12 13 11 *',
  $cron$
  select public.vg_publicar_posts_agendados(array['copa-dos-ventos-e-sertoes-kitesurf-novembro-2026-gostoso','copa-dos-ventos-and-sertoes-kitesurf-november-2026-gostoso','copa-dos-ventos-y-sertoes-kitesurf-noviembre-2026-gostoso']);
  select cron.unschedule('vg-blog-ventos-2026-11-13');
  $cron$
);

-- Segunda 16/11, 17h de Brasília = 20h UTC. Também põe, no post antigo da Mostra, o aviso com o link do novo.
select cron.schedule(
  'vg-blog-mostra-2026-11-16',
  '0 20 16 11 *',
  $cron$
  select public.vg_publicar_posts_agendados(array['mostra-de-cinema-de-gostoso-2026-filmes-e-programacao','gostoso-film-festival-2026-films-and-schedule','mostra-de-cine-de-gostoso-2026-peliculas-y-programacion']);
  update public.gostoso_blog_posts
  set content = replace(content, $r1$<h2>Programação: competição, panorama e prêmios</h2>$r1$, $r2$<h2>Programação: competição, panorama e prêmios</h2>
<p>Atualização de 16/11/2026: a sessão de abertura e os filmes já anunciados estão em <a href="/blog/mostra-de-cinema-de-gostoso-2026-filmes-e-programacao">13ª Mostra de Cinema de Gostoso 2026: filmes e programação</a>.</p>$r2$)
  where slug = 'mostra-de-cinema-de-gostoso-2026'
    and position('mostra-de-cinema-de-gostoso-2026-filmes-e-programacao' in content) = 0;
  select cron.unschedule('vg-blog-mostra-2026-11-16');
  $cron$
);
