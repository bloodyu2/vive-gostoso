import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import pt from './locales/pt.json'
import en from './locales/en.json'
import es from './locales/es.json'

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
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    lng: 'pt',
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
