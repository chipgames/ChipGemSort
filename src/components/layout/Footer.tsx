import React, { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSelector from "@/components/ui/LanguageSelector";
import "./Footer.css";

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <nav className="footer-links" aria-label={t("footer.navigation")}>
            <button
              type="button"
              className="footer-link"
              onClick={() => setShowPrivacy(true)}
            >
              {t("footer.privacyPolicy")}
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => setShowContact(true)}
            >
              {t("footer.contactUs")}
            </button>
          </nav>
          <div className="footer-center">
            <LanguageSelector />
          </div>
          <div className="footer-copyright">{t("footer.copyright")}</div>
        </div>
      </footer>
      {(showPrivacy || showContact) && (
        <div
          className="footer-modal-overlay"
          onClick={() => {
            setShowPrivacy(false);
            setShowContact(false);
          }}
        >
          <div className="footer-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {showPrivacy ? t("footer.privacyPolicy") : t("footer.contactUs")}
            </h3>
            <p>
              {showPrivacy
                ? "개인정보는 로컬에만 저장되며 서버로 전송되지 않습니다."
                : "문의: ChipGames"}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowPrivacy(false);
                setShowContact(false);
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
