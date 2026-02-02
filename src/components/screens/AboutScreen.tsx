import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import "./AboutScreen.css";

interface AboutScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="about-screen">
      <h2 className="about-title">{t("about.title")}</h2>
      <p className="about-description">{t("about.description")}</p>
      <button
        type="button"
        className="about-back"
        onClick={() => onNavigate("stageSelect")}
      >
        {t("game.back")}
      </button>
    </div>
  );
};

export default AboutScreen;
