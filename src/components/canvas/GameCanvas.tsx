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

interface GameCanvasProps {
  tubes: Tube[];
  selectedTubeIndex: number | null;
  onTubeClick: (index: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  tubes,
  selectedTubeIndex,
  onTubeClick,
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

    const capacity = Math.max(4, ...tubes.map((t) => t.capacity));
    const numTubes = tubes.length;
    const availableW = size.w * 0.82;
    const availableH = size.h * 0.8;
    const gapRatio = 0.28;
    const tubeCellW = numTubes + (numTubes - 1) * gapRatio;
    const cellSize = Math.min(availableW / tubeCellW, availableH / capacity);
    const gap = cellSize * gapRatio;
    const gemSize = cellSize * 0.78;
    const totalW = numTubes * cellSize + (numTubes - 1) * gap;
    const totalH = cellSize * capacity;
    const marginX = (size.w - totalW) / 2;
    const marginY = (size.h - totalH) / 2;
    const topPadding = 0.22;
    const bottomPadding = 0.5;
    const contentTop = marginY + topPadding * cellSize;
    const contentBottom = marginY + totalH - bottomPadding * cellSize;

    const bg =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--canvas-bg")
        .trim() || "#1a1a1a";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, size.h);

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
  }, [size, tubes, selectedTubeIndex]);

  const getTubeIndexFromClientXY = useCallback(
    (clientX: number, _clientY: number): number | null => {
      const canvas = canvasRef.current;
      if (!canvas || tubes.length === 0) return null;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return null;
      const numTubes = tubes.length;
      const capacity = Math.max(4, ...tubes.map((t) => t.capacity));
      const availableW = w * 0.82;
      const availableH = h * 0.8;
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

  const lastHandledRef = useRef(0);
  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const now = Date.now();
      if (now - lastHandledRef.current < 150) return;
      lastHandledRef.current = now;
      const ti = getTubeIndexFromClientXY(clientX, clientY);
      if (ti !== null) onTubeClick(ti);
    },
    [getTubeIndexFromClientXY, onTubeClick]
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
