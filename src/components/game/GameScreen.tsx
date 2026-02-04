import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { storageManager } from "@/utils/storage";
import type { Tube } from "@/types/game";
import type { GameProgress } from "@/types/storage";
import { generateStage } from "@/utils/stageGenerator";
import { pour, isComplete } from "@/utils/gameLogic";
import { findHint } from "@/utils/hintFinder";
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
  const [history, setHistory] = useState<Tube[][]>([]);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);

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
        // 히스토리에 현재 상태 저장 (깊은 복사)
        setHistory((h) => [
          ...h,
          tubes.map((t) => ({ ...t, gems: [...t.gems] })),
        ]);
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
      setHint(null); // 이동 후 힌트 제거
    },
    [tubes, selectedTubeIndex, completed, stageNumber]
  );

  useEffect(() => {
    setTubes(generateStage(stageNumber));
    setSelectedTubeIndex(null);
    setMoves(0);
    setCompleted(false);
    setHistory([]);
    setHint(null);
  }, [stageNumber]);

  const handleRetry = useCallback(() => {
    setTubes(generateStage(stageNumber));
    setSelectedTubeIndex(null);
    setMoves(0);
    setCompleted(false);
    setHistory([]);
  }, [stageNumber]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || completed) return;
    const previous = history[history.length - 1];
    setTubes(previous.map((t) => ({ ...t, gems: [...t.gems] })));
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
    setSelectedTubeIndex(null);
    setHint(null); // Undo 후 힌트 제거
  }, [history, completed]);

  const handleHint = useCallback(() => {
    if (completed) return;
    const hintMove = findHint(tubes);
    if (hintMove) {
      setHint(hintMove);
      // 3초 후 힌트 자동 제거
      setTimeout(() => {
        setHint((current) => (current === hintMove ? null : current));
      }, 3000);
    }
  }, [tubes, completed]);

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
          onUndo={handleUndo}
          onHint={handleHint}
          canUndo={history.length > 0 && !completed}
          hint={hint}
          stageLabel={t("game.stage")}
          movesLabel={t("game.moves")}
          backLabel={t("game.back")}
          retryLabel={t("game.retry")}
          undoLabel={t("game.undo")}
          hintLabel={t("game.hint")}
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
