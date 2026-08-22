'use client';

import { useLocale } from '@/contexts/LocaleContext';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  const next = locale === 'es' ? 'en' : 'es';
  const label = locale === 'es' ? 'EN' : 'ES';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={`Switch to ${next === 'es' ? 'Spanish' : 'English'}`}
      className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full bg-white border border-black/[0.08] shadow-lg shadow-black/[0.08] flex items-center justify-center text-xs font-bold text-[#1a1a1a]/60 hover:text-[#1B3A32] hover:border-[#1B3A32]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none"
    >
      {label}
    </button>
  );
}
