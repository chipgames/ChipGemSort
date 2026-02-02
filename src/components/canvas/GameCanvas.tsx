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

/** 투명 유리 시험관 형태로 튜브 영역 그리기 (참고 이미지: 두꺼운 유리, 림, 하이라이트·그림자로 시인성 강화) */
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
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fill();

  // 2) 시험관 몸통
  ctx.beginPath();
  tubePath(ctx, x, y, w, h, topR, r);
  ctx.closePath();

  // 유리 채우기: 푸르스름한 흰색 톤 + 시인성 위해 조금 더 진하게
  ctx.fillStyle = "rgba(220, 230, 255, 0.14)";
  ctx.fill();

  // 3) 바깥쪽 테두리 (유리 두께 느낌, 라이트/다크 배경 모두에서 보이도록)
  ctx.strokeStyle = "rgba(90, 100, 130, 0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4) 안쪽 밝은 테두리 (유리 림)
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

  // 5) 입구 림: 바깥쪽 어두운 선 + 안쪽 흰색 하이라이트 (두께 강조)
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

  // 6) 왼쪽 가장자리 하이라이트 (유리 반사, 참고 이미지처럼 뚜렷하게)
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
  grad.addColorStop(0.25, "rgba(255, 255, 255, 0.2)");
  grad.addColorStop(0.6, "rgba(255, 255, 255, 0.06)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 2.5, y + topR);
  ctx.lineTo(x + 2.5, y + h - r);
  ctx.stroke();

  // 7) 둥근 바닥 하이라이트 (유리 두께)
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
    const cellSize = Math.min(availableW / numTubes, availableH / capacity);
    const gemSize = cellSize * 0.78;
    const totalW = cellSize * numTubes;
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

    // 1) 모든 튜브를 투명 유리 시험관 형태로 먼저 그림
    tubes.forEach((tube, ti) => {
      const tubeLeft = marginX + ti * cellSize;
      const tubeTop = marginY;
      const tubeW = cellSize;
      const tubeH = cellSize * capacity;
      drawTube(ctx, tubeLeft + 3, tubeTop + 3, tubeW - 6, tubeH - 6);
    });

    // 2) 젬 그리기 (contentTop~contentBottom 안에 넣어 시험관 밖으로 안 나가게)
    const slotHeight =
      (contentBottom - contentTop - gemSize) / Math.max(1, capacity - 1);
    tubes.forEach((tube, ti) => {
      const baseX = marginX + ti * cellSize + (cellSize - gemSize) / 2;
      const baseY = contentBottom - gemSize / 2;
      const tubeLeft = marginX + ti * cellSize;
      const tubeTop = marginY;

      tube.gems.forEach((color, gi) => {
        const y = baseY - gi * slotHeight;
        drawGem(ctx, color, baseX, y, gemSize, gemSize);
      });

      if (selectedTubeIndex === ti) {
        ctx.strokeStyle = "var(--accent-primary)";
        ctx.lineWidth = 4;
        ctx.strokeRect(
          tubeLeft - 2,
          tubeTop - 2,
          cellSize + 4,
          cellSize * capacity + 4
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
      const availableW = w * 0.9;
      const availableH = h * 0.85;
      const cellSize = Math.min(availableW / numTubes, availableH / capacity);
      const totalW = cellSize * numTubes;
      const marginX = (w - totalW) / 2;
      const x = clientX - rect.left;
      for (let ti = 0; ti < numTubes; ti++) {
        const left = marginX + ti * cellSize;
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
