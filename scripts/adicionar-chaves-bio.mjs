/* Acrescenta as chaves da /bio nos tres locales, sem reescrever o resto do arquivo.
 *
 *  Script de uso unico, mantido no repo porque a proxima pessoa que precisar mexer
 *  nas chaves da /bio vai querer ver exatamente o que entrou e em que ordem. Rode
 *  com `node scripts/adicionar-chaves-bio.mjs`; ele e idempotente. */

import { readFileSync, writeFileSync } from 'node:fs'

const NOVAS = {
  pt: {
    save: 'Salvar contato',
    save_hint: 'Abre a agenda preenchida',
    whatsapp: 'Falar no WhatsApp',
    whatsapp_msg: 'Olá! Peguei o contato pela etiqueta do Vive Gostoso e queria uma informação.',
    call: 'ou ligue:',
    come_sub: 'Restaurantes e gastronomia',
    fique_sub: 'Pousadas e hospedagem',
    passeie_sub: 'Passeios e esportes',
    explore_sub: 'Mapa interativo',
    participe_sub: 'Eventos e festivais',
    conheca_sub: 'A cidade e as praias',
    contrate_sub: 'Serviços e vagas',
    apoie_sub: 'Fundo público',
    role: 'Guia de São Miguel do Gostoso',
    page_title: 'Vive Gostoso | Contato',
    page_description:
      'Guia de São Miguel do Gostoso. Salve o contato, fale no WhatsApp e veja onde comer, ficar e passear.',
  },
  en: {
    save: 'Save contact',
    save_hint: 'Opens your phone book filled in',
    whatsapp: 'Talk on WhatsApp',
    whatsapp_msg: 'Hi! I got this contact from the Vive Gostoso tag and I have a question.',
    call: 'or call:',
    come_sub: 'Restaurants and food',
    fique_sub: 'Inns and lodging',
    passeie_sub: 'Tours and sports',
    explore_sub: 'Interactive map',
    participe_sub: 'Events and festivals',
    conheca_sub: 'The town and the beaches',
    contrate_sub: 'Services and jobs',
    apoie_sub: 'Public fund',
    role: 'Guide to São Miguel do Gostoso',
    page_title: 'Vive Gostoso | Contact',
    page_description:
      'Guide to São Miguel do Gostoso. Save the contact, talk on WhatsApp and see where to eat, stay and go.',
  },
  es: {
    save: 'Guardar contacto',
    save_hint: 'Abre la agenda ya rellenada',
    whatsapp: 'Hablar por WhatsApp',
    whatsapp_msg: '¡Hola! Tomé el contacto por la etiqueta de Vive Gostoso y tengo una pregunta.',
    call: 'o llama:',
    come_sub: 'Restaurantes y gastronomía',
    fique_sub: 'Posadas y alojamiento',
    passeie_sub: 'Paseos y deportes',
    explore_sub: 'Mapa interactivo',
    participe_sub: 'Eventos y festivales',
    conheca_sub: 'La ciudad y las playas',
    contrate_sub: 'Servicios y vacantes',
    apoie_sub: 'Fondo público',
    role: 'Guía de São Miguel do Gostoso',
    page_title: 'Vive Gostoso | Contacto',
    page_description:
      'Guía de São Miguel do Gostoso. Guarda el contacto, habla por WhatsApp y mira dónde comer, quedarte y pasear.',
  },
}

for (const [locale, chaves] of Object.entries(NOVAS)) {
  const caminho = `src/locales/${locale}.json`
  const json = JSON.parse(readFileSync(caminho, 'utf8'))
  json.bio = { ...json.bio, ...chaves }
  writeFileSync(caminho, `${JSON.stringify(json, null, 2)}\n`)
  console.log(`${caminho}: ${Object.keys(chaves).length} chaves em bio`)
}
