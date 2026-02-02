import { useState, useEffect } from "react";
import { LanguageService } from "@/services/LanguageService";
import type { SupportedLanguage } from "@/constants/languages";

const cache: Record<string, Record<string, unknown>> = {};

export const useLanguage = () => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() =>
    new LanguageService().getCurrentLanguage()
  );
  const [translations, setTranslations] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (cache[language]) {
          setTranslations(cache[language]);
          setIsLoading(false);
          return;
        }
        const mod = await import(`../locales/${language}.json`);
        cache[language] = mod.default as Record<string, unknown>;
        setTranslations(mod.default as Record<string, unknown>);
      } catch {
        try {
          const fallback = await import(`../locales/en.json`);
          setTranslations(fallback.default as Record<string, unknown>);
        } catch {
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const handler = (e: CustomEvent<string>) =>
      setLanguageState(e.detail as SupportedLanguage);
    window.addEventListener("languageChanged", handler as EventListener);
    return () =>
      window.removeEventListener("languageChanged", handler as EventListener);
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    new LanguageService().setLanguage(lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (isLoading || !translations) return key;
    const keys = key.split(".");
    let v: unknown = translations;
    for (const k of keys) {
      v = (v as Record<string, unknown>)?.[k];
      if (v === undefined) break;
    }
    return typeof v === "string" ? v : key;
  };

  return { language, setLanguage, t, isLoading };
};
