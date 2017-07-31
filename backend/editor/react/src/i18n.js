import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';


i18n
  .use(XHR)
  .use(LanguageDetector)
  .init({
    detection: {
        order: ['navigator'],
    },
    fallbackLng: 'en',
    nsSeparator: '::',
    keySeparator: ':::',

    backend: {
        loadPath: 'static/locales/{{lng}}/{{ns}}.json'
    },

    // have a common namespace used around the full app
    ns: ['common'],
    defaultNS: 'common',

    debug: false,

    interpolation: {
      escapeValue: false // not needed for react!!
    }
  });


export default i18n;
