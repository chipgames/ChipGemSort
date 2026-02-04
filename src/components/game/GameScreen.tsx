import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSound } from "@/hooks/useSound";
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
  const { playSound } = useSound();
  const [tubes, setTubes] = useState<Tube[]>(() => generateStage(stageNumber));
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(
    null
  );
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);
  const [animatingMove, setAnimatingMove] = useState<{
    fromIndex: number;
    toIndex: number;
    color: import("@/types/game").GemColor;
  } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const nextTubesRef = useRef<Tube[] | null>(null);
  const previousTubesRef = useRef<Tube[]>([]);
  const completedMovesRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const animationStartRef = useRef<number>(0);
  const [completedRecord, setCompletedRecord] = useState<{
    moves: number;
    stars: number;
    bestMoves: number;
  } | null>(null);

  const handleTubeClick = useCallback(
    (index: number) => {
      if (completed || animatingMove) return;
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
        playSound("move");
        completedMovesRef.current = moves + 1;
        const movedColor =
          tubes[selectedTubeIndex].gems[
            tubes[selectedTubeIndex].gems.length - 1
          ];
        nextTubesRef.current = next;
        previousTubesRef.current = tubes.map((t) => ({
          ...t,
          gems: [...t.gems],
        }));
        setAnimatingMove({
          fromIndex: selectedTubeIndex,
          toIndex: index,
          color: movedColor,
        });
        setAnimationProgress(0);
        animationStartRef.current = performance.now();
      }
      setSelectedTubeIndex(null);
      setHint(null);
    },
    [tubes, selectedTubeIndex, completed, stageNumber, animatingMove, playSound]
  );

  useEffect(() => {
    setTubes(generateStage(stageNumber));
    setSelectedTubeIndex(null);
    setMoves(0);
    setCompleted(false);
    setCompletedRecord(null);
    setHistory([]);
    setHint(null);
    setAnimatingMove(null);
    setAnimationProgress(0);
  }, [stageNumber]);

  const ANIM_DURATION_MS = 220;

  useEffect(() => {
    if (!animatingMove) return;
    const tick = (now: number) => {
      const elapsed = now - animationStartRef.current;
      const raw = Math.min(1, elapsed / ANIM_DURATION_MS);
      const eased = 1 - Math.pow(1 - raw, 1.4);
      setAnimationProgress(eased);
      if (eased < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        const next = nextTubesRef.current;
        const prev = previousTubesRef.current;
        if (next && prev.length > 0) {
          setHistory((h) => [...h, prev]);
          setTubes(next.map((t) => ({ ...t, gems: [...t.gems] })));
          setMoves((m) => m + 1);
          if (isComplete(next)) {
            const completedMoves = completedMovesRef.current;
            const totalGems = next.reduce((s, t) => s + t.gems.length, 0);
            const stars =
              completedMoves <= totalGems * 0.7
                ? 3
                : completedMoves <= totalGems * 1.0
                ? 2
                : 1;
            const progress = storageManager.get<GameProgress>(PROGRESS_KEY, {
              fallback: null,
            });
            const highest = Math.max(
              progress?.highestStage ?? 1,
              stageNumber + 1
            );
            const records = { ...(progress?.stageRecords ?? {}) };
            const prevRecord = records[stageNumber];
            if (
              !prevRecord ||
              completedMoves < prevRecord.moves ||
              (completedMoves === prevRecord.moves && stars > prevRecord.stars)
            ) {
              records[stageNumber] = { stars, moves: completedMoves };
            }
            storageManager.set(PROGRESS_KEY, {
              highestStage: highest,
              unlockedStages: Array.from({ length: highest }, (_, i) => i + 1),
              stageRecords: records,
            });
            setCompletedRecord({
              moves: completedMoves,
              stars,
              bestMoves: records[stageNumber]?.moves ?? completedMoves,
            });
            playSound("success");
            setCompleted(true);
          }
        }
        setAnimatingMove(null);
        setAnimationProgress(0);
        nextTubesRef.current = null;
      }
    };
    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [animatingMove, stageNumber, playSound]);

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
          animatingMove={animatingMove}
          animationProgress={animationProgress}
          stageLabel={t("game.stage")}
          movesLabel={t("game.moves")}
          backLabel={t("game.back")}
          retryLabel={t("game.retry")}
          undoLabel={t("game.undo")}
          hintLabel={t("game.hint")}
        />
      </div>
      {completed && (
        <div
          className="game-screen-complete"
          role="status"
          aria-live="polite"
          aria-label={t("game.complete")}
        >
          <p>{t("game.complete")}</p>
          {completedRecord && (
            <div className="game-screen-complete-stats">
              <span className="game-screen-stars" aria-hidden="true">
                {"★".repeat(completedRecord.stars)}
                {"☆".repeat(3 - completedRecord.stars)}
              </span>
              <span>
                {t("game.moves")}: {completedRecord.moves}
                {` · ${t("game.best")}: ${completedRecord.bestMoves}`}
              </span>
            </div>
          )}
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
