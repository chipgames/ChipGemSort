import React, { useRef, useEffect, useState, useCallback } from "react";
import type { Tube } from "@/types/game";
import { drawGem } from "./GemRenderer";
import "./GameCanvas.css";

const ASPECT_RATIO = 16 / 9;

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
const MIN_HEIGHT = Math.floor(MIN_WIDTH / ASPECT_RATIO);

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
  stageLabel: string;
  movesLabel: string;
  backLabel: string;
  retryLabel: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  tubes,
  selectedTubeIndex,
  onTubeClick,
  stageNumber,
  moves,
  onBack,
  onRetry,
  stageLabel,
  movesLabel,
  backLabel,
  retryLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: MIN_WIDTH, h: MIN_HEIGHT });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      const cw = Math.max(container.clientWidth || 0, MIN_WIDTH);
      const ch = Math.max(container.clientHeight || 0, MIN_HEIGHT);
      const maxW = Math.min(cw, MAX_WIDTH);
      const maxH = maxW / ASPECT_RATIO;
      let w = maxW;
      let h = maxH;
      if (ch < h) {
        h = ch;
        w = h * ASPECT_RATIO;
      }
      w = Math.max(MIN_WIDTH, Math.floor(w));
      h = Math.max(MIN_HEIGHT, Math.floor(h));
      setSize({ w, h });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const headerHeight = getHeaderHeight(size.h);
    const gameAreaH = size.h - headerHeight;
    const capacity = Math.max(4, ...tubes.map((t) => t.capacity));
    const numTubes = tubes.length;
    const availableW = size.w * 0.82;
    const availableH = gameAreaH * 0.8;
    const gapRatio = 0.28;
    const tubeCellW = numTubes + (numTubes - 1) * gapRatio;
    const cellSize = Math.min(availableW / tubeCellW, availableH / capacity);
    const gap = cellSize * gapRatio;
    const gemSize = cellSize * 0.78;
    const totalW = numTubes * cellSize + (numTubes - 1) * gap;
    const totalH = cellSize * capacity;
    const marginX = (size.w - totalW) / 2;
    const marginY = headerHeight + (gameAreaH - totalH) / 2;
    const topPadding = 0.22;
    const bottomPadding = 0.5;
    const contentTop = marginY + topPadding * cellSize;
    const contentBottom = marginY + totalH - bottomPadding * cellSize;

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

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, size.h);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, headerHeight);
    const headerGrad = ctx.createLinearGradient(0, 0, 0, headerHeight);
    headerGrad.addColorStop(0, "rgba(255,255,255,0.06)");
    headerGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
    headerGrad.addColorStop(1, "transparent");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, size.w, headerHeight);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, size.w / 600);
    ctx.beginPath();
    ctx.moveTo(0, headerHeight);
    ctx.lineTo(size.w, headerHeight);
    ctx.stroke();

    const base = Math.min(size.w, size.h);
    const titleFont = Math.max(11, Math.min(16, Math.round(base * 0.042)));
    const btnFont = Math.max(10, Math.min(14, Math.round(base * 0.036)));
    const padH = size.w * 0.032;
    const fontFamily =
      "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
    ctx.font = `600 ${btnFont}px ${fontFamily}`;
    const minWRetry = ctx.measureText(retryLabel).width + 44;
    ctx.font = `500 ${btnFont}px ${fontFamily}`;
    const minWBack = ctx.measureText(backLabel).width + 44;
    const btnWidth = Math.max(
      88,
      Math.round(size.w * 0.2),
      Math.ceil(minWRetry),
      Math.ceil(minWBack)
    );
    const btnGap = size.w * 0.02;
    const btnTop = headerHeight * 0.1;
    const btnH = headerHeight * 0.8;
    const btnRadius = Math.min(10, btnH * 0.4);

    const textShadowBlur = Math.max(2, size.w / 350);
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
    ctx.font = `600 ${titleFont}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.fillText(`${stageLabel} ${stageNumber}`, padH, headerHeight / 2);
    ctx.font = `500 ${titleFont}px ${fontFamily}`;
    ctx.fillStyle = textSecondary;
    const movesX = padH + size.w * 0.24;
    ctx.fillText(`${movesLabel}: ${moves}`, movesX, headerHeight / 2);
    ctx.restore();

    const retryLeft = size.w - padH - btnWidth;
    const backLeft = size.w - padH - btnWidth - btnGap - btnWidth;

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
    ctx.fillText(backLabel, backLeft + btnWidth / 2, headerHeight / 2);
    ctx.restore();

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
    ctx.fillText(retryLabel, retryLeft + btnWidth / 2, headerHeight / 2);
    ctx.restore();

    ctx.textAlign = "left";

    const tubeLeft = (ti: number) => marginX + ti * (cellSize + gap);

    // 1) 모든 튜브를 투명 유리 시험관 형태로 먼저 그림
    tubes.forEach((_, ti) => {
      const left = tubeLeft(ti);
      const tubeTop = marginY;
      const tubeW = cellSize;
      const tubeH = cellSize * capacity;
      drawTube(ctx, left + 3, tubeTop + 3, tubeW - 6, tubeH - 6);
    });

    // 2) 젬 그리기 (contentTop~contentBottom 안에 넣어 시험관 밖으로 안 나가게)
    const slotHeight =
      (contentBottom - contentTop - gemSize) / Math.max(1, capacity - 1);
    tubes.forEach((tube, ti) => {
      const left = tubeLeft(ti);
      const baseX = left + (cellSize - gemSize) / 2;
      const baseY = contentBottom - gemSize / 2;

      tube.gems.forEach((color, gi) => {
        const y = baseY - gi * slotHeight;
        drawGem(ctx, color, baseX, y, gemSize, gemSize);
      });

      if (selectedTubeIndex === ti) {
        drawTubeSelectionGlow(
          ctx,
          left + 3,
          marginY + 3,
          cellSize - 6,
          cellSize * capacity - 6
        );
      }
    });
  }, [
    size,
    tubes,
    selectedTubeIndex,
    stageNumber,
    moves,
    stageLabel,
    movesLabel,
    backLabel,
    retryLabel,
  ]);

  const getTubeIndexFromClientXY = useCallback(
    (clientX: number, clientY: number): number | null => {
      const canvas = canvasRef.current;
      if (!canvas || tubes.length === 0) return null;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return null;
      const y = clientY - rect.top;
      const headerHeight = getHeaderHeight(h);
      if (y < headerHeight) return null;
      const gameAreaH = h - headerHeight;
      const numTubes = tubes.length;
      const capacity = Math.max(4, ...tubes.map((t) => t.capacity));
      const availableW = w * 0.82;
      const availableH = gameAreaH * 0.8;
      const gapRatio = 0.28;
      const tubeCellW = numTubes + (numTubes - 1) * gapRatio;
      const cellSize = Math.min(availableW / tubeCellW, availableH / capacity);
      const gap = cellSize * gapRatio;
      const totalW = numTubes * cellSize + (numTubes - 1) * gap;
      const marginX = (w - totalW) / 2;
      const x = clientX - rect.left;
      for (let ti = 0; ti < numTubes; ti++) {
        const left = marginX + ti * (cellSize + gap);
        if (x >= left && x <= left + cellSize) {
          return ti;
        }
      }
      return null;
    },
    [tubes.length]
  );

  const getHeaderHit = useCallback(
    (clientX: number, clientY: number): "back" | "retry" | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const headerHeight = getHeaderHeight(h);
      if (y < 0 || y >= headerHeight) return null;
      const padH = w * 0.032;
      const btnWidth = Math.max(96, Math.round(w * 0.2));
      const btnGap = w * 0.02;
      const btnTop = headerHeight * 0.1;
      const btnH = headerHeight * 0.8;
      const retryLeft = w - padH - btnWidth;
      const backLeft = w - padH - btnWidth - btnGap - btnWidth;
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
      return null;
    },
    []
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
      const ti = getTubeIndexFromClientXY(clientX, clientY);
      if (ti !== null) onTubeClick(ti);
    },
    [getHeaderHit, getTubeIndexFromClientXY, onTubeClick, onBack, onRetry]
  );

  return (
    <div ref={containerRef} className="game-canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="game-canvas"
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
        aria-label="Game board"
      />
    </div>
  );
};

export default GameCanvas;
