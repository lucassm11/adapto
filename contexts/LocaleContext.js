'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getDictionary } from '@/lib/i18n';

const LocaleContext = createContext({
  locale: 'es',
  t: getDictionary('es'),
  setLocale: () => {},
});

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState('es');
  const [t, setT] = useState(getDictionary('es'));

  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((c) => c.startsWith('NEXT_LOCALE='));
    if (stored) {
      const value = stored.split('=')[1];
      if (value && (value === 'es' || value === 'en')) {
        setLocaleState(value);
        setT(getDictionary(value));
      }
    }
  }, []);

  const setLocale = (newLocale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
    setLocaleState(newLocale);
    setT(getDictionary(newLocale));
  };

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
