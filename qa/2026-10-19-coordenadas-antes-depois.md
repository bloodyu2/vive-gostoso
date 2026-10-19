# Coordenadas no mar ou fora do lugar: antes e depois (19/10/2026)

Teste de agua: Mapbox Tilequery (camada water, raio 0) sobre as 146 coordenadas do banco. 23 caiam no mar. Posicao nova: ficha do Google Maps aberta no Chrome (nome conferido). Duas linhas em terra, mas a 400 e 500 m do ponto real (Baboon e Ore), tambem foram corrigidas. Backup: tabela `gostoso_businesses_coord_backup_20261019` (RLS ligada, sem acesso pela API publica). SQL: `scripts/cadastros/2026-10-19-coordenadas-no-mar.sql`.

| Negocio | Antes (lat, lng) | Depois (lat, lng) | Fonte |
|---|---|---|---|
| Bar do Tico (`bar-do-tico`) | -5.116, -35.633 | -5.121665, -35.6297061 | Google Maps: BAR DO TICO |
| Bistrô Capella (`bistro-capella`) | -5.1195, -35.6382 | -5.1219408, -35.6343541 | Google Maps: Bistrô Capella |
| Dr. Wind Beach Club & Watersports (`dr-wind`) | -5.1168, -35.624 | -5.1195898, -35.6205673 | Google Maps: Dr.WIND Water Sports Club |
| GKS Kite School (`gks-kite-school`) | -5.1158, -35.6232 | -5.1179755, -35.619364 | Google Maps: GKS kiteschool |
| Gostoso Adventure (`gostoso-adventure`) | -5.119, -35.6372 | -5.1229866, -35.6366837 | Google Maps: Gostoso Adventure |
| Gostoso Kitesurf (`gostoso-kitesurf`) | -5.1162, -35.6235 | -5.1197888, -35.6220857 | Google Maps: Gostoso Kitesurf |
| Hara Chalés e Spa (`hara-chales-e-spa`) | -5.1192, -35.6375 | -5.1199209, -35.644232 | Google Maps: Hara Pousada e SPA |
| Kauli Seadi Beach Hotel (`kauli-seadi-beach-hotel`) | -5.117, -35.6345 | -5.1238021, -35.6135025 | Google Maps: Kauli Seadi Beach Hotel |
| Leal Turismo (`leal-turismo`) | -5.1195, -35.6378 | -5.1239033, -35.631459 | Google Maps: Leal Turismo Passeios e Locações |
| Mar y Brasa (`mar-y-brasa`) | -5.1145, -35.6312 | -5.1193402, -35.620724 | Google Maps: Mar y Brasa Restaurante & Bar |
| Portofino Pousada (`portofino-pousada`) | -5.1168, -35.6342 | -5.1251066, -35.6256464 | Google Maps: Portofino Pousada |
| Pousada Chantilly (`pousada-chantilly`) | -5.1198, -35.638 | -5.1215829, -35.6337148 | Google Maps: Pousada Chantilly |
| Pousada Enseada do Gostoso (`pousada-enseada-do-gostoso`) | -5.1182, -35.6362 | -5.120809, -35.6390075 | Google Maps: Pousada Enseada (nome parecido, confianca media) |
| Pousada Mi Secreto (`pousada-mi-secreto`) | -5.1138, -35.6305 | -5.1196477, -35.6207489 | Google Maps: Mi Secreto Pousada & Spa |
| Pousada Só Alegria (`pousada-so-alegria`) | -5.1188, -35.637 | -5.1223724, -35.6365435 | Google Maps: Pousada Só Alegria |
| Pousada Solarium de Gostoso (`pousada-solarium`) | -5.1178, -35.6358 | -5.1262681, -35.6358147 | Google Maps: Pousada Solarium de Gostoso |
| Sampei (`sampei`) | -5.1185, -35.6365 | -5.1225785, -35.6363765 | Google Maps: Restaurante Sampei |
| Tribo do Kite (`tribo-do-kite`) | -5.1155, -35.6228 | -5.120863, -35.639007 | Google Maps: Tribo do kite School |
| Baboon Restaurante (`baboon-restaurante`) | -5.1238, -35.6378 | -5.1222225, -35.6342485 | Google Maps: Baboon Restaurante (400 m do ponto antigo) |
| Oré Cozinha (`ore-cozinha`) | -5.12, -35.6385 | -5.1224102, -35.6344614 | Google Maps: Oré Restaurante (500 m do ponto antigo) |
| Loja do Kite Gostoso (`loja-kite-gostoso`) | -5.1144, -35.6298 | sem coordenada | no mar e sem ficha no Google Maps |
| Luck Receptivo (`luck-receptivo`) | -5.1185, -35.6368 | sem coordenada | no mar e sem ficha no Google Maps |
| Mercadão Gostoso (`mercadao-gostoso`) | -5.1155, -35.629 | sem coordenada | no mar e sem ficha no Google Maps |
| Passeio de Barco Gostoso (`passeio-de-barco-gostoso`) | -5.118, -35.6362 | sem coordenada | no mar e sem ficha no Google Maps |
| Salão Brisa do Mar (`salao-brisa-do-mar`) | -5.1148, -35.6295 | sem coordenada | no mar e sem ficha no Google Maps |

Nao corrigidas: 65 negocios em terra com coordenada arredondada (4 casas) e endereco generico ('Sao Miguel do Gostoso/RN'), sem endereco para comparar nem ficha segura no Google Maps. Seguem aproximadas, dentro da vila. Seguem na tabela do banco sem mudanca.
