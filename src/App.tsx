import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GameContainer from "@/components/layout/GameContainer";
import GameBoard from "@/components/game/GameBoard";
import SEOHead from "@/components/seo/SEOHead";
import type { GameScreen } from "@/types/ui";
import { useTheme } from "@/hooks/useTheme";
import { setupAdObserver, preventAdSenseErrors } from "@/utils/adsense";
import { registerServiceWorker } from "@/utils/serviceWorker";
import "@/styles/App.css";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("stageSelect");
  const [currentStage, setCurrentStage] = useState<number | null>(null);
  const [isUIHidden, setIsUIHidden] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chipGemSort_uiHidden") === "true";
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth <= 768 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  });

  useTheme();

  useEffect(() => {
    const isDev =
      typeof import.meta !== "undefined" &&
      (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost");
    if (!isDev && !isLocalhost) {
      preventAdSenseErrors();
      setupAdObserver();
      const script = document.createElement("script");
      script.async = true;
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2533613198240039";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0
      );
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const toggleUI = () => {
    const next = !isUIHidden;
    setIsUIHidden(next);
    localStorage.setItem("chipGemSort_uiHidden", String(next));
  };

  return (
    <ErrorBoundary>
      <SEOHead />
      <div className="app-container">
        {!isUIHidden && (
          <Header onNavigate={setCurrentScreen} currentScreen={currentScreen} />
        )}
        <GameContainer>
          <GameBoard
            currentScreen={currentScreen}
            currentStage={currentStage}
            onNavigate={setCurrentScreen}
            onStartStage={(n) => {
              setCurrentStage(n);
              setCurrentScreen("game");
            }}
          />
        </GameContainer>
        {!isUIHidden && <Footer />}
        {isMobile && (
          <button
            type="button"
            className="ui-toggle-button"
            onClick={toggleUI}
            aria-label={isUIHidden ? "UI 표시" : "UI 숨김"}
            title={isUIHidden ? "메뉴 표시" : "메뉴 숨김"}
          >
            {isUIHidden ? "👁️" : "🙈"}
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
