import React, { useRef, useEffect, useState, useCallback } from "react";
import type { Tube, GemColor } from "@/types/game";
import { drawGem } from "./GemRenderer";
import { useCanvasOrientation } from "@/contexts/CanvasOrientationContext";
import "./GameCanvas.css";

const ASPECT_RATIO_LANDSCAPE = 16 / 9;
const ASPECT_RATIO_PORTRAIT = 9 / 16;

/** 시험관 경로 생성 (공통) */
function tubePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  topR: number,
  r: number
): void {
  ctx.moveTo(x + topR, y);
  ctx.lineTo(x + w - topR, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + topR);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + topR);
  ctx.quadraticCurveTo(x, y, x + topR, y);
}

/** 투명 유리 시험관: 투명도 + 빛 반사 그라데이션으로 유리감 강화 */
function drawTube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const r = Math.min(w * 0.45, h * 0.12);
  const topR = Math.min(w * 0.2, 6);
  const shadowOff = 4;

  ctx.save();

  // 1) 오른쪽·아래 그림자 (3D로 떠 보이게)
  ctx.beginPath();
  tubePath(ctx, x + shadowOff, y + shadowOff, w, h, topR, r);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.fill();

  // 2) 시험관 몸통 — 투명하게 (배경이 비치도록)
  ctx.beginPath();
  tubePath(ctx, x, y, w, h, topR, r);
  ctx.closePath();
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
  bodyGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
  bodyGrad.addColorStop(0.3, "rgba(240, 248, 255, 0.035)");
  bodyGrad.addColorStop(0.6, "rgba(230, 240, 255, 0.025)");
  bodyGrad.addColorStop(1, "rgba(210, 225, 240, 0.04)");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 3) 왼쪽 빛 반사 — 시험관 절반(50%) 너비, 그라데이션이 확실히 보이도록 강도 상향
  ctx.beginPath();
  tubePath(ctx, x, y, w, h, topR, r);
  ctx.closePath();
  const reflectWidth = w * 0.5;
  const reflectGrad = ctx.createLinearGradient(x, y, x + reflectWidth, y);
  reflectGrad.addColorStop(0, "rgba(255, 255, 255, 0.42)");
  reflectGrad.addColorStop(0.15, "rgba(255, 255, 255, 0.3)");
  reflectGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.15)");
  reflectGrad.addColorStop(0.55, "rgba(255, 255, 255, 0.05)");
  reflectGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = reflectGrad;
  ctx.fill();

  // 4) 바깥쪽 테두리 (유리 두께, 투명감 유지)
  ctx.beginPath();
  tubePath(ctx, x, y, w, h, topR, r);
  ctx.closePath();
  ctx.strokeStyle = "rgba(100, 115, 145, 0.38)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 5) 안쪽 밝은 테두리 (유리 림)
  ctx.beginPath();
  tubePath(
    ctx,
    x + 1.5,
    y + 1.5,
    w - 3,
    h - 3,
    Math.max(0, topR - 1.5),
    Math.max(2, r - 1.5)
  );
  ctx.closePath();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 6) 입구 림: 바깥쪽 어두운 선 + 안쪽 흰색 하이라이트 (두께 강조)
  ctx.beginPath();
  ctx.moveTo(x + topR, y);
  ctx.lineTo(x + w - topR, y);
  ctx.strokeStyle = "rgba(70, 80, 110, 0.5)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + topR, y + 1.5);
  ctx.lineTo(x + w - topR, y + 1.5);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 7) 왼쪽 가장자리 보조 하이라이트 (얇은 선은 최소화 — 넓은 그라데이션이 주인상)
  const edgeGrad = ctx.createLinearGradient(x, y, x, y + h);
  edgeGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
  edgeGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
  edgeGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.strokeStyle = edgeGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + topR);
  ctx.lineTo(x + 2, y + h - r);
  ctx.stroke();

  // 8) 둥근 바닥 하이라이트 (유리 두께)
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2,
    y + h - r * 0.5,
    w / 2 - 2,
    r * 0.6,
    0,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/** 선택된 시험관: 시험관 윤곽을 따르는 불빛(글로우) 테두리 */
function drawTubeSelectionGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const r = Math.min(w * 0.45, h * 0.12);
  const topR = Math.min(w * 0.2, 6);
  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim() || "#a8b5ff";

  ctx.save();

  ctx.beginPath();
  tubePath(ctx, x, y, w, h, topR, r);
  ctx.closePath();

  ctx.shadowColor = accent;
  ctx.shadowBlur = 32;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}

const MAX_WIDTH = 1200;
const MIN_WIDTH = 280;
const MIN_HEIGHT_LANDSCAPE = Math.floor(MIN_WIDTH / ASPECT_RATIO_LANDSCAPE);
const MIN_HEIGHT_PORTRAIT = Math.floor(MIN_WIDTH / ASPECT_RATIO_PORTRAIT);

/** 헤더 높이: 게임 영역이 주인공이 되도록 얇게 (데스크/모바일 균형) */
function getHeaderHeight(canvasHeight: number): number {
  return Math.round(Math.max(28, Math.min(42, canvasHeight * 0.065)));
}

interface GameCanvasProps {
  tubes: Tube[];
  selectedTubeIndex: number | null;
  onTubeClick: (index: number) => void;
  stageNumber: number;
  moves: number;
  onBack: () => void;
  onRetry: () => void;
  onUndo?: () => void;
  onHint?: () => void;
  canUndo?: boolean;
  hint?: { from: number; to: number } | null;
  /** 이동 애니메이션 중일 때 (출발·도착 인덱스, 색). progress 0~1 */
  animatingMove?: {
    fromIndex: number;
    toIndex: number;
    color: GemColor;
  } | null;
  animationProgress?: number;
  stageLabel: string;
  movesLabel: string;
  backLabel: string;
  retryLabel: string;
  undoLabel: string;
  hintLabel: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  tubes,
  selectedTubeIndex,
  onTubeClick,
  stageNumber,
  moves,
  onBack,
  onRetry,
  onUndo,
  onHint,
  canUndo = false,
  hint = null,
  animatingMove = null,
  animationProgress = 0,
  stageLabel,
  movesLabel,
  backLabel,
  retryLabel,
  undoLabel,
  hintLabel,
}) => {
  const { orientation } = useCanvasOrientation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const aspectRatio =
    orientation === "landscape"
      ? ASPECT_RATIO_LANDSCAPE
      : ASPECT_RATIO_PORTRAIT;
  const minHeight =
    orientation === "landscape"
      ? MIN_HEIGHT_LANDSCAPE
      : MIN_HEIGHT_PORTRAIT;
  const [size, setSize] = useState({ w: MIN_WIDTH, h: minHeight });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      // CSS aspect-ratio가 적용된 컨테이너의 실제 크기 사용
      const cw = Math.max(container.clientWidth || 0, MIN_WIDTH);
      const ch = Math.max(container.clientHeight || 0, minHeight);

      // 선택된 비율 강제 유지
      const maxW = Math.min(cw, MAX_WIDTH);
      const idealH = maxW / aspectRatio;
      let w = maxW;
      let h = idealH;

      // 높이가 제한되면 너비를 비율에 맞춤
      if (ch < idealH) {
        h = ch;
        w = h * aspectRatio;
        // 너비가 컨테이너를 넘지 않도록
        if (w > cw) {
          w = cw;
          h = w / aspectRatio;
        }
      }

      w = Math.max(MIN_WIDTH, Math.floor(w));
      h = Math.max(minHeight, Math.floor(h));
      setSize({ w, h });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [aspectRatio, minHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const baseDpr = window.devicePixelRatio || 1;
    const dpr = tubes.length > 14 ? Math.min(2, baseDpr) : baseDpr;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // 세로 모드일 때는 가로/세로를 스왑하여 계산
    const effectiveW = orientation === "portrait" ? size.h : size.w;
    const effectiveH = orientation === "portrait" ? size.w : size.h;
    const effectiveHeaderHeight = getHeaderHeight(effectiveH);
    const gameAreaH = effectiveH - effectiveHeaderHeight;
    const capacity = Math.max(4, ...tubes.map((t) => t.capacity));
    const numTubes = tubes.length;
    const gapRatio = 0.28;
    
    // 가로 모드 레이아웃 사용 (회전 후에도 동일한 레이아웃)
    const availableW = effectiveW * 0.82;
    const availableH = gameAreaH * 0.8;
    const tubeCellW = numTubes + (numTubes - 1) * gapRatio;
    const cellSizeByWidth = availableW / tubeCellW;
    const cellSizeByHeight = availableH / capacity;
    const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
    const gap = cellSize * gapRatio;
    const totalW = numTubes * cellSize + (numTubes - 1) * gap;
    const totalH = cellSize * capacity;
    const marginX = (effectiveW - totalW) / 2;
    const marginY = effectiveHeaderHeight + (gameAreaH - totalH) / 2;
    const topPadding = 0.22;
    const bottomPadding = 0.5;
    const contentTop = marginY + topPadding * cellSize;
    const contentBottom = marginY + totalH - bottomPadding * cellSize;
    
    const gemSize = cellSize * 0.6;

    const bg =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--canvas-bg")
        .trim() || "#1a1a1a";
    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-primary")
        .trim() || "#1a1a1a";
    const textSecondary =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-secondary")
        .trim() || textColor;
    const borderColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--border-color")
        .trim() || "rgba(0,0,0,0.2)";
    const accentPrimary =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim() || "#7c8aff";
    const bgCard =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-card")
        .trim() || "rgba(255,255,255,0.95)";

    // 세로 모드일 때는 전체 Canvas를 90도 회전하여 그리기
    if (orientation === "portrait") {
      ctx.save();
      // Canvas 중심을 기준으로 90도 회전
      ctx.translate(size.w / 2, size.h / 2);
      ctx.rotate(Math.PI / 2);
      // 회전 후 좌표계를 조정 (가로/세로 스왑)
      ctx.translate(-size.h / 2, -size.w / 2);
    }

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, effectiveW, effectiveH);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, effectiveW, effectiveHeaderHeight);
    const headerGrad = ctx.createLinearGradient(0, 0, 0, effectiveHeaderHeight);
    headerGrad.addColorStop(0, "rgba(255,255,255,0.06)");
    headerGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
    headerGrad.addColorStop(1, "transparent");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, effectiveW, effectiveHeaderHeight);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, effectiveW / 600);
    ctx.beginPath();
    ctx.moveTo(0, effectiveHeaderHeight);
    ctx.lineTo(effectiveW, effectiveHeaderHeight);
    ctx.stroke();

    const base = Math.min(effectiveW, effectiveH);
    const isMobile = effectiveW <= 600;
    const titleFont = Math.max(11, Math.min(16, Math.round(base * 0.042)));
    // 모바일에서는 버튼 폰트를 더 작게
    const btnFont = isMobile
      ? Math.max(9, Math.min(12, Math.round(base * 0.032)))
      : Math.max(10, Math.min(14, Math.round(base * 0.036)));
    const padH = effectiveW * 0.032;
    const fontFamily =
      "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
    ctx.font = `600 ${btnFont}px ${fontFamily}`;
    // 모바일에서는 패딩을 더 줄임 (24 -> 16), 데스크톱도 줄임 (44 -> 32)
    const minWRetry = ctx.measureText(retryLabel).width + (isMobile ? 16 : 32);
    ctx.font = `500 ${btnFont}px ${fontFamily}`;
    const minWBack = ctx.measureText(backLabel).width + (isMobile ? 16 : 32);
    const minWUndo = onUndo
      ? ctx.measureText(undoLabel).width + (isMobile ? 16 : 32)
      : 0;
    const minWHint = onHint
      ? ctx.measureText(hintLabel).width + (isMobile ? 16 : 32)
      : 0;
    // 모바일에서는 버튼 너비를 더 줄임 (60 -> 50), 데스크톱도 줄임 (88 -> 75)
    const btnWidth = isMobile
      ? Math.max(
          50,
          Math.ceil(Math.max(minWRetry, minWBack, minWUndo, minWHint))
        )
      : Math.max(
          75,
          Math.round(size.w * 0.16), // 화면 너비의 20% -> 16%로 감소
          Math.ceil(minWRetry),
          Math.ceil(minWBack),
          Math.ceil(minWUndo),
          Math.ceil(minWHint)
        );
    // 모바일에서는 버튼 간격을 더 줄임 (0.01 -> 0.008), 데스크톱도 줄임 (0.02 -> 0.015)
    const btnGap = isMobile ? effectiveW * 0.008 : effectiveW * 0.015;
    const btnTop = effectiveHeaderHeight * 0.1;
    const btnH = effectiveHeaderHeight * 0.8;
    const btnRadius = Math.min(10, btnH * 0.4);

    const textShadowBlur = Math.max(2, effectiveW / 350);
    const textShadowY = 1;

    const drawRoundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = textShadowBlur;
    ctx.shadowOffsetY = textShadowY;
    // 버튼 위치 먼저 계산 (이동 텍스트 위치 결정에 필요)
    const retryLeft = effectiveW - padH - btnWidth;
    const backLeft = effectiveW - padH - btnWidth - btnGap - btnWidth;
    const undoLeft = onUndo
      ? effectiveW - padH - btnWidth - btnGap - btnWidth - btnGap - btnWidth
      : backLeft;
    const hintLeft = onHint
      ? effectiveW -
        padH -
        btnWidth -
        btnGap -
        btnWidth -
        btnGap -
        btnWidth -
        (onUndo ? btnGap + btnWidth : 0)
      : undoLeft;

    ctx.font = `600 ${titleFont}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.fillText(`${stageLabel} ${stageNumber}`, padH, effectiveHeaderHeight / 2);
    ctx.font = `500 ${titleFont}px ${fontFamily}`;
    ctx.fillStyle = textSecondary;
    // 이동 텍스트 위치: 가장 왼쪽 버튼과 겹치지 않도록 조정
    const stageTextWidth = ctx.measureText(
      `${stageLabel} ${stageNumber}`
    ).width;
    const movesTextWidth = ctx.measureText(`${movesLabel}: ${moves}`).width;
    const minMovesX = padH + stageTextWidth + effectiveW * 0.02; // 스테이지 텍스트와 간격
    // 버튼 개수에 따라 최대 위치 조정
    const buttonCount = (onHint ? 1 : 0) + (onUndo ? 1 : 0) + 2; // 힌트 + 실행취소 + 돌아가기 + 다시하기
    const totalButtonWidth =
      buttonCount * btnWidth + (buttonCount - 1) * btnGap;
    const btnMargin = isMobile ? effectiveW * 0.02 : effectiveW * 0.04; // 데스크톱에서 이동 텍스트가 버튼에 가려지지 않도록 여유 확보
    const maxMovesX =
      effectiveW - padH - totalButtonWidth - movesTextWidth - btnMargin;
    // 데스크톱에서도 버튼 위치를 고려하여 이동 텍스트 위치 조정
    const movesX = isMobile
      ? Math.min(padH + effectiveW * 0.15, maxMovesX - effectiveW * 0.01) // 모바일: 더 왼쪽
      : Math.min(padH + effectiveW * 0.24, maxMovesX); // 데스크톱: 버튼과 충분한 간격
    ctx.fillText(
      `${movesLabel}: ${moves}`,
      Math.max(minMovesX, movesX),
      effectiveHeaderHeight / 2
    );
    ctx.restore();

    const shadowBlur = Math.max(4, size.w / 120);
    const shadowY = Math.max(2, size.w / 400);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowY;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, size.w / 450);
    ctx.fillStyle = bgCard;
    drawRoundRect(backLeft, btnTop, btnWidth, btnH, btnRadius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = textShadowBlur;
    ctx.shadowOffsetY = textShadowY;
    ctx.font = `500 ${btnFont}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(backLabel, backLeft + btnWidth / 2, effectiveHeaderHeight / 2);
    ctx.restore();

    if (onUndo) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.12)";
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowY;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, size.w / 450);
      ctx.fillStyle = canUndo ? bgCard : "rgba(128,128,128,0.3)";
      drawRoundRect(undoLeft, btnTop, btnWidth, btnH, btnRadius);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = textShadowBlur;
      ctx.shadowOffsetY = textShadowY;
      ctx.font = `500 ${btnFont}px ${fontFamily}`;
      ctx.fillStyle = canUndo ? textColor : "rgba(128,128,128,0.6)";
      ctx.textAlign = "center";
      ctx.fillText(undoLabel, undoLeft + btnWidth / 2, effectiveHeaderHeight / 2);
      ctx.restore();
    }

    if (onHint) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.12)";
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowY;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, size.w / 450);
      const hintGrad = ctx.createLinearGradient(
        hintLeft,
        btnTop,
        hintLeft + btnWidth,
        btnTop + btnH
      );
      hintGrad.addColorStop(0, "#ffd700");
      hintGrad.addColorStop(1, "#ffb300");
      ctx.fillStyle = hintGrad;
      drawRoundRect(hintLeft, btnTop, btnWidth, btnH, btnRadius);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = textShadowBlur;
      ctx.shadowOffsetY = textShadowY;
      ctx.font = `600 ${btnFont}px ${fontFamily}`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(hintLabel, hintLeft + btnWidth / 2, effectiveHeaderHeight / 2);
      ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowY;
    const retryGrad = ctx.createLinearGradient(
      retryLeft,
      btnTop,
      retryLeft + btnWidth,
      btnTop + btnH
    );
    retryGrad.addColorStop(0, accentPrimary);
    retryGrad.addColorStop(1, accentPrimary);
    ctx.fillStyle = retryGrad;
    drawRoundRect(retryLeft, btnTop, btnWidth, btnH, btnRadius);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = Math.max(1, size.w / 500);
    drawRoundRect(retryLeft, btnTop, btnWidth, btnH, btnRadius);
    ctx.stroke();
    ctx.save();
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = textShadowBlur;
    ctx.shadowOffsetY = textShadowY;
    ctx.font = `600 ${btnFont}px ${fontFamily}`;
    ctx.fillStyle = "#fff";
    ctx.fillText(retryLabel, retryLeft + btnWidth / 2, effectiveHeaderHeight / 2);
    ctx.restore();

    ctx.textAlign = "left";

    const tubePadding = Math.max(2, Math.min(3, cellSize * 0.05));
    
    // 가로 모드 레이아웃 사용 (회전 후에도 동일한 레이아웃)
    // 가로 모드: tubes가 가로로 배열
    const tubeLeft = (ti: number) => marginX + ti * (cellSize + gap);

      // 1) 모든 튜브를 투명 유리 시험관 형태로 먼저 그림
      tubes.forEach((_, ti) => {
        const left = tubeLeft(ti);
        const tubeTop = marginY;
        const tubeW = cellSize;
        const tubeH = cellSize * capacity;

        // 힌트 하이라이트
        if (hint && (hint.from === ti || hint.to === ti)) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(left - 4, tubeTop - 4, tubeW + 8, tubeH + 8);
          ctx.strokeStyle = "#ffd700";
          ctx.lineWidth = 4;
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }

        drawTube(
          ctx,
          left + tubePadding,
          tubeTop + tubePadding,
          tubeW - tubePadding * 2,
          tubeH - tubePadding * 2
        );
      });

      // 2) 젬 그리기
      const slotHeight =
        (contentBottom - contentTop - gemSize) / Math.max(1, capacity - 1);
      tubes.forEach((tube, ti) => {
        const left = tubeLeft(ti);
        const baseX = left + (cellSize - gemSize) / 2;
        const baseY = contentBottom - gemSize / 2;

        tube.gems.forEach((color, gi) => {
          if (
            animatingMove &&
            ti === animatingMove.fromIndex &&
            gi === tube.gems.length - 1
          )
            return;
          const y = baseY - gi * slotHeight;
          drawGem(ctx, color, baseX, y, gemSize, gemSize);
        });

        if (selectedTubeIndex === ti) {
          drawTubeSelectionGlow(
            ctx,
            left + tubePadding,
            marginY + tubePadding,
            cellSize - tubePadding * 2,
            cellSize * capacity - tubePadding * 2
          );
        }
      });

      // 3) 이동 애니메이션
      if (animatingMove && animationProgress >= 0 && animationProgress <= 1) {
        const fromLeft = tubeLeft(animatingMove.fromIndex);
        const toLeft = tubeLeft(animatingMove.toIndex);
        const fromX = fromLeft + (cellSize - gemSize) / 2;
        const toX = toLeft + (cellSize - gemSize) / 2;
        const baseY = contentBottom - gemSize / 2;
        const fromTube = tubes[animatingMove.fromIndex];
        const toTube = tubes[animatingMove.toIndex];
        const fromY =
          baseY - (fromTube ? fromTube.gems.length - 1 : 0) * slotHeight;
        const toY = baseY - (toTube ? toTube.gems.length : 0) * slotHeight;
        const x = fromX + (toX - fromX) * animationProgress;
        const y = fromY + (toY - fromY) * animationProgress;
        drawGem(ctx, animatingMove.color, x, y, gemSize, gemSize);
      }

    // 세로 모드일 때 회전 복원
    if (orientation === "portrait") {
      ctx.restore();
    }
  }, [
    size,
    tubes,
    selectedTubeIndex,
    animatingMove,
    animationProgress,
    stageNumber,
    moves,
    stageLabel,
    movesLabel,
    backLabel,
    retryLabel,
    undoLabel,
    hintLabel,
    onUndo,
    onHint,
    canUndo,
    hint,
    orientation,
  ]);

  const getTubeIndexFromClientXY = useCallback(
    (clientX: number, clientY: number): number | null => {
      const canvas = canvasRef.current;
      if (!canvas || tubes.length === 0) return null;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return null;
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      
      // 세로 모드일 때는 좌표를 회전 변환
      if (orientation === "portrait") {
        const tempX = x;
        x = y;
        y = w - tempX;
      }
      
      const effectiveW = orientation === "portrait" ? h : w;
      const effectiveH = orientation === "portrait" ? w : h;
      const effectiveHeaderHeight = getHeaderHeight(effectiveH);
      if (y < effectiveHeaderHeight) return null;
      const gameAreaH = effectiveH - effectiveHeaderHeight;
      const numTubes = tubes.length;
      const capacity = Math.max(4, ...tubes.map((t) => t.capacity));
      const gapRatio = 0.28;
      
      // 가로 모드 레이아웃 사용
      const availableW = effectiveW * 0.82;
      const availableH = gameAreaH * 0.8;
      const tubeCellW = numTubes + (numTubes - 1) * gapRatio;
      const cellSize = Math.min(availableW / tubeCellW, availableH / capacity);
      const gap = cellSize * gapRatio;
      const totalW = numTubes * cellSize + (numTubes - 1) * gap;
      const marginX = (effectiveW - totalW) / 2;
      for (let ti = 0; ti < numTubes; ti++) {
        const left = marginX + ti * (cellSize + gap);
        if (x >= left && x <= left + cellSize) {
          return ti;
        }
      }
      return null;
    },
    [tubes.length, orientation]
  );

  const getHeaderHit = useCallback(
    (
      clientX: number,
      clientY: number
    ): "back" | "retry" | "undo" | "hint" | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      
      // 세로 모드일 때는 좌표를 회전 변환
      if (orientation === "portrait") {
        const tempX = x;
        x = y;
        y = w - tempX;
      }
      
      const effectiveW = orientation === "portrait" ? h : w;
      const effectiveH = orientation === "portrait" ? w : h;
      const effectiveHeaderHeight = getHeaderHeight(effectiveH);
      if (y < 0 || y >= effectiveHeaderHeight) return null;
      const isMobile = effectiveW <= 600;
      const padH = effectiveW * 0.032;
      const base = Math.min(effectiveW, effectiveH);
      const btnFont = isMobile
        ? Math.max(9, Math.min(12, Math.round(base * 0.032)))
        : Math.max(10, Math.min(14, Math.round(base * 0.036)));
      const fontFamily =
        "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.font = `500 ${btnFont}px ${fontFamily}`;
      const minWBack = ctx.measureText(backLabel).width + (isMobile ? 16 : 32);
      const minWRetry =
        ctx.measureText(retryLabel).width + (isMobile ? 16 : 32);
      const minWUndo = onUndo
        ? ctx.measureText(undoLabel).width + (isMobile ? 16 : 32)
        : 0;
      const minWHint = onHint
        ? ctx.measureText(hintLabel).width + (isMobile ? 16 : 32)
        : 0;
      const btnWidth = isMobile
        ? Math.max(
            50,
            Math.ceil(Math.max(minWRetry, minWBack, minWUndo, minWHint))
          )
        : Math.max(75, Math.round(effectiveW * 0.16));
      const btnGap = isMobile ? effectiveW * 0.008 : effectiveW * 0.015;
      const btnTop = effectiveHeaderHeight * 0.1;
      const btnH = effectiveHeaderHeight * 0.8;
      const retryLeft = effectiveW - padH - btnWidth;
      const backLeft = effectiveW - padH - btnWidth - btnGap - btnWidth;
      const undoLeft = onUndo
        ? effectiveW - padH - btnWidth - btnGap - btnWidth - btnGap - btnWidth
        : backLeft;
      const hintLeft = onHint
        ? effectiveW -
          padH -
          btnWidth -
          btnGap -
          btnWidth -
          btnGap -
          btnWidth -
          (onUndo ? btnGap + btnWidth : 0)
        : undoLeft;
      if (
        x >= backLeft &&
        x < backLeft + btnWidth &&
        y >= btnTop &&
        y < btnTop + btnH
      )
        return "back";
      if (
        x >= retryLeft &&
        x < retryLeft + btnWidth &&
        y >= btnTop &&
        y < btnTop + btnH
      )
        return "retry";
      if (
        onUndo &&
        canUndo &&
        x >= undoLeft &&
        x < undoLeft + btnWidth &&
        y >= btnTop &&
        y < btnTop + btnH
      )
        return "undo";
      if (
        onHint &&
        x >= hintLeft &&
        x < hintLeft + btnWidth &&
        y >= btnTop &&
        y < btnTop + btnH
      )
        return "hint";
      return null;
    },
    [onUndo, onHint, canUndo, backLabel, retryLabel, undoLabel, hintLabel]
  );

  const lastHandledRef = useRef(0);
  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const now = Date.now();
      if (now - lastHandledRef.current < 150) return;
      lastHandledRef.current = now;
      const headerHit = getHeaderHit(clientX, clientY);
      if (headerHit === "back") {
        onBack();
        return;
      }
      if (headerHit === "retry") {
        onRetry();
        return;
      }
      if (headerHit === "undo" && onUndo) {
        onUndo();
        return;
      }
      if (headerHit === "hint" && onHint) {
        onHint();
        return;
      }
      const ti = getTubeIndexFromClientXY(clientX, clientY);
      if (ti !== null) onTubeClick(ti);
    },
    [
      getHeaderHit,
      getTubeIndexFromClientXY,
      onTubeClick,
      onBack,
      onRetry,
      onUndo,
      onHint,
    ]
  );

  const canvasAriaLabel = `${stageLabel} ${stageNumber}, ${movesLabel}: ${moves}`;

  return (
    <div
      ref={containerRef}
      className="game-canvas-wrapper"
      data-orientation={orientation}
    >
      <canvas
        ref={canvasRef}
        className="game-canvas"
        role="application"
        aria-label={canvasAriaLabel}
        tabIndex={0}
        onClick={(e) => handlePointer(e.clientX, e.clientY)}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerUp={(e) => {
          handlePointer(e.clientX, e.clientY);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          if (t) handlePointer(t.clientX, t.clientY);
        }}
        style={{ touchAction: "manipulation", pointerEvents: "auto" }}
      />
      <div
        className="game-canvas-a11y-actions"
        role="toolbar"
        aria-label={stageLabel}
      >
        <button type="button" onClick={onBack}>
          {backLabel}
        </button>
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-disabled={!canUndo}
          >
            {undoLabel}
          </button>
        )}
        {onHint && (
          <button type="button" onClick={onHint}>
            {hintLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
