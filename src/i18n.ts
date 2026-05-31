import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import pt from './locales/pt.json'
import en from './locales/en.json'
import es from './locales/es.json'

const ns = [
  'cadastro', 'auth', 'painel', 'meus_negocios', 'perfil', 'preview',
  'claim', 'professional_panel', 'admin',
  'admin_businesses', 'admin_professionals', 'admin_services', 'admin_jobs',
  'admin_events', 'admin_claims', 'admin_transfers', 'admin_reviews',
  'cookie', 'whatsapp',
  'parceiros', 'reivindicar', 'bio',
  'service_form', 'job_form', 'review_form', 'review_list', 'share', 'lightbox',
  'fund', 'event_submit', 'event_card', 'hoje', 'global_search',
] as const

/**
 * i18next is initialised with PT as the default language.
 * The actual language is set at runtime by the LocaleSync component,
 * which reads the URL prefix (/en/*, /es/*) and calls i18n.changeLanguage().
 * No localStorage or navigator detection — the URL is the source of truth.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt, ...Object.fromEntries(ns.map(n => [n, (pt as any)[n]])) },
      en: { translation: en, ...Object.fromEntries(ns.map(n => [n, (en as any)[n]])) },
      es: { translation: es, ...Object.fromEntries(ns.map(n => [n, (es as any)[n]])) },
    },
    lng: 'pt',
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
