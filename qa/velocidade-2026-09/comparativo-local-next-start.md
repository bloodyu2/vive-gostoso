# Comparativo: local-next-start

Base: http://localhost:3100
Coletado em: 2026-09-29T03:00:04.650Z

## Rotas

790 rotas. Por status: 200: 773, 307: 8, 308: 4, 404: 5.
Tempo de resposta mediano das paginas HTML (fetch sem cache do cliente, concorrencia 6): 47 ms.

| status | cache-control | cache | rotas |
|---|---|---|---|
| 200 | private, no-cache, no-store, max-age=0, must-revalidate | - | 765 |
| 307 | - | - | 8 |
| 404 | private, no-cache, no-store, max-age=0, must-revalidate | - | 5 |
| 308 | - | - | 4 |
| 200 | public, max-age=0, must-revalidate | HIT | 2 |
| 200 | public, max-age=0 | - | 2 |
| 200 | public, max-age=0, must-revalidate | - | 2 |
| 200 | public, max-age=3600, s-maxage=86400 | HIT | 1 |
| 200 | public, max-age=0, must-revalidate | MISS | 1 |

## Diferencas de rota e SEO contra a linha de base

42 diferencas. Por campo: description: 42.

| rota | campo | antes | depois |
|---|---|---|---|
| /explore/mares/cardeiro | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia do Cardeiro, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia do Cardeiro, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/cardeiro | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia do Cardeiro, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia do Cardeiro, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/cardeiro | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia do Cardeiro, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia do Cardeiro, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/xepa | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia da Xêpa, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia da Xêpa, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/xepa | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia da Xêpa, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia da Xêpa, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/xepa | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia da Xêpa, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia da Xêpa, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/maceio | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia do Maceió, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia do Maceió, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/maceio | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia do Maceió, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia do Maceió, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/maceio | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia do Maceió, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia do Maceió, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/santo-cristo | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia do Santo Cristo, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia do Santo Cristo, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/santo-cristo | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia do Santo Cristo, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia do Santo Cristo, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/santo-cristo | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia do Santo Cristo, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia do Santo Cristo, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/tourinhos | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia de Tourinhos, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia de Tourinhos, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/tourinhos | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia de Tourinhos, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia de Tourinhos, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/tourinhos | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia de Tourinhos, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia de Tourinhos, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/minhoto | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia do Minhoto, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia do Minhoto, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/minhoto | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia do Minhoto, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia do Minhoto, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/minhoto | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia do Minhoto, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia do Minhoto, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/praia-do-amor | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia do Amor, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia do Amor, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/praia-do-amor | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia do Amor, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia do Amor, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/praia-do-amor | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia do Amor, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia do Amor, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/ze-martins | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia de Zé Martins, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia de Zé Martins, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/ze-martins | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia de Zé Martins, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia de Zé Martins, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/ze-martins | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia de Zé Martins, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia de Zé Martins, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/malhada | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia da Malhada, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia da Malhada, em São Miguel do Gostoso: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/malhada | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia da Malhada, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia da Malhada, in São Miguel do Gostoso: times, heights, the day's curve and moon phase. |
| /es/explore/mares/malhada | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia da Malhada, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia da Malhada, en São Miguel do Gostoso: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/perobas | description | Maré de hoje: alta 5h02 (2,51 m), baixa 10h59 (0,16 m), alta 17h19 (2,43 m), baixa 23h17 (0,18 m). Maré de hoje e dos próximos 7 dias na Praia de Perobas, em Touros: horários, alturas, curva do dia e fase da lua. | Maré de hoje: alta 5h44 (2,43 m), baixa 11h34 (0,24 m), alta 18h01 (2,36 m), baixa 23h59 (0,25 m). Maré de hoje e dos próximos 7 dias na Praia de Perobas, em Touros: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/perobas | description | Today's tide: high 5h02 (2.51 m), low 10h59 (0.16 m), high 17h19 (2.43 m), low 23h17 (0.18 m). Today's tide and the next 7 days at Praia de Perobas, in Touros: times, heights, the day's curve and moon phase. | Today's tide: high 5h44 (2.43 m), low 11h34 (0.24 m), high 18h01 (2.36 m), low 23h59 (0.25 m). Today's tide and the next 7 days at Praia de Perobas, in Touros: times, heights, the day's curve and moon phase. |
| /es/explore/mares/perobas | description | Marea de hoy: alta 5h02 (2,51 m), baja 10h59 (0,16 m), alta 17h19 (2,43 m), baja 23h17 (0,18 m). Marea de hoy y de los próximos 7 días en Praia de Perobas, en Touros: horarios, alturas, curva del día y fase lunar. | Marea de hoy: alta 5h44 (2,43 m), baja 11h34 (0,24 m), alta 18h01 (2,36 m), baja 23h59 (0,25 m). Marea de hoy y de los próximos 7 días en Praia de Perobas, en Touros: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/carnaubinha | description | Maré de hoje: alta 5h02 (2,51 m), baixa 10h59 (0,16 m), alta 17h19 (2,43 m), baixa 23h17 (0,18 m). Maré de hoje e dos próximos 7 dias na Praia de Carnaubinha, em Touros: horários, alturas, curva do dia e fase da lua. | Maré de hoje: alta 5h44 (2,43 m), baixa 11h34 (0,24 m), alta 18h01 (2,36 m), baixa 23h59 (0,25 m). Maré de hoje e dos próximos 7 dias na Praia de Carnaubinha, em Touros: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/carnaubinha | description | Today's tide: high 5h02 (2.51 m), low 10h59 (0.16 m), high 17h19 (2.43 m), low 23h17 (0.18 m). Today's tide and the next 7 days at Praia de Carnaubinha, in Touros: times, heights, the day's curve and moon phase. | Today's tide: high 5h44 (2.43 m), low 11h34 (0.24 m), high 18h01 (2.36 m), low 23h59 (0.25 m). Today's tide and the next 7 days at Praia de Carnaubinha, in Touros: times, heights, the day's curve and moon phase. |
| /es/explore/mares/carnaubinha | description | Marea de hoy: alta 5h02 (2,51 m), baja 10h59 (0,16 m), alta 17h19 (2,43 m), baja 23h17 (0,18 m). Marea de hoy y de los próximos 7 días en Praia de Carnaubinha, en Touros: horarios, alturas, curva del día y fase lunar. | Marea de hoy: alta 5h44 (2,43 m), baja 11h34 (0,24 m), alta 18h01 (2,36 m), baja 23h59 (0,25 m). Marea de hoy y de los próximos 7 días en Praia de Carnaubinha, en Touros: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/farol-do-calcanhar | description | Maré de hoje: alta 5h02 (2,51 m), baixa 10h59 (0,16 m), alta 17h19 (2,43 m), baixa 23h17 (0,18 m). Maré de hoje e dos próximos 7 dias na Praia do Farol do Calcanhar, em Touros: horários, alturas, curva do dia e fase da lua. | Maré de hoje: alta 5h44 (2,43 m), baixa 11h34 (0,24 m), alta 18h01 (2,36 m), baixa 23h59 (0,25 m). Maré de hoje e dos próximos 7 dias na Praia do Farol do Calcanhar, em Touros: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/farol-do-calcanhar | description | Today's tide: high 5h02 (2.51 m), low 10h59 (0.16 m), high 17h19 (2.43 m), low 23h17 (0.18 m). Today's tide and the next 7 days at Praia do Farol do Calcanhar, in Touros: times, heights, the day's curve and moon phase. | Today's tide: high 5h44 (2.43 m), low 11h34 (0.24 m), high 18h01 (2.36 m), low 23h59 (0.25 m). Today's tide and the next 7 days at Praia do Farol do Calcanhar, in Touros: times, heights, the day's curve and moon phase. |
| /es/explore/mares/farol-do-calcanhar | description | Marea de hoy: alta 5h02 (2,51 m), baja 10h59 (0,16 m), alta 17h19 (2,43 m), baja 23h17 (0,18 m). Marea de hoy y de los próximos 7 días en Praia do Farol do Calcanhar, en Touros: horarios, alturas, curva del día y fase lunar. | Marea de hoy: alta 5h44 (2,43 m), baja 11h34 (0,24 m), alta 18h01 (2,36 m), baja 23h59 (0,25 m). Marea de hoy y de los próximos 7 días en Praia do Farol do Calcanhar, en Touros: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/cajueiro | description | Maré de hoje: alta 5h02 (2,51 m), baixa 10h59 (0,16 m), alta 17h19 (2,43 m), baixa 23h17 (0,18 m). Maré de hoje e dos próximos 7 dias na Praia do Cajueiro, em Touros: horários, alturas, curva do dia e fase da lua. | Maré de hoje: alta 5h44 (2,43 m), baixa 11h34 (0,24 m), alta 18h01 (2,36 m), baixa 23h59 (0,25 m). Maré de hoje e dos próximos 7 dias na Praia do Cajueiro, em Touros: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/cajueiro | description | Today's tide: high 5h02 (2.51 m), low 10h59 (0.16 m), high 17h19 (2.43 m), low 23h17 (0.18 m). Today's tide and the next 7 days at Praia do Cajueiro, in Touros: times, heights, the day's curve and moon phase. | Today's tide: high 5h44 (2.43 m), low 11h34 (0.24 m), high 18h01 (2.36 m), low 23h59 (0.25 m). Today's tide and the next 7 days at Praia do Cajueiro, in Touros: times, heights, the day's curve and moon phase. |
| /es/explore/mares/cajueiro | description | Marea de hoy: alta 5h02 (2,51 m), baja 10h59 (0,16 m), alta 17h19 (2,43 m), baja 23h17 (0,18 m). Marea de hoy y de los próximos 7 días en Praia do Cajueiro, en Touros: horarios, alturas, curva del día y fase lunar. | Marea de hoy: alta 5h44 (2,43 m), baja 11h34 (0,24 m), alta 18h01 (2,36 m), baja 23h59 (0,25 m). Marea de hoy y de los próximos 7 días en Praia do Cajueiro, en Touros: horarios, alturas, curva del día y fase lunar. |
| /explore/mares/marco | description | Maré de hoje: alta 5h47 (2,57 m), baixa 12h01 (0,23 m), alta 17h59 (2,53 m). Maré de hoje e dos próximos 7 dias na Praia do Marco, em Pedra Grande: horários, alturas, curva do dia e fase da lua. | Maré de hoje: baixa 0h21 (0,11 m), alta 6h23 (2,41 m), baixa 12h44 (0,24 m), alta 18h34 (2,37 m). Maré de hoje e dos próximos 7 dias na Praia do Marco, em Pedra Grande: horários, alturas, curva do dia e fase da lua. |
| /en/explore/mares/marco | description | Today's tide: high 5h47 (2.57 m), low 12h01 (0.23 m), high 17h59 (2.53 m). Today's tide and the next 7 days at Praia do Marco, in Pedra Grande: times, heights, the day's curve and moon phase. | Today's tide: low 0h21 (0.11 m), high 6h23 (2.41 m), low 12h44 (0.24 m), high 18h34 (2.37 m). Today's tide and the next 7 days at Praia do Marco, in Pedra Grande: times, heights, the day's curve and moon phase. |
| /es/explore/mares/marco | description | Marea de hoy: alta 5h47 (2,57 m), baja 12h01 (0,23 m), alta 17h59 (2,53 m). Marea de hoy y de los próximos 7 días en Praia do Marco, en Pedra Grande: horarios, alturas, curva del día y fase lunar. | Marea de hoy: baja 0h21 (0,11 m), alta 6h23 (2,41 m), baja 12h44 (0,24 m), alta 18h34 (2,37 m). Marea de hoy y de los próximos 7 días en Praia do Marco, en Pedra Grande: horarios, alturas, curva del día y fase lunar. |

## Visual

140 screenshots comparados (390 e 1440 px). Iguais ao pixel: 12. Com diferenca: 128.
Diferenca vem tambem de conteudo que muda sozinho (mare de agora, eventos, ordem vinda do banco). Os mapas de diferenca ficam em qa\velocidade-2026-09\execucoes\local-next-start\screenshots-diff.

| pagina | largura | % pixels diferentes | altura antes | altura depois |
|---|---|---|---|---|
| /en | 390 | 20.243 | 6780 | 6816 |
| / | 390 | 19.811 | 6960 | 6996 |
| /es | 390 | 19.788 | 6986 | 7022 |
| /en/explore | 390 | 6.466 | 3052 | 3088 |
| /es/explore | 390 | 6.369 | 3232 | 3268 |
| /explore | 390 | 6.299 | 3232 | 3268 |
| /en/blog | 390 | 2.444 | 8833 | 8833 |
| /blog | 390 | 2.393 | 9014 | 9014 |
| /es/blog | 390 | 2.391 | 9014 | 9014 |
| /en/blog | 1440 | 1.569 | 3694 | 3694 |
| /blog | 1440 | 1.563 | 3694 | 3694 |
| /es/blog | 1440 | 1.563 | 3694 | 3694 |
| /en/explore/mares/cardeiro | 1440 | 1.43 | 2758 | 2762 |
| /en/explore/mares/cardeiro | 390 | 1 | 3219 | 3219 |
| /es/explore/mares/cardeiro | 390 | 0.985 | 3137 | 3137 |
| /explore/mares/cardeiro | 390 | 0.975 | 3137 | 3137 |
| /blog/transfer-aeroporto-natal-sao-miguel-gostoso | 390 | 0.932 | 12703 | 12703 |
| /explore/mares/xepa | 390 | 0.8 | 3125 | 3125 |
| /en/explore/mares | 390 | 0.514 | 4137 | 4137 |
| /explore/mares/xepa | 1440 | 0.514 | 2719 | 2719 |
| /es/explore/mares | 390 | 0.484 | 4297 | 4297 |
| /explore/mares | 390 | 0.479 | 4297 | 4297 |
| /es/explore/mares/cardeiro | 1440 | 0.465 | 2758 | 2758 |
| /explore/mares/cardeiro | 1440 | 0.464 | 2758 | 2758 |
| /explore/mares | 1440 | 0.3 | 3764 | 3764 |
| /es/explore/mares | 1440 | 0.3 | 3764 | 3764 |
| / | 1440 | 0.239 | 5222 | 5222 |
| /es | 1440 | 0.239 | 5222 | 5222 |
| /en | 1440 | 0.234 | 5198 | 5198 |
| /en/explore/mares | 1440 | 0.223 | 3695 | 3695 |
| /blog/transfer-aeroporto-natal-sao-miguel-gostoso | 1440 | 0.219 | 9566 | 9566 |
| /nao-existe-kan-463 | 390 | 0.14 | 844 | 844 |
| /en/explore | 1440 | 0.132 | 1827 | 1827 |
| /es/explore | 1440 | 0.124 | 1827 | 1827 |
| /explore | 1440 | 0.122 | 1827 | 1827 |
| /bio | 390 | 0.096 | 1324 | 1324 |
| /en/bio | 390 | 0.092 | 1353 | 1353 |
| /es/bio | 390 | 0.09 | 1414 | 1414 |
| /en/blog/kitesurf-sao-miguel-do-gostoso | 390 | 0.065 | 5156 | 5156 |
| /es/blog/kitesurf-sao-miguel-do-gostoso | 390 | 0.065 | 5316 | 5316 |
| /blog/kitesurf-sao-miguel-do-gostoso | 390 | 0.063 | 5316 | 5316 |
| /transfer | 390 | 0.054 | 2008 | 2008 |
| /en/transfer | 390 | 0.051 | 1848 | 1848 |
| /es/transfer | 390 | 0.051 | 2008 | 2008 |
| /blog/kitesurf-sao-miguel-do-gostoso | 1440 | 0.043 | 3962 | 3962 |
| /en/blog/kitesurf-sao-miguel-do-gostoso | 1440 | 0.043 | 3962 | 3962 |
| /es/blog/kitesurf-sao-miguel-do-gostoso | 1440 | 0.043 | 3962 | 3962 |
| /nao-existe-kan-463 | 1440 | 0.036 | 900 | 900 |
| /bio | 1440 | 0.026 | 1308 | 1308 |
| /en/bio | 1440 | 0.026 | 1308 | 1308 |
| /es/bio | 1440 | 0.026 | 1308 | 1308 |
| /en/explore/mapa | 1440 | 0.025 | 3287 | 3287 |
| /fique | 390 | 0.022 | 41827 | 41827 |
| /es/fique | 390 | 0.022 | 41856 | 41856 |
| /transfer | 1440 | 0.022 | 1441 | 1441 |
| /en/fique | 390 | 0.021 | 41625 | 41625 |
| /es/transfer | 1440 | 0.021 | 1441 | 1441 |
| /explore/mapa | 390 | 0.02 | 4379 | 4379 |
| /es/explore/mapa | 390 | 0.02 | 4447 | 4447 |
| /en/transfer | 1440 | 0.019 | 1441 | 1441 |
| /passeie | 1440 | 0.017 | 7574 | 7574 |
| /en/passeie | 1440 | 0.017 | 7574 | 7574 |
| /es/passeie | 1440 | 0.017 | 7574 | 7574 |
| /cadastre | 390 | 0.012 | 891 | 891 |
| /fique | 1440 | 0.011 | 15036 | 15036 |
| /en/fique | 1440 | 0.011 | 15036 | 15036 |
| /es/fique | 1440 | 0.011 | 15036 | 15036 |
| /explore/mapa | 1440 | 0.011 | 3389 | 3389 |
| /es/explore/mapa | 1440 | 0.011 | 3389 | 3389 |
| /passeie | 390 | 0.01 | 20415 | 20415 |
| /en/passeie | 390 | 0.01 | 20213 | 20213 |
| /es/passeie | 390 | 0.01 | 20415 | 20415 |
| /conheca | 390 | 0.008 | 4597 | 4597 |
| /en/conheca | 390 | 0.008 | 4416 | 4416 |
| /es/conheca | 390 | 0.007 | 4680 | 4680 |
| /contrate | 390 | 0.007 | 2726 | 2726 |
| /es/sobre | 390 | 0.007 | 11329 | 11329 |
| /contrate/pedreiro-reforma | 390 | 0.006 | 2471 | 2471 |
| /contrate/eletrica | 390 | 0.006 | 2451 | 2451 |
| /participe | 390 | 0.005 | 2449 | 2449 |
| /en/participe | 390 | 0.005 | 2289 | 2289 |
| /es/participe | 390 | 0.005 | 2449 | 2449 |
| /sobre | 390 | 0.005 | 11304 | 11304 |
| /en/transparencia | 390 | 0.004 | 6232 | 6232 |
| /en/come | 1440 | 0.004 | 9901 | 9901 |
| /es/sobre | 1440 | 0.004 | 7075 | 7075 |
| /come | 390 | 0.003 | 27261 | 27261 |
| /en/come | 390 | 0.003 | 27059 | 27059 |
| /es/come | 390 | 0.003 | 27261 | 27261 |
| /en/explore/mapa | 390 | 0.003 | 3971 | 3971 |
| /apoie | 390 | 0.003 | 6154 | 6154 |
| /en/apoie | 390 | 0.003 | 5921 | 5921 |
| /es/apoie | 390 | 0.003 | 6239 | 6239 |
| /es/contrate | 390 | 0.003 | 2746 | 2746 |
| /en/sobre | 390 | 0.003 | 10771 | 10771 |
| /es/negocio/dr-wind | 390 | 0.003 | 3036 | 3036 |
| /come | 1440 | 0.003 | 9901 | 9901 |
| /es/come | 1440 | 0.003 | 9901 | 9901 |
| /conheca | 1440 | 0.003 | 3211 | 3211 |
| /en/conheca | 1440 | 0.003 | 3133 | 3133 |
| /es/conheca | 1440 | 0.003 | 3237 | 3237 |
| /sobre | 1440 | 0.003 | 7030 | 7030 |
| /cadastre | 1440 | 0.003 | 900 | 900 |
| /en/contrate | 390 | 0.002 | 2604 | 2604 |
| /negocio/dr-wind | 390 | 0.002 | 3064 | 3064 |
| /negocio/positano-restaurante | 390 | 0.002 | 2814 | 2814 |
| /contrate | 1440 | 0.002 | 1611 | 1611 |
| /en/contrate | 1440 | 0.002 | 1611 | 1611 |
| /es/contrate | 1440 | 0.002 | 1611 | 1611 |
| /en/sobre | 1440 | 0.002 | 7075 | 7075 |
| /contrate/pedreiro-reforma | 1440 | 0.002 | 1692 | 1692 |
| /contrate/eletrica | 1440 | 0.002 | 1692 | 1692 |
| /en/contrate/pedreiro-reforma | 1440 | 0.002 | 1692 | 1692 |
| /es/contrate/pedreiro-reforma | 1440 | 0.002 | 1692 | 1692 |
| /transparencia | 390 | 0.001 | 6494 | 6494 |
| /es/transparencia | 390 | 0.001 | 6552 | 6552 |
| /es/contrate/pedreiro-reforma | 390 | 0.001 | 2489 | 2489 |
| /en/negocio/dr-wind | 390 | 0.001 | 2876 | 2876 |
| /participe | 1440 | 0.001 | 1234 | 1234 |
| /en/participe | 1440 | 0.001 | 1234 | 1234 |
| /es/participe | 1440 | 0.001 | 1234 | 1234 |
| /apoie | 1440 | 0.001 | 4758 | 4758 |
| /en/apoie | 1440 | 0.001 | 4758 | 4758 |
| /es/apoie | 1440 | 0.001 | 4722 | 4722 |
| /en/transparencia | 1440 | 0.001 | 5031 | 5031 |
| /negocio/dr-wind | 1440 | 0.001 | 2127 | 2127 |
| /negocio/positano-restaurante | 1440 | 0.001 | 1855 | 1855 |
| /es/negocio/dr-wind | 1440 | 0.001 | 2127 | 2127 |

## Fumaca (Playwright)

Passou: 26. Falhou: 0. Instavel (passou na segunda tentativa): 0. Pulado: 0.

- ok: rastreio > home carrega o gtag, manda consent default e o page_view do GA4
- ok: rastreio > aceitar cookies manda consent update
- ok: rastreio > navegacao no cliente manda outro page_view (PageViewTracker)
- ok: cabecalho, menu e idioma > menu do desktop leva aos modulos
- ok: cabecalho, menu e idioma > menu do celular abre a gaveta com os links
- ok: cabecalho, menu e idioma > troca de idioma: /en e /es servem o idioma certo no HTML
- ok: cabecalho, menu e idioma > seletor de idioma leva a /en
- ok: cabecalho, menu e idioma > busca abre e acha negocio
- ok: cabecalho, menu e idioma > tema escuro alterna
- ok: WhatsApp > botao oficial do cabecalho: numero certo, mensagem e evento whatsapp_click
- ok: WhatsApp > pagina de negocio: link de WhatsApp e evento contato_negocio_click
- ok: listas, filtros e mapa > /come lista negocios no HTML servido
- ok: listas, filtros e mapa > /fique lista negocios no HTML servido
- ok: listas, filtros e mapa > /passeie lista negocios no HTML servido
- ok: listas, filtros e mapa > filtro de /come muda a lista
- ok: listas, filtros e mapa > mapa Mapbox desenha e a lista de pontos existe
- ok: listas, filtros e mapa > explore e mares mostram a tabua
- ok: home > vitrine com numeros e setas no celular
- ok: formularios (envio interceptado) > transfer: validacao e payload do cadastro
- ok: formularios (envio interceptado) > participe: formulario de evento envia payload certo (interceptado)
- ok: formularios (envio interceptado) > contrate: formulario de servico valida campos obrigatorios
- ok: apoie e checkout > doacao chega ate o Stripe com o valor certo (interceptado)
- ok: area restrita > /cadastre mostra a tela de login, sem credencial
- ok: area restrita > /cadastre/admin sem sessao nao mostra o painel
- ok: blog e bio > blog lista posts e o post abre com JSON-LD
- ok: blog e bio > /bio: noindex e UTM em todo link interno

Nenhum teste que passava na linha de base deixou de passar.

