import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { storageManager } from "@/utils/storage";
import type { GameProgress } from "@/types/storage";
import type { GameScreen } from "@/types/ui";
import { GAME_CONFIG } from "@/constants/gameConfig";
import { PROGRESS_KEY } from "@/components/game/gameBoardStorage";
import { StageSelectCanvas } from "@/components/canvas/StageSelectCanvas";
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
  const [stageRecords, setStageRecords] = useState<
    Record<number, { stars: number; moves: number }>
  >({});

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
    setStageRecords(progress?.stageRecords ?? {});
  }, [currentScreen, stagesPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="stage-select-screen">
      <StageSelectCanvas
        title={t("stageSelect.title")}
        unlockedStages={unlockedStages}
        currentPage={currentPage}
        totalPages={totalPages}
        totalStages={totalStages}
        stagesPerPage={stagesPerPage}
        stageRecords={stageRecords}
        onStartStage={onStartStage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default StageSelectScreen;
