import type { IdiomaBlog } from './traducoes'

/** Textos da capa do post da tabua de mares (rota /api/og/blog-mares). */
const TEXTOS: Record<IdiomaBlog, { titulo: string; subtitulo: string }> = {
  pt: { titulo: 'Tábua de marés de São Miguel do Gostoso', subtitulo: 'A maré de hoje, praia por praia' },
  es: { titulo: 'Tabla de mareas de São Miguel do Gostoso', subtitulo: 'La marea de hoy, playa por playa' },
  en: { titulo: 'São Miguel do Gostoso tide table', subtitulo: "Today's tide, beach by beach" },
}

export function textosCapaMares(lang: IdiomaBlog): { titulo: string; subtitulo: string } {
  return TEXTOS[lang]
}
