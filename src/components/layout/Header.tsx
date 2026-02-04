import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import OrientationLock from "@/components/ui/OrientationLock";
import SoundToggle from "@/components/ui/SoundToggle";
import type { GameScreen } from "@/types/ui";
import "./Header.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface HeaderProps {
  onNavigate?: (screen: GameScreen) => void;
  currentScreen?: GameScreen;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      (window.navigator as { standalone?: boolean }).standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches
    );
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    deferredPrompt.userChoice.then(({ outcome }) => {
      if (outcome === "accepted") setDeferredPrompt(null);
    });
  };

  const nav = (screen: GameScreen) => {
    onNavigate?.(screen);
    setMobileMenuOpen(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <div
          className="header-logo"
          onClick={() => nav("stageSelect")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && nav("stageSelect")}
          aria-label={t("header.gameTitle")}
        >
          <img
            src={`${import.meta.env.BASE_URL}ChipGames_Logo.png`}
            alt={t("header.logo")}
            className="header-logo-img"
            decoding="async"
          />
          <span className="header-game-title">{t("header.gameTitle")}</span>
        </div>

        <nav className="header-nav" aria-label="Main navigation">
          <button
            type="button"
            className="header-nav-link"
            onClick={() => nav("stageSelect")}
          >
            {t("header.playGame")}
          </button>
          <button
            type="button"
            className="header-nav-link"
            onClick={() => nav("guide")}
          >
            {t("header.guide")}
          </button>
          <button
            type="button"
            className="header-nav-link"
            onClick={() => nav("help")}
          >
            {t("header.help")}
          </button>
          <button
            type="button"
            className="header-nav-link"
            onClick={() => nav("about")}
          >
            {t("header.about")}
          </button>
          {!isStandalone && deferredPrompt && (
            <button
              type="button"
              className="header-nav-link"
              onClick={handleInstall}
            >
              {t("header.installApp")}
            </button>
          )}
        </nav>

        <div className="header-actions">
          <OrientationLock />
          <SoundToggle />
          <ThemeToggle />
          <LanguageSelector />
        </div>

        <button
          type="button"
          className="header-hamburger"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="header-mobile-nav">
          <button type="button" onClick={() => nav("stageSelect")}>
            {t("header.playGame")}
          </button>
          <button type="button" onClick={() => nav("guide")}>
            {t("header.guide")}
          </button>
          <button type="button" onClick={() => nav("help")}>
            {t("header.help")}
          </button>
          <button type="button" onClick={() => nav("about")}>
            {t("header.about")}
          </button>
          {!isStandalone && deferredPrompt && (
            <button type="button" onClick={handleInstall}>
              {t("header.installApp")}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
