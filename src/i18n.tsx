import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from './locales/ru/translation.json';
import en from './locales/en/translation.json';
import cn from './locales/cn/translation.json';
import React from "react";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    en: {
        translation: en
    },
    ru: {
        translation: ru
    },
    cn: {
        translation: cn
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en",
        fallbackLng: ['en'],
        whitelist: ['en', 'ru', 'cn'],
        detection: {
            order: ['localStorage'],
            lookupFromPathIndex: 0,
            lookupLocalStorage: 'lang',
        },

        keySeparator: '::',
        nsSeparator: false,

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
