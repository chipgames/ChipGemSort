export interface CanvasConfig {
  aspectRatio: number;
  maxWidth: number;
  pixelRatio: number;
  logicalWidth: number;
  logicalHeight: number;
}

export const DEFAULT_CANVAS_CONFIG = {
  aspectRatio: 16 / 9,
  maxWidth: 1200,
  pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  logicalWidth: 0,
  logicalHeight: 0,
};
