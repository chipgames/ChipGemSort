import { useState, useEffect, useCallback } from "react";
import { storageManager } from "@/utils/storage";

export type Theme = "light" | "dark";
const THEME_KEY = "chipGemSort_theme";

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta)
    meta.setAttribute("content", theme === "light" ? "#f5f5f8" : "#1a1a2e");
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = storageManager.get<Theme>(THEME_KEY, {
      fallback: null,
      silent: true,
    });
    if (saved === "light" || saved === "dark") return saved;
    return getSystemTheme();
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      storageManager.set(THEME_KEY, next, { silent: true });
      applyTheme(next);
      return next;
    });
  }, []);

  const setThemeValue = useCallback((t: Theme) => {
    setTheme(t);
    storageManager.set(THEME_KEY, t, { silent: true });
    applyTheme(t);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    isLight: theme === "light",
    isDark: theme === "dark",
  };
};
