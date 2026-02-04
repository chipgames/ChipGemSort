import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import "./GuideScreen.css";

interface GuideScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const GuideScreen: React.FC<GuideScreenProps> = ({ onNavigate }) => {
  const { t, tArray } = useLanguage();

  const rulesList = tArray("guide.rulesList");
  const tipsList = tArray("guide.tipsList");

  return (
    <div className="guide-screen">
      <h2 className="guide-title">{t("guide.title")}</h2>
      <p className="guide-description">{t("guide.description")}</p>

      <section className="guide-section">
        <h3 className="guide-section-title">{t("guide.objective")}</h3>
        <p className="guide-section-text">{t("guide.objectiveText")}</p>
      </section>

      <section className="guide-section">
        <h3 className="guide-section-title">{t("guide.rules")}</h3>
        <ul className="guide-list">
          {rulesList.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="guide-section">
        <h3 className="guide-section-title">{t("guide.steps")}</h3>
        <ol className="guide-steps">
          <li>{t("guide.step1")}</li>
          <li>{t("guide.step2")}</li>
          <li>{t("guide.step3")}</li>
          <li>{t("guide.step4")}</li>
        </ol>
      </section>

      <section className="guide-section">
        <h3 className="guide-section-title">{t("guide.tips")}</h3>
        <ul className="guide-list guide-tips">
          {tipsList.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="guide-back"
        onClick={() => onNavigate("stageSelect")}
      >
        {t("game.back")}
      </button>
    </div>
  );
};

export default GuideScreen;
