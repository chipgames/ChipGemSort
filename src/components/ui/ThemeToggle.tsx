import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import "./ThemeToggle.css";

const ThemeToggle: React.FC = () => {
  const { toggleTheme, isLight } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title={isLight ? t("header.darkMode") : t("header.lightMode")}
      aria-label={isLight ? t("header.darkMode") : t("header.lightMode")}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;
