import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import "./HelpScreen.css";

interface HelpScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="help-screen">
      <h2 className="help-title">{t("help.title")}</h2>
      <p className="help-description">{t("help.description")}</p>
      <button
        type="button"
        className="help-back"
        onClick={() => onNavigate("stageSelect")}
      >
        {t("game.back")}
      </button>
    </div>
  );
};

export default HelpScreen;
