import React, { Suspense, lazy } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GameScreen } from "@/types/ui";
import StageSelectScreen from "@/components/screens/StageSelectScreen";
import SortGameScreen from "@/components/game/GameScreen";

const GuideScreenLazy = lazy(() => import("@/components/screens/GuideScreen"));
const HelpScreenLazy = lazy(() => import("@/components/screens/HelpScreen"));
const AboutScreenLazy = lazy(() => import("@/components/screens/AboutScreen"));

interface GameBoardProps {
  currentScreen: GameScreen;
  currentStage: number | null;
  onNavigate: (screen: GameScreen) => void;
  onStartStage: (stageNumber: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  currentScreen,
  currentStage,
  onNavigate,
  onStartStage,
}) => {
  const { t } = useLanguage();

  if (currentScreen === "guide") {
    return (
      <Suspense fallback={<div className="loading">{t("game.back")}...</div>}>
        <GuideScreenLazy onNavigate={onNavigate} />
      </Suspense>
    );
  }
  if (currentScreen === "help") {
    return (
      <Suspense fallback={<div className="loading">...</div>}>
        <HelpScreenLazy onNavigate={onNavigate} />
      </Suspense>
    );
  }
  if (currentScreen === "about") {
    return (
      <Suspense fallback={<div className="loading">...</div>}>
        <AboutScreenLazy onNavigate={onNavigate} />
      </Suspense>
    );
  }
  if (currentScreen === "game" && currentStage != null) {
    return (
      <SortGameScreen
        stageNumber={currentStage}
        onBack={() => onNavigate("stageSelect")}
        onNextStage={() => onStartStage(currentStage + 1)}
      />
    );
  }
  return (
    <StageSelectScreen
      onNavigate={onNavigate}
      onStartStage={onStartStage}
      currentScreen={currentScreen}
    />
  );
};

export default GameBoard;
