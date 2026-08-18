import listToKeyMap from '@/helpers/list/listToKeyMap';

export const languages = [
  {
    languageId: 'ar',
    name: 'العربية',
    countryCode: 'sa',
  },
  {
    languageId: 'cs',
    name: 'Čeština',
    countryCode: 'cz',
  },
  {
    languageId: 'sr',
    name: 'Cрпски',
    countryCode: 'rs',
  },
  {
    languageId: 'da',
    name: 'Dansk',
    countryCode: 'dk',
  },
  {
    languageId: 'de',
    name: 'Deutsch',
    countryCode: 'de',
  },
  {
    languageId: 'et',
    name: 'Eesti',
    countryCode: 'ee',
  },
  {
    languageId: 'en',
    name: 'English',
    countryCode: 'gb',
  },
  {
    languageId: 'es',
    name: 'Español',
    countryCode: 'es',
  },
  {
    languageId: 'fr',
    name: 'Français',
    countryCode: 'fr',
  },
  {
    languageId: 'hr',
    name: 'Hrvatski',
    countryCode: 'hr',
  },
  {
    languageId: 'it',
    name: 'Italiano',
    countryCode: 'it',
  },
  {
    languageId: 'lv',
    name: 'Latviešu',
    countryCode: 'lv',
  },
  {
    languageId: 'lt',
    name: 'Lietuvių',
    countryCode: 'lt',
  },
  {
    languageId: 'hu',
    name: 'Magyar nyelv',
    countryCode: 'hu',
  },
  {
    languageId: 'nl',
    name: 'Nederlands',
    countryCode: 'nl',
  },
  {
    languageId: 'no',
    name: 'Norsk',
    countryCode: 'no',
  },
  {
    languageId: 'pl',
    name: 'Polski',
    countryCode: 'pl',
  },
  {
    languageId: 'pt',
    name: 'Português',
    countryCode: 'pt',
  },
  {
    languageId: 'ru',
    name: 'Pусский',
    countryCode: 'ru',
  },
  {
    languageId: 'ro',
    name: 'Română',
    countryCode: 'ro',
  },
  {
    languageId: 'sq',
    name: 'Shqip',
    countryCode: 'al',
  },
  {
    languageId: 'fi',
    name: 'Suomi',
    countryCode: 'fi',
  },
  {
    languageId: 'sv',
    name: 'Svenska',
    countryCode: 'se',
  },
  {
    languageId: 'tr',
    name: 'Türkçe',
    countryCode: 'tr',
  },
  {
    languageId: 'vi',
    name: 'Việt Nam',
    countryCode: 'vn',
  },
  {
    languageId: 'uk',
    name: 'Yкраїнська',
    countryCode: 'ua',
  },
  {
    languageId: 'el',
    name: 'ελληνικά',
    countryCode: 'gr',
  },
  {
    languageId: 'bg',
    name: 'България',
    countryCode: 'bg',
  },
  {
    languageId: 'he',
    name: 'עִברִית',
    countryCode: 'il',
  },
  {
    languageId: 'th',
    name: 'ไทย',
    countryCode: 'th',
  },
  {
    languageId: 'zh',
    name: '中文',
    countryCode: 'cn',
  },
];

export const languageMap = listToKeyMap(languages, 'languageId');
