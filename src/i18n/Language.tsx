import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'zh' | 'en';
export const languageStorageKey = 'stupid-games.language.v1';
export function readLanguage(): Language | null {
  try { const saved = localStorage.getItem(languageStorageKey); return saved === 'zh' || saved === 'en' ? saved : null; }
  catch { return null; }
}
const LanguageContext = createContext<{
  language: Language; chosen: boolean; setLanguage: (language: Language) => void;
  t: (zh: string, en: string) => string;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(readLanguage);
  const language = saved ?? 'zh';
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'zh' ? '那些我在广告里看到的傻X小游戏。' : 'Playable versions of those little games from ads.');
  }, [language]);
  const setLanguage = (value: Language) => {
    setSaved(value);
    try { localStorage.setItem(languageStorageKey, value); } catch { /* Storage may be disabled; this visit still works. */ }
  };
  return <LanguageContext.Provider value={{ language, chosen: saved !== null, setLanguage, t: (zh, en) => language === 'zh' ? zh : en }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('LanguageProvider is required');
  return context;
}
