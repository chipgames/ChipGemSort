import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { storageManager } from "@/utils/storage";
import type { GameProgress } from "@/types/storage";
import type { GameScreen } from "@/types/ui";
import { GAME_CONFIG } from "@/constants/gameConfig";
import { PROGRESS_KEY } from "@/components/game/gameBoardStorage";
import "./StageSelectScreen.css";

interface StageSelectScreenProps {
  onNavigate?: (screen: GameScreen) => void;
  onStartStage: (stageNumber: number) => void;
  currentScreen?: GameScreen;
}

const StageSelectScreen: React.FC<StageSelectScreenProps> = ({
  onStartStage,
  currentScreen = "stageSelect",
}) => {
  const { t } = useLanguage();
  const [unlockedStages, setUnlockedStages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const totalStages = GAME_CONFIG.totalStages;
  const stagesPerPage = GAME_CONFIG.stagesPerPage;
  const totalPages = Math.ceil(totalStages / stagesPerPage);

  useEffect(() => {
    if (currentScreen !== "stageSelect") return;
    const progress = storageManager.get<GameProgress>(PROGRESS_KEY, {
      fallback: null,
    });
    if (progress?.highestStage != null) {
      const highest = Math.max(1, progress.highestStage);
      setUnlockedStages(highest);
      setCurrentPage(Math.ceil(highest / stagesPerPage));
    } else {
      setUnlockedStages(1);
      setCurrentPage(1);
    }
  }, [currentScreen, stagesPerPage]);

  const handleStageClick = (stageNumber: number) => {
    if (stageNumber <= unlockedStages) onStartStage(stageNumber);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const startStage = (currentPage - 1) * stagesPerPage + 1;
  const endStage = Math.min(startStage + stagesPerPage - 1, totalStages);

  return (
    <div className="stage-select-screen">
      <div className="stage-select-header">
        <h2 className="stage-select-title">{t("stageSelect.title")}</h2>
      </div>
      <div className="stage-grid">
        {Array.from({ length: endStage - startStage + 1 }, (_, i) => {
          const num = startStage + i;
          const isUnlocked = num <= unlockedStages;
          return (
            <button
              key={num}
              type="button"
              className={`stage-card ${isUnlocked ? "unlocked" : "locked"}`}
              onClick={() => handleStageClick(num)}
              disabled={!isUnlocked}
            >
              <span className="stage-number">{num}</span>
              {!isUnlocked && (
                <span className="stage-lock" aria-hidden>
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="pagination-container">
        <span className="pagination-info">
          {t("stageSelect.page")} {currentPage} / {totalPages}
        </span>
        <div className="pagination">
          <button
            type="button"
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            type="button"
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageSelectScreen;
