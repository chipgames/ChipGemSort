import type { SupportedLanguage } from "@/constants/languages";

const STORAGE_KEY = "chipGemSort_language";
const SUPPORTED: SupportedLanguage[] = ["ko", "en", "ja", "zh"];

export class LanguageService {
  getCurrentLanguage(): SupportedLanguage {
    if (typeof window === "undefined") return "ko";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved as SupportedLanguage))
      return saved as SupportedLanguage;
    const browser = navigator.language?.slice(0, 2) || "en";
    if (SUPPORTED.includes(browser as SupportedLanguage))
      return browser as SupportedLanguage;
    return "ko";
  }

  setLanguage(lang: SupportedLanguage): void {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
  }
}
