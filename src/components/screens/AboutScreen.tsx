import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import "./AboutScreen.css";

interface AboutScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  const { t, tArray } = useLanguage();

  const featuresList = tArray("about.featuresList");
  const version = import.meta.env.VITE_APP_VERSION || "1.0.0";

  return (
    <div className="about-screen">
      <h2 className="about-title">{t("about.title")}</h2>
      <p className="about-description">{t("about.description")}</p>

      <section className="about-section">
        <h3 className="about-section-title">{t("about.features")}</h3>
        <ul className="about-list">
          {featuresList.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h3 className="about-section-title">{t("about.howToPlay")}</h3>
        <p className="about-section-text">{t("about.howToPlayText")}</p>
      </section>

      <section className="about-section">
        <h3 className="about-section-title">{t("about.developer")}</h3>
        <p className="about-section-text">{t("about.developerText")}</p>
      </section>

      <section className="about-section">
        <h3 className="about-section-title">{t("about.version")}</h3>
        <p className="about-section-text">{version}</p>
      </section>

      <section className="about-section">
        <h3 className="about-section-title">{t("about.credits")}</h3>
        <p className="about-section-text">{t("about.creditsText")}</p>
      </section>

      <section className="about-section">
        <h3 className="about-section-title">{t("about.contact")}</h3>
        <p className="about-section-text">{t("about.contactText")}</p>
      </section>

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
