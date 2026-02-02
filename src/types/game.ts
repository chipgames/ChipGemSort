/** 정렬 퍼즐용 젬 색상 (ChipPuzzleGame과 유사 6색) */
export type GemColor =
  | "red"
  | "yellow"
  | "blue"
  | "green"
  | "purple"
  | "orange";

/** 튜브(병) 하나: 위에서부터 쌓인 젬 색 목록 */
export interface Tube {
  id: string;
  gems: GemColor[]; // [0]=맨 위
  capacity: number;
}

/** 스테이지 설정 */
export interface StageConfig {
  stageNumber: number;
  tubes: Tube[];
  /** 풀 수 있는 배치인지 검증용 */
  solvable?: boolean;
}

/** 게임 상태 */
export interface SortGameState {
  tubes: Tube[];
  stageNumber: number;
  moves: number;
  selectedTubeIndex: number | null;
  isComplete: boolean;
}
