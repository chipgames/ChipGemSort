import type { GemColor } from "@/types/game";

export const GEM_COLORS: GemColor[] = [
  "red",
  "yellow",
  "blue",
  "green",
  "purple",
  "orange",
];

/** ChipPuzzleGame 스타일: light/dark 그라데이션 (파스텔 톤 조정 가능) */
export const GEM_COLOR_HEX: Record<GemColor, { light: string; dark: string }> =
  {
    red: { light: "#ff9aa2", dark: "#e85d6a" },
    yellow: { light: "#ffecd2", dark: "#fcb69f" },
    blue: { light: "#a1c4fd", dark: "#7b9cf9" },
    green: { light: "#b4f8c8", dark: "#7ed56f" },
    purple: { light: "#d4a5ff", dark: "#b388ff" },
    orange: { light: "#ffd89b", dark: "#ff9a76" },
  };
