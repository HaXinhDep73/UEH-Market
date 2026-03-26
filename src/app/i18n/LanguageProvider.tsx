import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang } from './i18n';

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  const saved = localStorage.getItem('ueh_lang');
  if (saved === 'en' || saved === 'vi') return saved;
  const browser = (navigator.language ?? '').toLowerCase();
  return browser.startsWith('vi') ? 'vi' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getInitialLang());

  useEffect(() => {
    localStorage.setItem('ueh_lang', lang);
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === 'vi' ? 'en' : 'vi'));

  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

