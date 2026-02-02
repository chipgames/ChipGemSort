import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { storageManager } from "@/utils/storage";
import type { Tube } from "@/types/game";
import type { GameProgress } from "@/types/storage";
import { generateStage } from "@/utils/stageGenerator";
import { pour, isComplete } from "@/utils/gameLogic";
import GameCanvas from "@/components/canvas/GameCanvas";
import { PROGRESS_KEY } from "@/components/game/gameBoardStorage";
import "./GameScreen.css";

interface GameScreenProps {
  stageNumber: number;
  onBack: () => void;
  onNextStage: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  stageNumber,
  onBack,
  onNextStage,
}) => {
  const { t } = useLanguage();
  const [tubes, setTubes] = useState<Tube[]>(() => generateStage(stageNumber));
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(
    null
  );
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleTubeClick = useCallback(
    (index: number) => {
      if (completed) return;
      if (selectedTubeIndex === null) {
        if (tubes[index].gems.length > 0) setSelectedTubeIndex(index);
        return;
      }
      if (selectedTubeIndex === index) {
        setSelectedTubeIndex(null);
        return;
      }
      const next = pour(tubes, selectedTubeIndex, index);
      if (next) {
        setTubes(next);
        setMoves((m) => m + 1);
        if (isComplete(next)) {
          setCompleted(true);
          const progress = storageManager.get<GameProgress>(PROGRESS_KEY, {
            fallback: null,
          });
          const highest = Math.max(
            progress?.highestStage ?? 1,
            stageNumber + 1
          );
          storageManager.set(PROGRESS_KEY, {
            highestStage: highest,
            unlockedStages: Array.from({ length: highest }, (_, i) => i + 1),
          });
        }
      }
      setSelectedTubeIndex(null);
    },
    [tubes, selectedTubeIndex, completed, stageNumber]
  );

  useEffect(() => {
    setTubes(generateStage(stageNumber));
    setSelectedTubeIndex(null);
    setMoves(0);
    setCompleted(false);
  }, [stageNumber]);

  const handleRetry = useCallback(() => {
    setTubes(generateStage(stageNumber));
    setSelectedTubeIndex(null);
    setMoves(0);
    setCompleted(false);
  }, [stageNumber]);

  return (
    <div className="game-screen">
      <div className="game-board">
        <GameCanvas
          tubes={tubes}
          selectedTubeIndex={selectedTubeIndex}
          onTubeClick={handleTubeClick}
          stageNumber={stageNumber}
          moves={moves}
          onBack={onBack}
          onRetry={handleRetry}
          stageLabel={t("game.stage")}
          movesLabel={t("game.moves")}
          backLabel={t("game.back")}
          retryLabel={t("game.retry")}
        />
      </div>
      {completed && (
        <div className="game-screen-complete">
          <p>{t("game.complete")}</p>
          <div className="game-screen-complete-actions">
            <button type="button" onClick={onBack}>
              {t("game.back")}
            </button>
            <button type="button" className="primary" onClick={onNextStage}>
              {t("game.nextStage")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
