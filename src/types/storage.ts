export interface GameProgress {
  highestStage: number;
  unlockedStages: number[];
  stageRecords?: Record<number, { stars: number; moves: number }>;
}

export interface UserSettings {
  language: string;
  theme: "light" | "dark";
}
