import React, { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import "./HelpScreen.css";

interface HelpScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onNavigate }) => {
  const { t, tObject } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqRaw = tObject<FAQItem[]>("help.faq");
  const faq: FAQItem[] = Array.isArray(faqRaw) ? faqRaw : [];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="help-screen">
      <h2 className="help-title">{t("help.title")}</h2>
      <p className="help-description">{t("help.description")}</p>

      {faq.length > 0 && (
        <div className="help-faq">
          {faq.map((item, index) => (
            <div key={index} className="help-faq-item">
              <button
                type="button"
                className="help-faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={expandedIndex === index}
              >
                <span>{item.question}</span>
                <span className="help-faq-icon">
                  {expandedIndex === index ? "−" : "+"}
                </span>
              </button>
              {expandedIndex === index && (
                <div className="help-faq-answer">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      )}

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
