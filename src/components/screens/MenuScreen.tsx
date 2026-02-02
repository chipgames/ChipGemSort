import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import "./MenuScreen.css";

interface MenuScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="menu-screen">
      <div className="menu-content">
        <h1 className="menu-title">{t("menu.title")}</h1>
        <p className="menu-subtitle">{t("menu.subtitle")}</p>
        <div className="menu-buttons">
          <button
            type="button"
            className="menu-button primary"
            onClick={() => onNavigate("stageSelect")}
          >
            {t("menu.playGame")}
          </button>
          <button
            type="button"
            className="menu-button"
            onClick={() => onNavigate("guide")}
          >
            {t("menu.guide")}
          </button>
          <button
            type="button"
            className="menu-button"
            onClick={() => onNavigate("help")}
          >
            {t("menu.help")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;
