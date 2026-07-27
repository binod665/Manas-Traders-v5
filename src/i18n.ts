import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import neTranslation from './locales/ne.json';

const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('manas_traders_lang');
  if (saved === 'en' || saved === 'ne') {
    return saved;
  }
  return 'ne';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ne: {
        translation: neTranslation,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'ne',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'manas_traders_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
