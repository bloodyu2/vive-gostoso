import type { Idioma } from '@/data/praias-mares'
import type { MareDoDia } from './semana'
import { somarDias } from './tempo'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const T = { pt: pt.mares, en: en.mares, es: es.mares }

/* Listas fixas e nao Intl: o ICU do Node e o do navegador abreviam diferente
   ("ter." x "ter"), e texto que muda entre servidor e cliente quebra a
   hidratacao. */
const DIAS: Record<Idioma, string[]> = {
  pt: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
}

export function formatarAltura(metros: number, lang: Idioma): string {
  const n = metros.toFixed(2)
  return `${lang === 'en' ? n : n.replace('.', ',')} m`
}

export function rotuloDoDia(data: string, hoje: string, lang: Idioma): { nome: string; data: string } {
  const [, mes, dia] = data.split('-').map(Number)
  const curta = lang === 'en' ? `${mes}/${dia}` : `${dia}/${mes}`
  if (data === hoje) return { nome: T[lang].hoje, data: curta }
  if (data === somarDias(hoje, 1)) return { nome: T[lang].amanha, data: curta }
  const semana = new Date(`${data}T12:00:00Z`).getUTCDay()
  return { nome: DIAS[lang][semana], data: curta }
}

export function resumoDoDia(eventos: MareDoDia[], lang: Idioma): string | null {
  if (eventos.length === 0) return null
  return eventos
    .map((e) => {
      const tipo = (e.tipo === 'alta' ? T[lang].alta_curta : T[lang].baixa_curta).toLowerCase()
      return `${tipo} ${e.hora} (${formatarAltura(e.altura, lang)})`
    })
    .join(', ')
}
