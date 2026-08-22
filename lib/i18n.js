import es from '@/app/locales/es.json';
import en from '@/app/locales/en.json';

const dictionaries = { es, en };

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries.es;
}
